import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { authConfig } from './auth.config'
import { z } from 'zod'
import { getStringFromBuffer } from './lib/utils'
import { getUser } from './app/login/actions'

export const { auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({
            // email: z.string().email(),
            // password: z.string().min(6)
            participantId: z.string()
          })
          .safeParse(credentials)

        if (parsedCredentials.success) {
          // const { email, password } = parsedCredentials.data
          const { participantId } = parsedCredentials.data;

          // const user = await getUser(email)
          const user = await getUser(participantId);

          if (!user) return null

          // const encoder = new TextEncoder()
          // const saltedPassword = encoder.encode(password + user.salt)
          // const hashedPasswordBuffer = await crypto.subtle.digest(
          //   'SHA-256',
          //   saltedPassword
          // )
          // const hashedPassword = getStringFromBuffer(hashedPasswordBuffer)

          // if (hashedPassword === user.password) {
          //   return user
          // } else {
          //   return null
          // }
          return user;
        }

        return null
      }
    })
  ]
})
