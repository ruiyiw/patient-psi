import { PatientProfile } from "./data/patient-profiles";
import { patientTypes, patientTypeDescriptions } from "./data/patient-types";
import { auth } from "@/auth";
import { kv } from "@vercel/kv";
import { profile } from "console";
import fs from 'fs';
import path from 'path';


async function getUserID(): Promise<string | null> {
    const session = await auth();
    return session?.user ? session?.user?.id : null;
}

export async function setProfile(newProfile: PatientProfile | null) {
    try {
        const userID = await getUserID();
        const profileKey = `curr_profile_${userID}`;
        await kv.set(profileKey, JSON.stringify(newProfile));
    } catch (error) {
        console.error('Error storing patient profile to KV:', error);
    }
}

export async function getProfile(): Promise<PatientProfile | null> {
    const userID = await getUserID();
    const profileKey = `curr_profile_${userID}`;
    const profileData = await kv.get(profileKey);
    // console.log(profileData);
    return profileData ? profileData as PatientProfile : null;
}

export async function setPatientType(patientType: string) {
    try {
        const userID = await getUserID();
        const patientTypeKey = `curr_type_${userID}`;
        await kv.set(patientTypeKey, patientType);
    } catch (error) {
        console.error('Error storing patient type to KV:', error);
    }
}

export async function getPatientType(): Promise<string> {
    const userID = await getUserID();
    const patientTypeKey = `curr_type_${userID}`;
    const patientType = await kv.get(patientTypeKey);
    return patientType as string;
}

// Random sample
// export async function sampleProfile(): Promise<PatientProfile | null> {
//     try {
//         const all_keys = await kv.keys('profile_*');

//         if (all_keys.length === 0) {
//             throw new Error('No profiles found');
//         }

//         const randomIndex = Math.floor(Math.random() * all_keys.length);
//         const randomKey = all_keys[randomIndex];

//         const profileData = await kv.get(randomKey);

//         if (!profileData) {
//             return null;
//         }

//         try {
//             return profileData as PatientProfile;
//         } catch (error) {
//             console.error('Error parsing profile data:', error);
//             return null;
//         }
//     } catch (error) {
//         console.error('Error sampling profile:', error);
//         throw error;
//     }

// }

export async function sampleProfile(): Promise<PatientProfile | null> {
    try {
        const all_keys = await kv.keys('profile_*');

        if (all_keys.length === 0) {
            throw new Error('No profiles found');
        }

        const filePath = path.join(process.cwd(), 'app/api/data/participant-mapping.json');
        const jsonData = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(jsonData);

        const userID = await getUserID();

        if (userID as string in data) {
            const profileKey = 'profile_' + data[userID as string][0];
            const profileData = await kv.get(profileKey);
            console.log(profileData);
            const value = data[userID as string];
            const updatedValue = value.slice(1);
            data[userID as string] = updatedValue;
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
            console.log(profileKey + ' updated successfully');

            try {
                return profileData as PatientProfile;
            } catch (error) {
                console.error('Error parsing profile data:', error);
                return null;
            }
        }

        const randomIndex = Math.floor(Math.random() * all_keys.length);
        const randomKey = all_keys[randomIndex];
        const randomProfileData = await kv.get(randomKey);

        try {
            return randomProfileData as PatientProfile;
        } catch (error) {
            console.error('Error parsing profile data:', error);
            return null;
        }

    } catch (error) {
        console.error('Error sampling profile:', error);
        throw error;
    }
}


export async function getPrompt(): Promise<string> {
    const profile = await getProfile();
    // console.log(profile);
    const prompt = formatPromptString(profile);
    return prompt;
}


async function formatPromptString(data: any): Promise<string> {
    const patientType = await getPatientType() as keyof typeof patientTypeDescriptions;
    // console.log(patientType);
    // const patientTypeContent = patientTypeDescriptions[patientType];
    const patientTypeContent = patientTypes.find((item) => item.type === patientType)?.content
    // console.log(patientTypeContent)

    const prompt = `Imagine you are ${data.name}, a patient who has been suffering from (potential) mental health issues. You have been attending sessions for several weeks. Your task is to act and speak as ${data.name} would with a therapist during a cognitive behavioral therapy (CBT) session. You should try your best to align with ${data.name}'s background information in the 'Relevant history' field. Your thought process should strictly follow the cognitive conceptualization diagram provided in the 'Cognitive Conceptualization Diagram' field. However, you must not directly dispose any text from the diagram because a real patient does not think about things following the diagram.\n\n
    Patient History: ${data.history}\n\nCognitive Conceptualization Diagram:\nCore Beliefs: ${data.core_belief}\nIntermediate Beliefs: ${data.intermediate_belief}\nIntermediate Beliefs during Depression: ${data.intermediate_belief_depression}\nCoping Strategies: ${data.coping_strategies}\n\n
    You are going to be asked about your past week. Please make a conversation with the therapist regarding the following situation and behavior. The emotion and automatic thoughts are for your reference. Please do not disclose anything about cognitive conceptualization diagram directly; instead, you should act based on the diagram so that the therapist can infer from your talk.\n\nSituation: ${data.situation}\nAutomatic Thoughts: ${data.auto_thoughts}\nEmotions: ${data.emotion}\nBehavior: ${data.behavior}\n\n
    In the following conversation, you should start simulating ${data.name} during therapy session, and the user is a therapist. 
    You must follow the following rules:\n
    1. ${patientTypeContent}\n
    2. You should emulate the demeanor and responses of a genuine patient, ensuring authenticity in its interactions.\n
    3. A real patient often requires extensive dialogue before delving into core issues. It's challenging for therapists to pinpoint the patient's genuine thoughts and emotions. Thus, you should mimic this gradual revelation of deeper concerns.\n\n
    Now you are patient ${data.name}. You must navigate your conversation like ${data.name} no matter what the other side asks. Each turn, you must generate no more than 5 sentences. If the user asks "Hi" or anything similar, then you should start your conversation as the patient. `;

    console.log(prompt);
    return prompt;
}
