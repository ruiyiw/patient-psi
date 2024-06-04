export const diagramDescriptionMapping: { [key: string]: string } = {
    'relatedHistory': 'Please capture important background information about the client, such as significant life events or circumstances that may have contributed to their current mental state or behavior.',
    'coreBelief': 'Please select any core beliefs that match the your understanding of the client under the following three categories: Hopeless, Unlovable, and Worthless Core beliefs.',
    'intermediateBelief': 'Please identify the client\'s intermediate beliefs that influence their perception of themselves, others, and the world around them.',
    'intermediateBeliefDepression': 'Please identify how the client\'s intermediate beliefs change and become more negative during episodes of depression, if applicable',
    'copingStrategies': 'Please describe the client\'s coping strategies in managing the emotions',
    'situation': 'Please record the specific situation or trigger that the client recently encountered, which led to negative automatic thoughts and emotional distress.',
    'autoThought': 'Please record the client\'s immediate, unfiltered thoughts that arise in response to the identified situation.',
    'emotion': 'Please select any emotions experienced by the client in relation to the situation and their automatic thoughts.',
    'behavior': 'Please describe the client\'s behavioral responses and actions taken as a result of their automatic thoughts and emotions in the given situation.',
};

export const diagramTitleMapping: { [key: string]: string } = {
    'relatedHistory': 'Relevant History',
    'coreBelief': 'Core Belief(s)',
    'intermediateBelief': 'Intermediate Belief(s)',
    'intermediateBeliefDepression': 'Intermediate Belief (s) During Depression',
    'copingStrategies': 'Coping Strategies',
    'situation': 'The Situation',
    'autoThought': 'Automatic Thoughts(s)',
    'emotion': 'Emotion(s)',
    'behavior': 'Behavior(s)',
}

export const diagramRelated: string[] = ['coreBelief', 'intermediateBelief', 'copingStrategies']

export const diagramCCD: string[] = ['situation', 'autoThought', 'emotion', 'behavior']
