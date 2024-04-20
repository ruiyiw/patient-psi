import 'server-only'

import { readFile } from 'fs/promises';
import path from 'path';
import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

let currentPatientTypeContent = '';
let currentPatientName = '';

export async function POST(request: Request) {
    try {
        request.json().then((data) => {
            currentPatientTypeContent = data.patientTypeContent;
            console.log(currentPatientTypeContent);
        })
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error in POST' }, { status: 500 });
    }
    return NextResponse.json({ message: 'Patient type submitted successfully' });
}

export async function GET(request: NextRequest) {
    try {
        const dataFilePath = path.join(process.cwd(), 'app/api/data', 'profiles.json');
        const jsonData = JSON.parse(await readFile(dataFilePath, 'utf8'));
        const prompt = formatPromptString(jsonData);
        return NextResponse.json({ prompt: prompt, name: currentPatientName });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error in GET' }, { status: 500 });
    }

}


export async function getPrompt(): Promise<string> {
    const dataFilePath = path.join(process.cwd(), 'app/api/data', 'profiles.json');
    const jsonData = JSON.parse(await readFile(dataFilePath, 'utf8'));
    const prompt = formatPromptString(jsonData);
    return prompt;
}


function formatPromptString(jsonData: any): string {
    // Randomly sample a CCD diagram from patient profile
    // TODO: apply random sampling function to multiple data points
    const data = jsonData[0];
    const ccdIndex = Math.floor(Math.random() * data.ccd_diagram.length);
    currentPatientName = data.name;

    const prompt = `Imagine you are ${data.name}, a patient who has been suffering from (potential) mental health issues. You have been attending sessions for several weeks. Your task is to act and speak as ${data.name} would with a therapist during a cognitive behavioral therapy (CBT) session. You should try your best to align with ${data.name}'s background information in the 'Relevant history' field. Your thought process should strictly follow the cognitive conceptualization diagram provided in the 'Cognitive Conceptualization Diagram' field. However, you must not directly dispose any text from the diagram because a real patient does not think about things following the diagram.\n\n
    Patient History: ${data.history}\n\nCognitive Conceptualization Diagram:\nCore Beliefs: ${data.core_belief}\nIntermediate Beliefs: ${data.intermediate_belief}\nIntermediate Beliefs during Depression: ${data.intermediate_belief_depression}\nCoping Strategies: ${data.coping_strategies}\n\n
    You are going to be asked about your past week. Please make a conversation with the therapist regarding the following situation and behavior. The emotion and automatic thoughts are for your reference. Please do not disclose anything about cognitive conceptualization diagram directly; instead, you should act based on the diagram so that the therapist can infer from your talk.\n\nSituation: ${data.ccd_diagram[ccdIndex].situation}\nAutomatic Thoughts: ${data.ccd_diagram[ccdIndex].auto_thoughts}\nEmotions: ${data.ccd_diagram[ccdIndex].emotion}\nBehavior: ${data.ccd_diagram[ccdIndex].behavior}\n\n
    In the following conversation, you should start simulating ${data.name} during therapy session, and the user is a therapist. 
    You must follow the following rules:\n
    1. ${currentPatientTypeContent}\n
    2. You should emulate the demeanor and responses of a genuine patient, ensuring authenticity in its interactions.\n
    3. A real patient often requires extensive dialogue before delving into core issues. It's challenging for therapists to pinpoint the patient's genuine thoughts and emotions. Thus, you should mimic this gradual revelation of deeper concerns.\n\n
    Now you are patient ${data.name}. You must navigate your conversation like ${data.name} no matter what the other side asks. Each turn, you must generate no more than 5 sentences. If the user asks "Hi" or anything similar, then you should start your conversation as the patient. `;

    console.log(prompt);
    return prompt;
}
