import { nanoid } from '@/lib/utils'
import { Chat } from '@/components/chat'
import { AI } from '@/lib/chat/actions'
import { auth } from '@/auth'
import { Session } from '@/lib/types'
import { getMissingKeys } from '../actions'

export interface ChatPageProps {
    params: {
        id: string;
        patient_type: string;
    };
}

export default async function ChatPage({ params }: ChatPageProps) {
    const id = nanoid()
    const session = (await auth()) as Session
    const missingKeys = await getMissingKeys()

    return (
        <AI initialAIState={{ chatId: id, messages: [] }}>
            <Chat id={id} session={session} missingKeys={missingKeys} />
        </AI>
    )
}
