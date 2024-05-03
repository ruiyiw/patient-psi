'use client'

import * as React from 'react'

import { cn } from '@/lib/utils'
import { SidebarList } from '@/components/sidebar-list'
import { buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { kv } from '@vercel/kv';

import { CheckboxReactHookFormMultiple } from './diagram-checkbox'
import { diagramTitles, diagramTitlesCCD, diagramDescriptionMapping } from '@/app/api/data/diagram-fields'
import { sessionInstructions } from '@/app/api/data/session-instruction'

interface DiagramListProps {
    userId?: string
}

export function DiagramList({ userId }: DiagramListProps) {
    const [inputValues, setInputValues] = React.useState(
        Object.fromEntries([...diagramTitles, ...diagramTitlesCCD].map(name => [name, '']))
    );

    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>, name: string) => {
        setInputValues(prevValues => ({
            ...prevValues,
            [name]: event.target.value,
        }));
    };

    const handleSubmit = async () => {
        try {
            await kv.hmset('inputValues', inputValues);
            console.log('Input values saved to KV database');
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
                                {["Helpless", "Unlovable", "Worthless"].map((category) => (<CheckboxReactHookFormMultiple category={category} />))}
                            </div>
                        ) :
                            (<div className="flex items-start space-x-2 mt-2">
                                <textarea
                                    className="w-full h-[80px] px-3 py-2 text-sm leading-tight text-gray-700 border rounded-md appearance-none focus:outline-none focus:shadow-outline-blue focus:border-blue-300"
                                    value={inputValues[name]}
                                    onChange={(event) => handleChange(event, name)}
                                />
                            </div>)}
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
                            <div className="mt-2">
                                {["Emotions"].map((category) => (<CheckboxReactHookFormMultiple category={category} />))}
                            </div>
                        ) : (<div className="flex items-start space-x-2 mt-2">
                            <textarea
                                className="w-full h-[80px] px-3 py-2 text-sm leading-tight text-gray-700 border rounded-md appearance-none focus:outline-none focus:shadow-outline-blue focus:border-blue-300"
                                value={inputValues[name]}
                                onChange={(event) => handleChange(event, name)}
                            />
                        </div>)}
                    </div>
                ))}
            </div>
            <div className="flex justify-end p-4">
                <button
                    className={buttonVariants({ variant: 'default', size: 'sm' })}
                    onClick={handleSubmit}
                >
                    Submit
                </button>
            </div>
        </div>
    );
}

