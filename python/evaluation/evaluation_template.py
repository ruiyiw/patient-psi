from pydantic import BaseModel, Field
from langchain_core.prompts import ChatPromptTemplate


class CCDDescriptions:
    situation: str = """Situation is the external event or context that triggers a response."""
    emotion: str = """Emotion is the emotional response elicited by the situation."""
    behavior: str = """Behavior is the actions taken in response to the situation."""
    automatic_thoughts: str = """Automatic thoughts are quick, evaluative thoughts about the situation without deliberation or reasoning."""
    intermediate_beliefs: str = """Intermediate beliefs are the underlying rules, attitudes, or assumptions."""
    core_beliefs: str = """Core beliefs are the fundamental, deeply held beliefs about oneself, others, and the world."""
    coping_strategies: str = """Coping strategies are techniques or actions used to manage stress and negative emotions."""


class FidelityEvaluators:
    class GeneralEvaluator(BaseModel):
        general: tuple[str, str] = Field(
            ...,
            description="""Requirement: Evaluate how accurately the simulated patient in the conversation resembles real patients of this type. Your reference of real patients is shown in the therapy transcript. Output a string among the following choices: 'not accurately at all', 'slightly accurately', 'moderately accurately', 'very accurately', and 'extremely accurately' into the 'answer' field. Output your reasoning process into the 'reasoning' field."""
        )

    class EmotionalStateEvaluator(BaseModel):
        emotional_state: tuple[str, str] = Field(
            ...,
            description="""Requirement: Evaluate how accurately the simulated patient in the conversation represents the emotional states of individuals with their stated conditions, such as sad, anxious, fearful, etc. Your reference of real patients is shown in the therapy transcript. Output a string among the following choices: 'not accurately at all', 'slightly accurately', 'moderately accurately', 'very accurately', and 'extremely accurately' into the 'answer' field. Output your reasoning process into the 'reasoning' field."""
        )

    class TypeEvaluator(BaseModel):
        type: tuple[str, str] = Field(
            ...,
            description="""Requirement: Evaluate how accurately the simulated patient in the conversation represents represent the communication style of individuals with their stated conditions. Your reference of real patients is shown in the therapy transcript. Output a string among the following choices: 'not accurately at all', 'slightly accurately', 'moderately accurately', 'very accurately', and 'extremely accurately' into the 'answer' field. Output your reasoning process into the 'reasoning' field.""")

    class CognitionEvaluator(BaseModel):
        cognition: tuple[str, str] = Field(
            ...,
            description="""Requirement: Evaluate how accurately the patient reflects the symptoms and cognition model with of individuals with their stated conditions. Your reference of real patients is shown in the therapy transcript. Output a string among the following choices: 'not accurately at all', 'slightly accurately', 'moderately accurately', 'very accurately', and 'extremely accurately' into the 'answer' field. Output your reasoning process into the 'reasoning' field."""
        )
