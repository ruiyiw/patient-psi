import { UseChatHelpers } from 'ai/react'

import { Button } from '@/components/ui/button'
import { ExternalLink } from '@/components/external-link'
import { IconArrowRight } from '@/components/ui/icons'

import { useState, useEffect } from 'react';
import { PatientTypeMenu } from '@/components/patient-type-menu';

import { useUIState, useAIState } from 'ai/rsc';
import React from 'react'


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
    onSetSelectedPatientName: (selectedPatientName: string) => void;
}

export function StartSession({ onStartedChange, onSetSelectedPatientName }: StartSessionProps) {
    const [isStarted, setIsStarted] = useState(false);
    const [selectedPatientName, setSelectedPatientName] = useState('');

    const handleStartedChange = (isStarted: boolean) => {
        setIsStarted(isStarted);
    }

    const handleSetSelectedPatientName = (selectedPatientName: string) => {
        setSelectedPatientName(selectedPatientName);
        console.log(selectedPatientName);
    }

    useEffect(() => {
        onStartedChange(isStarted);
    }, [isStarted, onStartedChange]);

    useEffect(() => {
        onSetSelectedPatientName(selectedPatientName);
    }, [selectedPatientName, onSetSelectedPatientName])

    return (
        <div className="mx-auto max-w-2xl px-4">
            <div className="flex flex-col gap-2 rounded-lg border bg-background p-8">
                <h1 className="text-xl font-semibold">
                    CBT session with a simulated client powered by AI
                </h1>
                <PatientTypeMenu onStartedChange={handleStartedChange} onSetSelectedPatientName={handleSetSelectedPatientName}></PatientTypeMenu>
            </div>
        </div >
    )
}
