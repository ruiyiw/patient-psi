from typing import List
from pydantic import BaseModel, Field
from langchain_core.prompts import ChatPromptTemplate


class CognitiveModel(BaseModel):
    situation: str = Field(
        ...,
        description="The context or specific event that triggers a thought process or emotional response. Examples: `Thinking about bills`, `Thinking of asking son for help in revising resume`, `Memory of being criticized by boss`")
    automatic_thoughts: str = Field(
        ...,
        description="These are spontaneous thoughts that occur in response to a situation, often without conscious control. Examples: `What if I run out of money?`, `I should be able to do this on my own.`, `I should have tried harder.`")
    emotion: str = Field(
        ...,
        description="The feelings or emotions that arise in response to the automatic thoughts. You must pick at most three of the emotions in this set: `sad/down/lonely/unhappy`, `anxious/worried/fearful/scared/tense`, `angry/mad/irritated/annoyed`, `ashamed/humiliated/embarrassed`, `disappointed`, `jealous/envious`, `guilty`, `hurt`, `suspicious`.")
    behavior: str = Field(
        ...,
        description="The actions or behaviors that result from the emotions and thoughts. Examples: `Continues to sit on couch; ruminates about his failures`, `Avoids asking son for help`, `Ruminates about what a failure he was`.")


class GenerationModel:
    prompt_template = ChatPromptTemplate.from_messages([
        ('system', 'You are a CBT therapist who is professional and empathetic. Now you just ended a therapy session with a patient. Your goal is to reconstruct the cognitive model of the patient based on your conversations.'),
        ('user', '{query}\n\nFormat instructions:\n{format_instructions}You should follow the concepts of cognitive behavioral therapy and figure out the cognitive behavioral model of the patient from a therapy session.')
    ])

    class CognitiveConceptualizationDiagram(BaseModel):
        life_history: str = Field(
            ...,
            description="This field is intended to capture important background information about the patient, such as significant life events or circumstances that may have contributed to their current mental state or behavior.")
        core_beliefs: str = Field(
            ...,
            description="Core beliefs are fundamental, deeply held beliefs that a person has about themselves, others, or the world. These are often central to a person's identity and worldview, and in CBT, are considered to influence how they interpret experiences. You must choose at least one core belief category from the 3 buckets: `Helpless belief`, `Unlovable belief`, and `Worthless belief`")
        core_belief_description: str = Field(
            ...,
            description="Given the core belief you have choose, pick one or more of the descriptions from the selected core belief category: If it is Helpless belief, pick at least one from `I am helpless`, `I am incompetent`, `I am powerless, weak, vulnerable`, `I am a victim`, `I am needy`, `I am trapped`, `I am out of control`, I am a failure, a loser`, `I am defective`. If it is Unlovable belief, pick at least one from `I am unlovable`, `I am unattractive`, `I am undesired, unwanted`, `I am bound to be rejected`, `I am bound to be abandoned`, `I am bound to be alone`. If it is Worthless belief, pick at least one from `I am worthless, a waste`, `I am immoral`, `I am bad - dangerous, toxic, evil`, `I don't deserve to live`.")
        intermediate_beliefs: str = Field(
            ...,
            description="These are beliefs that are not as deep-seated as core beliefs but still play a significant role in how a person interprets and interacts with the world. They often take the form of attitudes, rules, and assumptions.")
        intermediate_beliefs_during_depression: str = Field(
            ...,
            description="This field refers to the intermediate beliefs that are specifically active or prominent during periods of depression. It's aimed at understanding how these beliefs change or influence the person's thinking and behavior during depressive episodes.")
        coping_strategies: str = Field(
            ...,
            description="Coping strategies are the methods a person uses to deal with stress or difficult emotions. This could include both healthy strategies (like exercise, seeking social support) and unhealthy ones (like substance abuse, avoidance).")
        cognitive_models: List[CognitiveModel] = Field(
            ...,
            description="You must provide at least 3 distinct cognitive models based on the instructions.")
