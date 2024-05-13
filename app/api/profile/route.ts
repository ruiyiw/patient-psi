import 'server-only'

import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getProfile } from '@/app/api/getDataFromKV'; // Import the getProfile function from your profile library

export async function GET(request: NextRequest) {
    try {
        const profile = await getProfile();
        if (profile) {
            return NextResponse.json({ profile: profile });
        } else {
            return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
        }
    } catch (error) {
        console.error('Error retrieving profile:', error);
        return NextResponse.json({ error: 'Internal Server Error in GET' }, { status: 500 });
    }
}