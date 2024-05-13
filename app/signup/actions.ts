'use server'

import { signIn } from '@/auth'
import { ResultCode, getStringFromBuffer } from '@/lib/utils'
import { z } from 'zod'
import { kv } from '@vercel/kv'
import { getUser } from '../login/actions'
import { AuthError } from 'next-auth'

export async function createUser(
  participantId: string
  // email: string,
  // hashedPassword: string,
  // salt: string
) {
  // const existingUser = await getUser(email)
  const existingUser = await getUser(participantId)

  if (existingUser) {
    return {
      type: 'error',
      resultCode: ResultCode.UserAlreadyExists
    }
  } else {
    const user = {
      // id: crypto.randomUUID(),
      id: participantId
      // email,
      // password: hashedPassword,
      // salt
    }

    // await kv.hmset(`user:${email}`, user)
    await kv.hmset(`user:${participantId}`, user)

    return {
      type: 'success',
      resultCode: ResultCode.UserCreated
    }
  }
}

interface Result {
  type: string
  resultCode: ResultCode
}

export async function signup(
  _prevState: Result | undefined,
  formData: FormData
): Promise<Result | undefined> {
  // const email = formData.get('email') as string
  // const password = formData.get('password') as string
  const participantId = formData.get('participantId') as string;

  const parsedCredentials = z
    .object({
      // email: z.string().email(),
      // password: z.string().min(6)
      participantId: z.string()
    })
    .safeParse({
      // email,
      // password
      participantId
    })

  if (parsedCredentials.success) {
    // const salt = crypto.randomUUID()

    // const encoder = new TextEncoder()
    // const saltedPassword = encoder.encode(password + salt)
    // const hashedPasswordBuffer = await crypto.subtle.digest(
    //   'SHA-256',
    //   saltedPassword
    // )
    // const hashedPassword = getStringFromBuffer(hashedPasswordBuffer)

    try {
      // const result = await createUser(email, hashedPassword, salt)
      const result = await createUser(participantId);

      if (result.resultCode === ResultCode.UserCreated) {
        await signIn('credentials', {
          // email,
          // password,
          participantId,
          redirect: false
        })
      }

      return result
    } catch (error) {
      if (error instanceof AuthError) {
        switch (error.type) {
          case 'CredentialsSignin':
            return {
              type: 'error',
              resultCode: ResultCode.InvalidCredentials
            }
          default:
            return {
              type: 'error',
              resultCode: ResultCode.UnknownError
            }
        }
      } else {
        return {
          type: 'error',
          resultCode: ResultCode.UnknownError
        }
      }
    }
  } else {
    return {
      type: 'error',
      resultCode: ResultCode.InvalidCredentials
    }
  }
}
