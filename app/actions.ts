'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { kv } from '@vercel/kv'

import { auth } from '@/auth'
import { CCDResult, CCDTruth, type Chat } from '@/lib/types'
import { pipe } from 'framer-motion'

export async function getChats(userId?: string | null) {
  if (!userId) {
    return []
  }

  try {
    const pipeline = kv.pipeline()
    const chats: string[] = await kv.zrange(`user:chat:${userId}`, 0, -1, {
      rev: true
    })

    for (const chat of chats) {
      pipeline.hgetall(chat)
    }

    const results = await pipeline.exec()

    return results as Chat[]
  } catch (error) {
    return []
  }
}

export async function getChat(id: string, userId: string) {
  const chat = await kv.hgetall<Chat>(`chat:${id}`)

  if (!chat || (userId && chat.userId !== userId)) {
    return null
  }

  return chat
}

export async function removeChat({ id, path }: { id: string; path: string }) {
  const session = await auth()

  if (!session) {
    return {
      error: 'Unauthorized'
    }
  }

  //Convert uid to string for consistent comparison with session.user.id
  const uid = String(await kv.hget(`chat:${id}`, 'userId'))

  if (uid !== session?.user?.id) {
    return {
      error: 'Unauthorized'
    }
  }

  await kv.del(`chat:${id}`)
  await kv.zrem(`user:chat:${session.user.id}`, `chat:${id}`)
  await kv.del(`ccdTruth:${session.user.id}:${id}`)
  await kv.del(`ccdResult:${session.user.id}:${id}`)

  // remove corresponding diagram history


  revalidatePath('/')
  return revalidatePath(path)
}

export async function clearChats() {
  const session = await auth()

  if (!session?.user?.id) {
    return {
      error: 'Unauthorized'
    }
  }

  const chats: string[] = await kv.zrange(`user:chat:${session.user.id}`, 0, -1)
  if (!chats.length) {
    return redirect('/')
  }
  const pipeline = kv.pipeline()

  for (const chat of chats) {
    pipeline.del(chat)
    pipeline.zrem(`user:chat:${session.user.id}`, chat)
  }

  await pipeline.exec()

  revalidatePath('/')
  return redirect('/')
}

export async function getSharedChat(id: string) {
  const chat = await kv.hgetall<Chat>(`chat:${id}`)

  if (!chat || !chat.sharePath) {
    return null
  }

  return chat
}

export async function shareChat(id: string) {
  const session = await auth()

  if (!session?.user?.id) {
    return {
      error: 'Unauthorized'
    }
  }

  const chat = await kv.hgetall<Chat>(`chat:${id}`)

  if (!chat || chat.userId !== session.user.id) {
    return {
      error: 'Something went wrong'
    }
  }

  const payload = {
    ...chat,
    sharePath: `/share/${chat.id}`
  }

  await kv.hmset(`chat:${chat.id}`, payload)

  return payload
}

export async function saveChat(chat: Chat) {
  const session = await auth()

  if (session && session.user) {
    const pipeline = kv.pipeline()
    pipeline.hmset(`chat:${chat.id}`, chat)
    pipeline.zadd(`user:chat:${chat.userId}`, {
      score: Date.now(),
      member: `chat:${chat.id}`
    })
    await pipeline.exec()
  } else {
    return
  }
}

export async function refreshHistory(path: string) {
  redirect(path)
}

export async function getMissingKeys() {
  const keysRequired = ['OPENAI_API_KEY']
  return keysRequired
    .map(key => (process.env[key] ? '' : key))
    .filter(key => key !== '')
}


export async function getCCDResult(userId: string, chatId: string) {
  const ccdResultKey = `ccdResult:${userId}:${chatId}`;
  const ccdResult = await kv.hgetall<CCDResult>(ccdResultKey);

  if (ccdResult && Object.keys(ccdResult).length > 0) {
    return ccdResult;
  } else {
    return null;
  }
}


export async function saveCCDResult(ccdResult: CCDResult) {
  const session = await auth()

  if (session && session.user) {
    const pipeline = kv.pipeline()
    const ccdResultKey = `ccdResult:${ccdResult.userId}:${ccdResult.chatId}`;
    pipeline.hmset(ccdResultKey, ccdResult)
    await pipeline.exec()
  } else {
    return
  }
}


export async function getCCDTruth(userId: string, chatId: string) {
  const ccdTruthKey = `ccdTruth:${userId}:${chatId}`;
  const ccdTruth = await kv.hgetall<CCDTruth>(ccdTruthKey);

  if (ccdTruth && Object.keys(ccdTruth).length > 0) {
    return ccdTruth;
  } else {
    return null;
  }
}


export async function saveCCDTruth(ccdTruth: CCDTruth) {
  const session = await auth()

  if (session && session.user) {
    const pipeline = kv.pipeline()
    const ccdTruthKey = `ccdTruth:${ccdTruth.userId}:${ccdTruth.chatId}`;
    pipeline.hmset(ccdTruthKey, ccdTruth)
    await pipeline.exec()
  } else {
    return
  }
}


export async function getProfileData() {
  const key = "alex_data"

}