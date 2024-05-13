'use client';

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

import { useEffect, useState } from "react";
import { patientTypes, patientTypeDescriptions } from "@/app/api/data/patient-types"
import { PatientProfile, initialProfile } from '@/app/api/data/patient-profiles'

// Call api/prompt/GET to fetch patient profile 
async function fetchPatientProfile(
    setIsStarted: (isStarted: boolean) => void,
    setPatientProfile: (patientProfile: PatientProfile) => void) {
    try {
        fetch('/api/prompt')
            .then(response => response.json()
                .then(data => {
                    setIsStarted(true);
                    setPatientProfile(data.profile);
                })
            ).catch(error => {
                console.log(error);
            });
    } catch (error) {
        console.log("error fetching patient profile")
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
                <div className="max-h-90 overflow-y-auto">
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

interface PatientTypeMenuProps {
    onStartedChange: (isStarted: boolean) => void;
    onSetPatientProfile: (selectedPatientName: PatientProfile) => void;
}

export function PatientTypeMenu({ onStartedChange, onSetPatientProfile }: PatientTypeMenuProps) {
    const patientTypeListValues: string[] = patientTypes.map(({ type }) => type);

    const [selectedType, setSelectedType] = useState('Client Types');
    const [selectedTypeDescription, setSelectedTypeDescription] = useState('');
    const [isStarted, setIsStarted] = useState(false);
    const [patientProfile, setPatientProfile] = useState<PatientProfile>(initialProfile);

    useEffect(() => {
        onStartedChange(isStarted);
    }, [isStarted, onStartedChange]);

    useEffect(() => {
        onSetPatientProfile(patientProfile);
    }, [patientProfile, onSetPatientProfile]);



    const handleChoiceClick = (choice: string) => {
        setSelectedType(choice);
        const typeDescription = patientTypeDescriptions.find((description) => description.type === choice);
        if (typeDescription) {
            setSelectedTypeDescription(typeDescription.content);
        }
    }

    const handleStartButtonClick = async () => {
        const isValidType = patientTypes.some((type) => type.type === selectedType);
        if (isValidType && selectedType) {
            // const selectedPatientTypeContent = patientTypes.find((item) => item.type === selectedType)?.content;
            console.log(selectedType);
            try {
                const response = await fetch('/api/prompt', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ patientType: selectedType })
                });
                if (response.ok) {
                    console.log("patient type submitted.");
                } else {
                    console.log("error sending patient type to server");
                }
            } catch (error) {
                console.log(error);
            }
            fetchPatientProfile(setIsStarted, setPatientProfile);
        } else {
            alert('Please select a valid patient type.');
        }

    }


    return (
        <div>
            {!isStarted ? (<div>
                <p className="leading-normal pt-4 font-medium text-zinc-500">
                    In this CBT session, you will talk to a client simulated by AI with a virtual patient profile. You goal is to indentify the cognitive conceptualization diagram of the client by communicating with them and using CBT skills.
                </p>

                <p className="leading-normal pt-4 font-medium text-zinc-500">
                    We provide 5 typical client types and one plain client without any types. Please select a patient type to see the description.
                </p>
                <div className="max-w-6xl px-0">
                    <div>
                        <label className="block pt-4 text-sm font-medium leading-6">Please select a client type</label>
                        <div className="flex items-center justify-start">
                            <div>
                                <PatientTypeDropdownList typeList={patientTypeListValues} selectedType={selectedType} handleChoiceClick={handleChoiceClick} ></PatientTypeDropdownList>
                            </div>
                        </div>
                    </div>
                    {selectedType !== '' && (
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
            </div>) : (<>
            </>)
            }
        </div>
    )
}