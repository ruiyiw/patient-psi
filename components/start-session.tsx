import { UseChatHelpers } from 'ai/react'

import { Button } from '@/components/ui/button'
import { ExternalLink } from '@/components/external-link'
import { IconArrowRight } from '@/components/ui/icons'

import { useState, useEffect } from 'react';
import { PatientTypeMenu } from '@/components/patient-type-menu';

import { useUIState, useAIState } from 'ai/rsc';
import React from 'react'
import { PatientProfile, initialProfile } from '@/app/api/data/patient-profiles'
import { Stopwatch } from '@/components/stopwatch'


const exampleMessages = [
    {
        heading: 'Explain technical concepts',
        message: `What is a "serverless function"?`
    },
    {
        heading: 'Summarize an article',
        message: 'Summarize the following article for a 2nd grader: \n'
    },
    {
        heading: 'Draft an email',
        message: `Draft an email to my boss about the following: \n`
    }
]

interface StartSessionProps {
    onStartedChange: (isStarted: boolean) => void;
    onSetPatientProfile: (selectedPatientName: PatientProfile) => void;
}

export function StartSession({ onStartedChange, onSetPatientProfile }: StartSessionProps) {
    const [isStarted, setIsStarted] = useState(false);
    const [patientProfile, setPatientProfile] = useState<PatientProfile>(initialProfile);

    const handleStartedChange = (isStarted: boolean) => {
        setIsStarted(isStarted);
    }

    const handleSetdPatientProfile = (patientProfile: PatientProfile) => {
        setPatientProfile(patientProfile);
        console.log(patientProfile);
    }

    useEffect(() => {
        onStartedChange(isStarted);
    }, [isStarted, onStartedChange]);

    useEffect(() => {
        onSetPatientProfile(patientProfile);
    }, [patientProfile, onSetPatientProfile]);



    return (
        <div className="mx-auto max-w-2xl px-4">
            <div className="flex flex-col gap-2 rounded-lg border bg-background p-8">
                <h1 className="text-xl font-semibold">
                    CBT session with a simulated client powered by AI
                </h1>
                <PatientTypeMenu
                    onStartedChange={handleStartedChange}
                    onSetPatientProfile={handleSetdPatientProfile} ></PatientTypeMenu>
            </div>
            <Stopwatch />
        </div >
    )
}
