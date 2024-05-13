import 'server-only'

import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { setProfile, setPatientType, sampleProfile } from '@/app/api/getDataFromKV'


export async function POST(request: Request) {
    try {
        request.json().then((data) => {
            setPatientType(data.patientType);
        })
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error in POST' }, { status: 500 });
    }
    return NextResponse.json({ message: 'Patient type submitted successfully' });
}

export async function GET(request: NextRequest) {

    try {
        const profile = await sampleProfile();
        await setProfile(profile);
        return NextResponse.json({ profile: profile });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error in GET' }, { status: 500 });
    }

}
