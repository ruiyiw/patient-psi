import 'server-only'

import {
  createAI,
  createStreamableUI,
  getMutableAIState,
  getAIState,
  render,
  createStreamableValue
} from 'ai/rsc'
import OpenAI from 'openai'

import {
  spinner,
  BotCard,
  BotMessage,
  SystemMessage,
  Stock,
  Purchase
} from '@/components/stocks'

import { z } from 'zod'
import { EventsSkeleton } from '@/components/stocks/events-skeleton'
import { Events } from '@/components/stocks/events'
import { StocksSkeleton } from '@/components/stocks/stocks-skeleton'
import { Stocks } from '@/components/stocks/stocks'
import { StockSkeleton } from '@/components/stocks/stock-skeleton'
import {
  formatNumber,
  runAsyncFnWithoutBlocking,
  sleep,
  nanoid
} from '@/lib/utils'
import { saveChat } from '@/app/actions'
import { SpinnerMessage, UserMessage } from '@/components/stocks/message'
import { Chat } from '@/lib/types'
import { auth } from '@/auth'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || ''
})

async function confirmPurchase(symbol: string, price: number, amount: number) {
  'use server'

  const aiState = getMutableAIState<typeof AI>()

  const purchasing = createStreamableUI(
    <div className="inline-flex items-start gap-1 md:items-center">
      {spinner}
      <p className="mb-2">
        Purchasing {amount} ${symbol}...
      </p>
    </div>
  )

  const systemMessage = createStreamableUI(null)

  runAsyncFnWithoutBlocking(async () => {
    await sleep(1000)

    purchasing.update(
      <div className="inline-flex items-start gap-1 md:items-center">
        {spinner}
        <p className="mb-2">
          Purchasing {amount} ${symbol}... working on it...
        </p>
      </div>
    )

    await sleep(1000)

    purchasing.done(
      <div>
        <p className="mb-2">
          You have successfully purchased {amount} ${symbol}. Total cost:{' '}
          {formatNumber(amount * price)}
        </p>
      </div>
    )

    systemMessage.done(
      <SystemMessage>
        You have purchased {amount} shares of {symbol} at ${price}. Total cost ={' '}
        {formatNumber(amount * price)}.
      </SystemMessage>
    )

    aiState.done({
      ...aiState.get(),
      messages: [
        ...aiState.get().messages.slice(0, -1),
        {
          id: nanoid(),
          role: 'function',
          name: 'showStockPurchase',
          content: JSON.stringify({
            symbol,
            price,
            defaultAmount: amount,
            status: 'completed'
          })
        },
        {
          id: nanoid(),
          role: 'system',
          content: `[User has purchased ${amount} shares of ${symbol} at ${price}. Total cost = ${amount * price
            }]`
        }
      ]
    })
  })

  return {
    purchasingUI: purchasing.value,
    newMessage: {
      id: nanoid(),
      display: systemMessage.value
    }
  }
}

async function submitUserMessage(content: string) {
  'use server'

  const aiState = getMutableAIState<typeof AI>()

  aiState.update({
    ...aiState.get(),
    messages: [
      ...aiState.get().messages,
      {
        id: nanoid(),
        role: 'user',
        content
      }
    ]
  })

  let textStream: undefined | ReturnType<typeof createStreamableValue<string>>
  let textNode: undefined | React.ReactNode

  const ui = render({
    model: 'gpt-4',
    provider: openai,
    initial: <SpinnerMessage />,
    messages: [
      {
        role: 'system',
        content: `
        Imagine you are Abe, a patient who has been suffering from (potential) mental health issues. You have been attending sessions for several weeks. Your task is to act and speak as Abe would with a therapist during a cognitive behavioral therapy (CBT) session. You should try your best to align with Abe's session notes and background information in the 'Patient's history' field. Your thought process should strictly follow the cognitive conceptualization diagram provided in the 'Cognitive Conceptualization Diagram' field. However, you must not directly dispose any text from the diagram because a real patient cannot structure the underlying thought processes. Additionally, you should try your best to act like a real patient with mental health issues, maintaining the conversation's naturalness and realism.

        Patient's history: 
        The following paragraph include Abe's session intake information: 
        
        Abe is a 56-year-old male who identifies as heterosexual. He has an American with European heritage background. His religious affiliation is with the Belongs to the Unitarian Church; was not attending church at intake, and he currently resides in a Small apartment in large city, lives alone. Professionally, Abe is unemployed and falls under the middle class category. He approached therapy with a Abe sought treatment for severe depressive symptoms and moderate anxiety.. Upon further evaluation, several major symptoms were identified. Emotionally, he has been experiencing feelings of depression, anxiety, as well as pessimism and some guilt and lack of pleasure and interest. Cognitively, Abe faces trouble making decisions and trouble concentrating. Behaviorally, there's a noticeable avoidance (not cleaning up at home, looking for a job or doing errands) and he has shown signs of social isolation (stopped going to church, spent less time with family, stopped seeing friends). Physiologically, Abe reported feeling heaviness in body, significant fatigue, and has a low libido. Additionally, he finds difficulty relaxing difficult and has a decreased appetite. During his evaluation, Abe appeared to be quite depressed. His clothes were somewhat wrinkled; he didn't stand or sit up straight and made little eye contact and didn't smile throughout the evaluation. His movements were a little slow. His speech was normal. He showed little affect other than depression. His thought process was intact. His sensorium, cognition, insight and judgment were within normal limits. He was able to fully participate in treatment.. The primary diagnosis given was Major Depressive Disorder, single episode, severe, with anxious distress. No personality disorder but mild OCPD features.. In terms of psychiatric treatment, Abe is on none and there are none to report. Concerning his social ties, Although Abe had withdrawn somewhat from his family, his relationship with his two grown children and four school-age grandchildren were good. He sometimes visited them or attended his grandchildren's sporting events. He had a great deal of conflict with his ex-wife and he had completely withdrawn from his two male friends. He was relatively close to one cousin and less so to one brother. He saw and spoke to his other brother and his mother infrequently and didn't feel close to them.
        
        Cognitive Conceptualization Diagram: 

        Core Beliefs: 
        Abe has internalized a belief that he is "incompetent" and a "failure". These core beliefs stem from early experiences with his family and have been reinforced by subsequent challenges in his life.

        Intermediate Beliefs: 
        Abe firmly believes in the significance of responsibility, competency, reliability, and being helpful to others. 
        He also holds the belief that one must work hard and be productive to be of value.

        Intermediate Beliefs during Depression: 
        Avoiding challenges becomes a coping mechanism for Abe. He believes that evading difficult tasks will shield him from failure. Abe is reluctant to seek help. He fears that doing so will expose his perceived incompetence. 

        Coping Strategies: 
        Abe's primary coping mechanisms during this depressive period are avoidance behaviors. He avoids asking for help, fearing judgment and confirmation of his perceived incompetence. He also steers clear of challenges, hoping to avoid any possibility of failing.
        
        Situation: Thinking of asking son for help in revising resume
        
        Authomatic thoughts: I should be able to do this on my own.

        Emotion: Sad.
        
        Behavior: Avoids asking son for help.
        
        In the following conversation, you should start simulating Abe during therapy session, and the user is a therapist. 
        You must follow the following rules:
        1. Natural Presentation:
          - You should emulate the demeanor and responses of a genuine patient, ensuring authenticity in its interactions.
        2. Subtlety in Conversations:
          - A real patient often requires extensive dialogue before delving into core issues. It's challenging for therapists to pinpoint the patient's genuine thoughts and emotions. Thus, you should mimic this gradual revelation of deeper concerns.
        3. Use of Background Information ("Patient's history"):
          - Genuine patients rarely volunteer detailed background information without prompting.
          - You should not overtly reference the provided background but should draw inferences from it to shape responses. Direct mentions should be limited and only occur when contextually appropriate.
        4. Adherence to Cognitive Conceptualization Diagram:
          - While the provided cognitive structures influence a patient's speech, they are not typically verbalized directly.
          - You should craft responses influenced by these latent cognitive structures without explicitly mentioning them. Responses should appear as natural outcomes of the underlying thought processes.
        5. Brevity and Ambiguity:
          - Real patients often struggle to articulate their feelings and thoughts comprehensively. They might be concise, vague, or even contradictory.
          - You should keep responses succinct, typically not exceeding two sentences unless contextually warranted.
        6. Passivity in Interaction:
          - Genuine patients do not readily offer clues or follow a therapeutic schema. They often need considerable guidance from therapists to understand and verbalize their feelings and thoughts.
          - You should not take an active role in leading the therapeutic process. Instead, it should rely on the therapist's guidance to navigate the conversation.
        7. Lack of Clear Logical Progression:
          - Patients might not possess or demonstrate clear logical thinking patterns during therapy. They might be hesitant or unable to pinpoint the exact reasons for their feelings.
          - You should replicate this characteristic, ensuring that its responses are not always logically structured or straightforward.
        8. Limit on Response Length:
          - As a general rule, the LLM should restrict its responses to a maximum of five sentences in most situations. Longer responses should be an exception, based on the context and necessity of the conversation.

        Remember, a real patient may stuck in his own feelings. You should talk less about your feelings or symptoms. What you learned from the cognitive conceptualization diagram should not be exposed to the therapist so easily. 
        `
      },
      ...aiState.get().messages.map((message: any) => ({
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
              role: 'assistant',
              content
            }
          ]
        })
      } else {
        textStream.update(delta)
      }

      return textNode
    },
    functions: {
      listStocks: {
        description: 'List three imaginary stocks that are trending.',
        parameters: z.object({
          stocks: z.array(
            z.object({
              symbol: z.string().describe('The symbol of the stock'),
              price: z.number().describe('The price of the stock'),
              delta: z.number().describe('The change in price of the stock')
            })
          )
        }),
        render: async function* ({ stocks }) {
          yield (
            <BotCard>
              <StocksSkeleton />
            </BotCard>
          )

          await sleep(1000)

          aiState.done({
            ...aiState.get(),
            messages: [
              ...aiState.get().messages,
              {
                id: nanoid(),
                role: 'function',
                name: 'listStocks',
                content: JSON.stringify(stocks)
              }
            ]
          })

          return (
            <BotCard>
              <Stocks props={stocks} />
            </BotCard>
          )
        }
      },
      showStockPrice: {
        description:
          'Get the current stock price of a given stock or currency. Use this to show the price to the user.',
        parameters: z.object({
          symbol: z
            .string()
            .describe(
              'The name or symbol of the stock or currency. e.g. DOGE/AAPL/USD.'
            ),
          price: z.number().describe('The price of the stock.'),
          delta: z.number().describe('The change in price of the stock')
        }),
        render: async function* ({ symbol, price, delta }) {
          yield (
            <BotCard>
              <StockSkeleton />
            </BotCard>
          )

          await sleep(1000)

          aiState.done({
            ...aiState.get(),
            messages: [
              ...aiState.get().messages,
              {
                id: nanoid(),
                role: 'function',
                name: 'showStockPrice',
                content: JSON.stringify({ symbol, price, delta })
              }
            ]
          })

          return (
            <BotCard>
              <Stock props={{ symbol, price, delta }} />
            </BotCard>
          )
        }
      },
      showStockPurchase: {
        description:
          'Show price and the UI to purchase a stock or currency. Use this if the user wants to purchase a stock or currency.',
        parameters: z.object({
          symbol: z
            .string()
            .describe(
              'The name or symbol of the stock or currency. e.g. DOGE/AAPL/USD.'
            ),
          price: z.number().describe('The price of the stock.'),
          numberOfShares: z
            .number()
            .describe(
              'The **number of shares** for a stock or currency to purchase. Can be optional if the user did not specify it.'
            )
        }),
        render: async function* ({ symbol, price, numberOfShares = 100 }) {
          if (numberOfShares <= 0 || numberOfShares > 1000) {
            aiState.done({
              ...aiState.get(),
              messages: [
                ...aiState.get().messages,
                {
                  id: nanoid(),
                  role: 'system',
                  content: `[User has selected an invalid amount]`
                }
              ]
            })

            return <BotMessage content={'Invalid amount'} />
          }

          aiState.done({
            ...aiState.get(),
            messages: [
              ...aiState.get().messages,
              {
                id: nanoid(),
                role: 'function',
                name: 'showStockPurchase',
                content: JSON.stringify({
                  symbol,
                  price,
                  numberOfShares
                })
              }
            ]
          })

          return (
            <BotCard>
              <Purchase
                props={{
                  numberOfShares,
                  symbol,
                  price: +price,
                  status: 'requires_action'
                }}
              />
            </BotCard>
          )
        }
      },
      getEvents: {
        description:
          'List funny imaginary events between user highlighted dates that describe stock activity.',
        parameters: z.object({
          events: z.array(
            z.object({
              date: z
                .string()
                .describe('The date of the event, in ISO-8601 format'),
              headline: z.string().describe('The headline of the event'),
              description: z.string().describe('The description of the event')
            })
          )
        }),
        render: async function* ({ events }) {
          yield (
            <BotCard>
              <EventsSkeleton />
            </BotCard>
          )

          await sleep(1000)

          aiState.done({
            ...aiState.get(),
            messages: [
              ...aiState.get().messages,
              {
                id: nanoid(),
                role: 'function',
                name: 'getEvents',
                content: JSON.stringify(events)
              }
            ]
          })

          return (
            <BotCard>
              <Events props={events} />
            </BotCard>
          )
        }
      }
    }
  })

  return {
    id: nanoid(),
    display: ui
  }
}

export type Message = {
  role: 'user' | 'assistant' | 'system' | 'function' | 'data' | 'tool'
  content: string
  id: string
  name?: string
}

export type AIState = {
  chatId: string
  messages: Message[]
}

export type UIState = {
  id: string
  display: React.ReactNode
}[]

export const AI = createAI<AIState, UIState>({
  actions: {
    submitUserMessage,
    confirmPurchase
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
        message.role === 'function' ? (
          message.name === 'listStocks' ? (
            <BotCard>
              <Stocks props={JSON.parse(message.content)} />
            </BotCard>
          ) : message.name === 'showStockPrice' ? (
            <BotCard>
              <Stock props={JSON.parse(message.content)} />
            </BotCard>
          ) : message.name === 'showStockPurchase' ? (
            <BotCard>
              <Purchase props={JSON.parse(message.content)} />
            </BotCard>
          ) : message.name === 'getEvents' ? (
            <BotCard>
              <Events props={JSON.parse(message.content)} />
            </BotCard>
          ) : null
        ) : message.role === 'user' ? (
          <UserMessage>{message.content}</UserMessage>
        ) : (
          <BotMessage content={message.content} />
        )
    }))
}
