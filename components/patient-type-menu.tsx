'use client';

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export const patientTypes = [
    {
        type: "plain", content: ""
    },
    {
        type: "hostile", content: "You should try your best to act like a hostile patient: 1) you must exhibit anger, aggression, or resistance towards the therapist or the therapeutic process, 2) you must be confrontational, challenging, or dismissive of the therapist's suggestions and interventions, 3) you  must have difficulty trusting the therapist and forming a therapeutic alliance, 4) you must be prone to arguing, criticizing, or expressing frustration during therapy sessions."
    },
    {
        type: "verbose", content: "You should try your best to act like a verbose patient: 1) you must provide lengthy, detailed responses to questions, even if not directly relevant, 2) you must elaborate on personal experiences, thoughts, and feelings extensively, 3) you must require minimal prompting to continue talking, 4) you must demonstrate difficulty in allowing the therapist to guide the conversation, and 5) you may need to be gently interrupted to keep the session on track."
    },
    {
        type: "guarded", content: "You should try your best to act like a guarded patient: 1) you must provide brief, vague, or evasive answers to questions, 2) you must demonstrate reluctance to share personal information or feelings to the therapist, 3) you must require more prompting and encouragement from the therapist to open up, and 4) you may express distrust or skepticism towards the therapist."
    },
    {
        type: "go off on tangents", content: "You should try your best to act like a patient who go off on tangents: 1) you must start answering a question but quickly veer off into unrelated topics, 2) you must share personal anecdotes or experiences that are not directly relevant to the question asked, 3) you must demonstrate difficulty staying focused on the topic at hand, 4) you must require redirection to bring the conversation back to the relevant points, and 5) you may need gentle reminders to stay on track throughout the session."
    },
    {
        type: "ingratiating", content: "You should try your best to act like an ingratiating patient: 1) you must express excessive praise or admiration for the therapist, 2) you must seek approval or validation from the therapist frequently, 3) you must agree with the therapist's statements or suggestions readily, even if they may not fully understand or agree, 4) you must demonstrate eager-to-please behavior and avoid expressing disagreement or dissatisfaction, and 5) you may minimize or downplay their own concerns or symptoms to maintain a positive image."
    }
];

export const patientTypeDescriptions = [
    {
        type: "plain", content: "The client is designed as a standard patient who has no specific types."
    },
    {
        type: "hostile", content: "A hostile client may 1) exhibit anger, aggression, or resistance towards the therapist or the therapeutic process, 2) be confrontational, challenging, or dismissive of the therapist's suggestions and interventions, 3) have difficulty trusting the therapist and forming a therapeutic alliance, 4) be prone to arguing, criticizing, or expressing frustration during therapy sessions."
    },
    {
        type: "verbose", content: "A verbose client may 1) provide lengthy, detailed responses to questions, even if not directly relevant, 2) elaborate on personal experiences, thoughts, and feelings extensively, 3) require minimal prompting to continue talking, 4) demonstrate difficulty in allowing the therapist to guide the conversation, and 5) need to be gently interrupted to keep the session on track."
    },
    {
        type: "guarded", content: "A guarded client may 1) provide brief, vague, or evasive answers to questions, 2) demonstrate reluctance to share personal information or feelings, 3) require more prompting and encouragement to open up, and 4) express distrust or skepticism towards the therapist."
    },
    {
        type: "go off on tangents", content: "A client who goes off on tangent may 1) start answering a question but quickly veer off into unrelated topics, 2) share personal anecdotes or experiences that are not directly relevant to the question asked, 3) demonstrate difficulty staying focused on the topic at hand, 4) require redirection to bring the conversation back to the relevant points, and 5) need gentle reminders to stay on track throughout the session."
    },
    {
        type: "ingratiating", content: "An ingratiating client may 1) express excessive praise or admiration for the therapist, 2) seek approval or validation from the therapist frequently, 3) agree with the therapist's statements or suggestions readily, even if they may not fully understand or agree, 4) demonstrate eager-to-please behavior and avoid expressing disagreement or dissatisfaction, and 5) minimize or downplay their own concerns or symptoms to maintain a positive image."
    }
]

async function fetchPatientName(setSelectedPatientName: (name: string) => void) {
    try {
        fetch('/api/prompt')
            .then(response => response.json()
                .then(data => {
                    console.log(data.name);
                    setSelectedPatientName(data.name);
                })
            ).catch(error => {
                console.log(error);
            });
    } catch (error) {
        console.log("error fetching patient name")
    }
}


interface PatientTypeListProps {
    readonly typeList: string[];
    selectedType?: string;
    handleChoiceClick: (choice: string) => void;
}

const PatientTypeDropdownList: React.FC<PatientTypeListProps> = ({ typeList, selectedType, handleChoiceClick }) => {

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button className="relative flex h-[35px] w-[190px] items-center gap-x-1.5 rounded-md bg-background py-1.5 pl-3 pr-10 text-left text-sm font-semibold text-gray-900 shadow-sm ring-2 ring-inset ring-gray-900 hover:bg-accent hover:text-accent-foreground dark:text-white dark:ring-white">
                    <div className="grow text-left">
                        {selectedType}
                    </div>
                    <span className="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2">
                        <svg className="-mr-1 h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                        </svg>
                    </span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                sideOffset={8}
                align="start"
                className="focus:outline-none] absolute z-10 mt-2 w-56 origin-top-right rounded-md shadow-lg ring-1 ring-black ring-opacity-5"
            >
                <div className="max-h-40 overflow-y-auto">
                    {typeList.map((choice, index) => (
                        <DropdownMenuItem key={index} className="flex-col items-start" onClick={() => handleChoiceClick(choice)}>
                            <div className="text-sm font-medium">{choice}</div>
                        </DropdownMenuItem>
                    ))}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export function PatientTypeMenu() {
    const patientTypeListValues: string[] = patientTypes.map(({ type }) => type);

    const [selectedType, setSelectedType] = useState('Client Types');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [selectedTypeDescription, setSelectedTypeDescription] = useState('');
    const [isStarted, setIsStarted] = useState(false);
    const [selectedPatientName, setSelectedPatentName] = useState('');

    const handleChoiceClick = (choice: string) => {
        setSelectedType(choice);
    }

    const handleSubmitButtonClick = () => {
        const typeDescription = patientTypeDescriptions.find((description) => description.type === selectedType);
        if (typeDescription) {
            setSelectedTypeDescription(typeDescription.content);
        }
        setIsSubmitted(true);
    }

    const handleStartButtonClick = async () => {
        if (selectedType) {
            const selectedPatientTypeContent = patientTypes.find((item) => item.type === selectedType)?.content;

            try {
                const response = await fetch('/api/prompt', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ patientTypeContent: selectedPatientTypeContent })
                });
                if (response.ok) {
                    console.log("patient type submitted.");
                } else {
                    console.log("error sending patient type to server");
                }
            } catch (error) {
                console.log(error);
            }
        }
        fetchPatientName(setSelectedPatentName);
        setIsStarted(true);

    }



    return (
        <div>
            {!isStarted ? (<div>
                <p className="leading-normal pt-4 font-medium text-zinc-500">
                    In this CBT session, you will talk to a client simulated by AI with a virtual patient profile. You goal is to indentify the cognitive conceptualization diagram of the patient by communicating with them and using CBT skills.
                </p>

                <p className="leading-normal pt-4 font-medium text-zinc-500">
                    We provide five typical client types, including "hostile", "verbose", "guarded", "go off on tangents", and "ingratiating". Please select one patient type and press the submit button to start the conversation.
                </p>
                <div className="max-w-6xl px-0">
                    <div>
                        <label className="block pt-4 text-sm font-medium leading-6">Please select a client type</label>
                        <div className="flex items-center justify-start">
                            <div>
                                <PatientTypeDropdownList typeList={patientTypeListValues} selectedType={selectedType} handleChoiceClick={handleChoiceClick} ></PatientTypeDropdownList>
                            </div>
                            <div className="ml-10">
                                <button onClick={handleSubmitButtonClick}
                                    className="flex h-[35px] w-[135px] items-center justify-center rounded-md bg-black text-sm font-semibold text-white dark:bg-white dark:text-black"
                                >
                                    See description
                                </button>
                            </div>
                        </div>
                    </div>
                    {isSubmitted && selectedTypeDescription && (
                        <div>
                            <p className="block pt-5 font-medium leading-6">
                                {selectedTypeDescription}
                            </p>
                            {!isStarted && (
                                <div className="block pt-5">
                                    <button onClick={handleStartButtonClick}
                                        className="flex h-[35px] w-[155px] items-center justify-center rounded-md bg-green-500 text-sm font-semibold text-white"
                                    >
                                        Start conversation
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>) : (<div>
                <p className="leading-normal pt-4 font-medium text-black dark:text-white">
                    Now you may start your session with client <b>{selectedPatientName}</b>. Please start the session by entering the first greeting to <b>{selectedPatientName}</b> in the textbox below.
                </p>
            </div>)
            }
        </div>
    )
}