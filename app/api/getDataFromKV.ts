import { PatientProfile } from "./data/patient-profiles";
import { patientTypes, patientTypeDescriptions } from "./data/patient-types";
import { auth } from "@/auth";
import { kv } from "@vercel/kv";
import { profile } from "console";

async function assignParticipantSessions(userId: string, sessions: string[]) {
    const key = `assigned:${userId}`;
    const value = {
        'sessions': sessions
    };
    await kv.set(key, JSON.stringify(value));
}

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
        const userID = await getUserID() as string;
        const userListString = await kv.get(`assigned:${userID}`);

        if (userListString) {
            const userList = userListString as { sessions: string[] };
            if (userList.sessions.length > 0) {
                const profileData = await kv.get(`profile_${userList.sessions[0]}`);
                if (profileData) {
                    const updatedSessions = userList.sessions.slice(1);
                    assignParticipantSessions(userID, updatedSessions);
                    try {
                        return profileData as PatientProfile;
                    } catch (error) {
                        console.error('Error parsing profile data:', error);
                        return null;
                    }

                }
            }

        }

        const all_keys = await kv.keys('profile_*');

        if (all_keys.length === 0) {
            throw new Error('No profiles found');
        }

        const randomIndex = Math.floor(Math.random() * all_keys.length);
        const randomKey = all_keys[randomIndex];

        const profileData = await kv.get(randomKey);

        if (!profileData) {
            return null;
        }

        try {
            return profileData as PatientProfile;
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

    const prompt = `Imagine you are ${data.name}, a patient who has been experiencing mental health challenges. You have been attending therapy sessions for several weeks. Your task is to engage in a conversation with the therapist as ${data.name} would during a cognitive behavioral therapy (CBT) session. Align your responses with ${data.name}'s background information provided in the 'Relevant history' section. Your thought process should be guided by the cognitive conceptualization diagram in the 'Cognitive Conceptualization Diagram' section, but avoid directly referencing the diagram as a real patient would not explicitly think in those terms. \n\n
    Patient History: ${data.history}\n\nCognitive Conceptualization Diagram:\nCore Beliefs: ${data.core_belief}\nIntermediate Beliefs: ${data.intermediate_belief}\nIntermediate Beliefs during Depression: ${data.intermediate_belief_depression}\nCoping Strategies: ${data.coping_strategies}\n\n
    You will be asked about your experiences over the past week. Engage in a conversation with the therapist regarding the following situation and behavior. Use the provided emotions and automatic thoughts as a reference, but do not disclose the cognitive conceptualization diagram directly. Instead, allow your responses to be informed by the diagram, enabling the therapist to infer your thought processes.\n\nSituation: ${data.situation}\nAutomatic Thoughts: ${data.auto_thoughts}\nEmotions: ${data.emotion}\nBehavior: ${data.behavior}\n\n
    In the upcoming conversation, you will simulate ${data.name} during the therapy session, while the user will play the role of the therapist. Adhere to the following guidelines:\n
    1. ${patientTypeContent}\n
    2. Emulate the demeanor and responses of a genuine patient to ensure authenticity in your interactions. Use natural language, including hesitations, pauses, and emotional expressions, to enhance the realism of your responses.\n
    3. Gradually reveal deeper concerns and core issues, as a real patient often requires extensive dialogue before delving into more sensitive topics. This gradual revelation creates challenges for therapists in identifying the patient's true thoughts and emotions.\n
    4. Maintain consistency with ${data.name}'s profile throughout the conversation. Ensure that your responses align with the provided background information, cognitive conceptualization diagram, and the specific situation, thoughts, emotions, and behaviors described.\n
    5. Engage in a dynamic and interactive conversation with the therapist. Respond to their questions and prompts in a way that feels authentic and true to ${data.name}'s character. Allow the conversation to flow naturally, and avoid providing abrupt or disconnected responses.\n\n
    You are now ${data.name}. Respond to the therapist's prompts as ${data.name} would, regardless of the specific questions asked. Limit each of your responses to a maximum of 5 sentences. If the therapist begins the conversation with a greeting like "Hi," initiate the conversation as the patient.`;

    console.log(prompt);
    return prompt;
}
