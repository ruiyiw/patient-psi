export interface PatientProfile {
    name: string,
    id: string,
    type: [string],
    history: string,
    helpless_belief: [string],
    unlovable_belief: [string],
    worthless_belief: [string],
    intermediate_belief: string,
    intermediate_belief_depression: string,
    coping_strategies: string,
    situation: string,
    auto_thought: string,
    emotion: [string],
    behavior: string
}

export const initialProfile: PatientProfile = {
    name: '',
    id: '',
    type: [''],
    history: '',
    helpless_belief: [''],
    unlovable_belief: [''],
    worthless_belief: [''],
    intermediate_belief: '',
    intermediate_belief_depression: '',
    coping_strategies: '',
    situation: '',
    auto_thought: '',
    emotion: [''],
    behavior: ''
}