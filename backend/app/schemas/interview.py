from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List


class InterviewCreate(BaseModel):
    role: str
    experience: str
    difficulty: str
    question_count: int = 5


class InterviewResponse(BaseModel):
    id: int
    role: str
    experience: str
    difficulty: str
    overall_score: float
    created_at: datetime

    model_config = {'from_attributes': True}


class QuestionResponse(BaseModel):
    id: int
    question_text: str
    order_index: int

    model_config = {'from_attributes': True}


class AnswerSubmit(BaseModel):
    question_id: int
    answer_text: str


class EvaluationResponse(BaseModel):
    technical_accuracy: float
    concept_clarity: float
    depth: float
    communication: float
    problem_solving: float
    overall_score: float
    strengths: list
    weaknesses: list
    improvements: list
    ideal_answer: str
    feedback: str

    model_config = {'from_attributes': True}
