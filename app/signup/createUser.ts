'use server';
import { ResultCode } from '@/lib/utils';
import { kv } from '@vercel/kv';
import { getUser } from '../login/actions';


export async function createUser(
    // email: string,
    // hashedPassword: string,
    // salt: string
    participantId: string
) {
    // const existingUser = await getUser(email);
    const existingUser = await getUser(participantId);

    if (existingUser) {
        return {
            type: 'error',
            resultCode: ResultCode.UserAlreadyExists
        };
    } else {
        const user = {
            // id: crypto.randomUUID(),
            id: participantId
            // email,
            // password: hashedPassword,
            // salt
        };

        // await kv.hmset(`user:${email}`, user);
        await kv.hmset(`user:${participantId}`, user);

        return {
            type: 'success',
            resultCode: ResultCode.UserCreated
        };
    }
}
