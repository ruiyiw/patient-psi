import 'server-only'

import {
  createAI,
  getMutableAIState,
  getAIState,
  render,
  createStreamableValue
} from 'ai/rsc'

import { nanoid } from '@/lib/utils'
import { saveChat } from '@/app/actions'
import { SpinnerMessage, UserMessage, BotMessage } from '@/components/message'
import { Chat, AIMessage } from '@/lib/types'
import { auth } from '@/auth'
import { getPrompt } from '@/app/api/getDataFromKV'

// Initialize Ollama client
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.2';
const OLLAMA_API_BASE = process.env.OLLAMA_API_BASE || 'https://api.gemcity.xyz';

interface ChatCompletionOptions {
  messages: Array<{ role: string; content: string }>;
  model?: string;
  temperature?: number;
  stream?: boolean;
}

// Create a minimal Ollama client
const ollama = {
  apiKey: 'not-needed',
  organization: null as string | null,
  baseURL: OLLAMA_API_BASE,

  chat: {
    completions: {
      create: async ({ messages, model, temperature }: { 
        messages: Array<{ role: string; content: string }>;
        model?: string;
        temperature?: number;
      }) => {
        const MAX_RETRIES = 3;
        const INITIAL_RETRY_DELAY = 1000; // 1 second

        const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

        let retries = 0;
        
        while (true) {
          try {
            const response = await fetch(`${OLLAMA_API_BASE}/api/chat`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                model: model || OLLAMA_MODEL,
                messages,
                stream: true,
                temperature: temperature || 1.0,
              }),
            });

            if (!response.ok) {
              const errorText = await response.text();
              if (errorText.includes('rate limit exceeded')) {
                if (retries < MAX_RETRIES) {
                  const delay = INITIAL_RETRY_DELAY * Math.pow(2, retries);
                  console.log(`Rate limit exceeded. Retrying in ${delay}ms... (Attempt ${retries + 1}/${MAX_RETRIES})`);
                  await sleep(delay);
                  retries++;
                  continue;
                }
                throw new Error(
                  'Rate limit exceeded. The AI model is currently experiencing high demand. ' +
                  'Please try again in a few minutes. If this persists, consider:' +
                  '\n1. Waiting for a minute before sending another message' +
                  '\n2. Reducing the frequency of requests' +
                  '\n3. Using a different model if available'
                );
              }
              throw new Error(`Ollama API error: ${response.statusText} - ${errorText}`);
            }

            // Create a streaming interface for Ollama responses
            const stream = new ReadableStream({
              async start(controller) {
                const reader = response.body?.getReader();
                if (!reader) {
                  controller.close();
                  return;
                }

                try {
                  while (true) {
                    const { done, value } = await reader.read();
                    if (done) {
                      controller.close();
                      break;
                    }

                    // Parse the chunk and format it for streaming
                    const text = new TextDecoder().decode(value);
                    const lines = text.split('\n').filter(line => line.trim());
                    
                    for (const line of lines) {
                      if (line.startsWith('data: ')) {
                        const data = JSON.parse(line.slice(6));
                        controller.enqueue({
                          id: nanoid(),
                          choices: [{
                            delta: {
                              content: data.message?.content || ''
                            }
                          }],
                          created: Date.now(),
                          model: OLLAMA_MODEL,
                          object: 'chat.completion.chunk'
                        });
                      }
                    }
                  }
                } catch (error) {
                  controller.error(error);
                }
              }
            });

            return {
              status: response.status,
              statusText: response.statusText,
              headers: response.headers,
              stream: () => stream,
              arrayBuffer: () => response.arrayBuffer(),
              blob: () => response.blob(),
              json: () => response.json(),
              text: () => response.text()
            };
          } catch (error) {
            if (retries < MAX_RETRIES) {
              const delay = INITIAL_RETRY_DELAY * Math.pow(2, retries);
              console.log(`Error occurred. Retrying in ${delay}ms... (Attempt ${retries + 1}/${MAX_RETRIES})`);
              await sleep(delay);
              retries++;
              continue;
            }
            throw error;
          }
        }
      }
    }
  }
} as unknown as any;

async function submitUserMessage(content: string, type: string) {
  'use server'

  const aiState = getMutableAIState<typeof AI>()

  aiState.update({
    ...aiState.get(),
    messages: [
      ...aiState.get().messages,
      {
        id: nanoid(),
        role: 'user' as const,
        content,
      }
    ]
  })

  let textStream: undefined | ReturnType<typeof createStreamableValue<string>>
  let textNode: undefined | React.ReactNode

  const ui = render({
    model: OLLAMA_MODEL,
    provider: ollama,
    initial: <SpinnerMessage />,
    messages: [
      {
        role: 'system' as const,
        content: await getPrompt()
      },
      ...aiState.get().messages.map((message: AIMessage) => ({
        role: message.role,
        content: message.content,
        name: message.name
      }))
    ],
    text: ({ content, done, delta }) => {
      if (!textStream) {
        textStream = createStreamableValue('')
        textNode = <BotMessage content={textStream.value} />
      }

      if (done) {
        textStream.done()
        aiState.done({
          ...aiState.get(),
          messages: [
            ...aiState.get().messages,
            {
              id: nanoid(),
              role: 'assistant' as const,
              content,
            }
          ]
        })
      } else {
        textStream.update(delta)
      }

      return textNode
    }
  })

  return {
    id: nanoid(),
    display: ui
  }
}

interface AIState {
  chatId: string
  messages: AIMessage[]
}

export interface UIState {
  id: string
  display: React.ReactNode
}

export const AI = createAI<AIState, UIState[]>({
  actions: {
    submitUserMessage
  },
  initialUIState: [],
  initialAIState: { chatId: nanoid(), messages: [] },
  unstable_onGetUIState: async () => {
    'use server'

    const session = await auth()

    if (session && session.user) {
      const aiState = getAIState()

      if (aiState) {
        const uiState = getUIStateFromAIState(aiState)
        return uiState
      }
    } else {
      return
    }
  },
  unstable_onSetAIState: async ({ state, done }) => {
    'use server'

    const session = await auth()

    if (session && session.user) {
      const { chatId, messages } = state

      const createdAt = new Date()
      const userId = session.user.id as string
      const path = `/chat/${chatId}`
      const title = messages[0].content.substring(0, 100)

      const chat: Chat = {
        id: chatId,
        title,
        userId,
        createdAt,
        messages,
        path
      }

      await saveChat(chat)
    } else {
      return
    }
  }
})

export const getUIStateFromAIState = (aiState: Chat) => {
  return aiState.messages
    .filter(message => message.role !== 'system')
    .map((message, index) => ({
      id: `${aiState.chatId}-${index}`,
      display:
        message.role === 'user' ? (
          <UserMessage>{message.content}</UserMessage>
        ) : (
          <BotMessage content={message.content} />
        )
    }))
}
