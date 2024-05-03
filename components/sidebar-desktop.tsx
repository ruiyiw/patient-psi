import { Sidebar } from '@/components/sidebar'

import { auth } from '@/auth'
import { ChatHistory } from '@/components/chat-history'
import { DiagramList } from './diagram-list'

export async function SidebarDesktop() {
  const session = await auth()

  if (!session?.user?.id) {
    return null
  }

  return (
    <div>
      <Sidebar className="peer absolute inset-y-0 z-30 hidden -translate-x-full border-r bg-muted duration-300 ease-in-out data-[state=open]:translate-x-0 lg:flex lg:w-[120px] xl:w-[180px]">
        {/* @ts-ignore */}
        <ChatHistory userId={session.user.id} />
      </Sidebar>
    </div>
  )
}

