'use client'

import * as React from 'react'
import { useEffect, useState } from 'react';

import { CheckboxReactHookFormMultiple } from './diagram-checkbox'
import { diagramTitles, diagramTitlesCCD, diagramDescriptionMapping, diagramTruthMapping } from '@/app/api/data/diagram-fields'
import { sessionInstructions } from '@/app/api/data/session-instruction'
import { CCDResult, CCDTruth } from '@/lib/types'
import { getCCDResult, getCCDTruth, saveCCDResult, saveCCDTruth } from '@/app/actions'
import { PatientProfile, initialProfile } from '@/app/api/data/patient-profiles'

async function fetchPatientProfile(
    setPatientProfile: (patientProfile: PatientProfile) => void) {
    try {
        fetch('/api/profile')
            .then(response => response.json()
                .then(data => {
                    setPatientProfile(data.profile);
                })
            ).catch(error => {
                console.log(error);
            });
    } catch (error) {
        console.log("error fetching patient profile")
    }
}


interface DiagramListProps {
    userId: string
    chatId: string
    patientProfile: PatientProfile
}


export function DiagramList({ userId, chatId }: DiagramListProps) {
    const [patientProfile, setPatientProfile] = useState<PatientProfile | null>(initialProfile);
    const [isFetchedPatientProfile, setIsFetchedPatientProfile] = useState(false);
    const [savedCCDTruth, setSavedCCDTruth] = useState<CCDTruth | null>(null);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [inputValues, setInputValues] = useState(
        Object.fromEntries([...diagramTitles, ...diagramTitlesCCD].map(name => [name, '']))
    );

    useEffect(() => {
        const fetchProfile = async () => {
            if (!isFetchedPatientProfile) {
                await fetchPatientProfile(setPatientProfile);
                setIsFetchedPatientProfile(true);
            }
        };

        fetchProfile();
    }, [isFetchedPatientProfile]);


    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>, name: string) => {
        setInputValues(prevValues => ({
            ...prevValues,
            [name]: event.target.value,
        }));
    };


    const handleSubmit = async () => {
        try {
            console.log(patientProfile);
            const ccdTruth: CCDTruth = {
                userId: userId,
                chatId: chatId,
                createdAt: new Date(),
                relatedHistory: patientProfile?.history ?? '',
                Helpless: patientProfile?.helpless_belief ?? [''],
                Unlovable: patientProfile?.unlovable_belief ?? [''],
                Worthless: patientProfile?.worthless_belief ?? [''],
                intermediateBelief: patientProfile?.intermediate_belief ?? '',
                intermediateBeliefDepression: patientProfile?.intermediate_belief_depression ?? '',
                copingStrategies: patientProfile?.coping_strategies ?? '',
                situation: patientProfile?.situation ?? '',
                autoThought: patientProfile?.auto_thought ?? '',
                Emotion: patientProfile?.emotion ?? [''],
                behavior: patientProfile?.behavior ?? '',
            }
            await saveCCDTruth(ccdTruth);
            setSavedCCDTruth(await getCCDTruth(userId, chatId));
            console.log('CCD truth saved successfully');
            console.log(savedCCDTruth);

            const ccdResult: CCDResult = {
                userId: userId,
                chatId: chatId,
                createdAt: new Date(),
                relatedHistory: inputValues['Related History'],
                intermediateBelief: inputValues['Intermediate Belief(s)'],
                intermediateBeliefDepression: inputValues['Intermediate Belief(s) During Depression'],
                copingStrategies: inputValues['Coping Strategies'],
                situation: inputValues['The Situation'],
                autoThought: inputValues['Automatic Thought(s)'],
                behavior: inputValues['Behavior(s)'],
            }
            await saveCCDResult(ccdResult);
            console.log('CCD results saved successfully');
            const savedCCDResult = getCCDResult(userId, chatId);
            console.log(savedCCDResult);
            setIsSubmitted(true);
        } catch (error) {
            console.error('Error saving input values to KV database:', error);
        }
    };

    return (
        <div className="flex flex-col h-full">

            <div className="flex items-center justify-between p-4 px-5">
                <h4 className="text-lg font-bold">Patient Intake and Cognitive Conceptualization Diagram</h4>
            </div>
            <div className="mb-2 px-5 space-y-6 overflow-auto">
                <label className="block pt-1 leading-normal pt-4 font-medium">
                    <span className="font-bold">Instructions: </span> {sessionInstructions["ccd"]}
                </label>

                {diagramTitles.map(name => (
                    <div key={name}>
                        <label className="block text-base font-bold mb-1">{name}</label>
                        <label className="block pt-1 text-sm font-medium leading-6 text-zinc-500">
                            {diagramDescriptionMapping[name]}
                        </label>
                        {name == "Core Belief(s)" ? (
                            <div className="mt-2">
                                {["Helpless", "Unlovable", "Worthless"].map((category, index) => (
                                    <div className="flex flex-col items-start space-y-2 mt-2">
                                        <CheckboxReactHookFormMultiple key={`${category}-${index}`} category={category} />
                                        {isSubmitted && <label className="block leading-normal font-medium text-blue-600">
                                            <span className="font-bold">Reference:</span>
                                            {savedCCDTruth?.[category]?.length === 0 ? (
                                                <div className="pt-1 leading-normal text-blue-600">not chosen</div>
                                            ) : (
                                                savedCCDTruth?.[category]?.map((item: string, index: number) => (
                                                    <div key={index} className="pt-1 leading-normal text-blue-600">
                                                        {item}
                                                    </div>
                                                ))
                                            )}
                                        </label>}
                                    </div>)
                                )}
                            </div>
                        ) :
                            (<div className="flex flex-col items-start space-y-2 mt-2">
                                <textarea
                                    className="w-full h-[80px] px-3 py-2 text-sm leading-tight text-gray-700 border rounded-md appearance-none focus:outline-none focus:shadow-outline-blue focus:border-blue-300"
                                    value={inputValues[name]}
                                    onChange={(event) => handleChange(event, name)}
                                />
                                {isSubmitted && Object.entries(diagramTruthMapping).map(([key, value]) => (
                                    name === key && (
                                        <label key={key} className="block pt-1 leading-normal font-medium text-blue-600">
                                            <span className="font-bold">Reference: </span>{savedCCDTruth?.[value]}
                                        </label>
                                    )
                                ))}
                            </div>)

                        }
                    </div>
                ))}
                <hr className="my-4 border-gray-300" />
                <label className="block pt-1 leading-normal pt-4 font-medium">
                    <span className="font-bold">Instructions: </span>{sessionInstructions["ccd-situation"]}
                </label>
                {diagramTitlesCCD.map(name => (
                    <div key={name}>
                        <label className="block text-base font-bold mb-1">{name}</label>
                        <label className="block pt-1 text-sm font-medium leading-6 text-zinc-500">
                            {diagramDescriptionMapping[name]}
                        </label>
                        {name == "Emotion(s)" ? (
                            <div className="flex flex-col items-start space-y-2 mt-2">
                                {["Emotions"].map((category, index) => (
                                    <div className="flex flex-col items-start space-y-2 mt-2">
                                        <CheckboxReactHookFormMultiple key={`${category}-${index}`} category={category} />
                                        {isSubmitted && <label className="block leading-normal font-medium text-blue-600">
                                            <span className="font-bold">Reference:</span>
                                            {
                                                savedCCDTruth?.['Emotion']?.map((item: string, index: number) => (
                                                    <div key={index} className="pt-1 leading-normal text-blue-600">
                                                        {item}
                                                    </div>
                                                )
                                                )}
                                        </label>}
                                    </div>))}

                            </div>
                        ) : (<div className="flex flex-col items-start space-y-2 mt-2">
                            <textarea
                                className="w-full h-[80px] px-3 py-2 text-sm leading-tight text-gray-700 border rounded-md appearance-none focus:outline-none focus:shadow-outline-blue focus:border-blue-300"
                                value={inputValues[name]}
                                onChange={(event) => handleChange(event, name)}
                            />
                            {isSubmitted && Object.entries(diagramTruthMapping).map(([key, value]) => (
                                name === key && (
                                    <label key={key} className="block pt-1 leading-normal font-medium text-blue-600">
                                        <span className="font-bold">Reference: </span>{savedCCDTruth?.[value]}
                                    </label>
                                )
                            ))}
                        </div>)}
                    </div>
                ))}
            </div>
            <div className="flex justify-end p-4">
                <button
                    className="bg-green-500 text-sm font-semiboldflex h-[35px] w-[220px] items-center justify-center rounded-md bg-red-500 text-sm font-semibold text-white"
                    onClick={handleSubmit}
                >
                    Submit and review answers
                </button>
            </div>
        </div>
    );
}

