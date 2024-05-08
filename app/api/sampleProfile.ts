import { profile } from "console";
import { PatientProfile } from "./data/patient-profiles";
import { auth } from "@/auth";
import { kv } from "@vercel/kv";


async function getUserID(): Promise<string | null> {
    const session = await auth();
    return session?.user ? session?.user?.id : null;
}

export async function setProfile(newProfile: PatientProfile | null) {
    // profile = newProfile;
    try {
        const userID = await getUserID();
        const profileKey = `curr_profile_${userID}`;
        await kv.set(profileKey, JSON.stringify(newProfile));
    } catch (error) {
        console.error('Error storing data to KV:', error);
    }
}

export async function getProfile(): Promise<PatientProfile | null> {
    const userID = await getUserID();
    const profileKey = `curr_profile_${userID}`;
    const profileData = await kv.get(profileKey);
    console.log(profileData);
    return profileData ? profileData as PatientProfile : null;
}
