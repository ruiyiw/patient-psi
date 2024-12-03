import { type Metadata } from 'next'
import { notFound } from 'next/navigation'

import { getSharedChat } from '@/app/actions'
import { ChatList } from '@/components/chat-list'
import { FooterText } from '@/components/footer'
import { AI, UIState, getUIStateFromAIState } from '@/lib/chat/actions'

export const runtime = 'edge'
export const preferredRegion = 'home'

export interface SharePageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({
  params
}: SharePageProps): Promise<Metadata> {
  const chat = await getSharedChat(params.id)

  return {
    title: chat?.title.toString().slice(0, 50) ?? 'Chat'
  }
}

export default async function SharePage({ params }: SharePageProps) {
  const chat = await getSharedChat(params.id)

  if (!chat || !chat.sharePath) {
    notFound()
  }

  const uiState = getUIStateFromAIState(chat)

  return (
    <>
      <div className="flex-1 space-y-6">
        <ChatList messages={uiState} isShared={true} />
      </div>
      <FooterText className="py-8" />
    </>
  )
}
