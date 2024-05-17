import 'server-only'

import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        const chatId = searchParams.get('chatId');

        if (!userId || !chatId) {
            return NextResponse.json({ error: 'Missing Id' }, { status: 400 });
        }

        const type = await kv.get(`curr_type_${userId}`) as string;
        await kv.set(`type:${userId}:${chatId}`, type);

        return NextResponse.json({ type: type });
    } catch (error) {
        console.error('Error fetching patient type:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}