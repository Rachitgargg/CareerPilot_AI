from pydantic import BaseModel, Field
from typing import List, Optional

class TechnicalQuestion(BaseModel):
    question: str = Field(description="The technical question to ask the candidate.")
    why_it_matters: str = Field(description="Why this specific question is relevant/matters for the target role.")
    what_to_cover: str = Field(description="Key concepts, projects, or achievements from the candidate's background to highlight in the response.")

class BehavioralQuestion(BaseModel):
    question: str = Field(description="The behavioral question (e.g. STAR format) personalized to the candidate.")
    what_interviewer_is_looking_for: str = Field(description="The soft skills, competencies, or traits the interviewer is evaluating.")

class HRQuestion(BaseModel):
    question: str = Field(description="The general HR or cultural fit question.")
    suggested_answer_direction: str = Field(description="Strategic advice on how the candidate should frame their answer.")

class PreparationPlan(BaseModel):
    thirty_minutes: List[str] = Field(..., alias="30_minutes", description="Quick tasks to perform in the last 30 minutes before the interview.")
    one_day: List[str] = Field(..., alias="1_day", description="Preparations to do one day before the interview.")
    one_week: List[str] = Field(..., alias="1_week", description="Action plan for a full week of preparation.")

    model_config = {
        "populate_by_name": True
    }

class InterviewCoachReport(BaseModel):
    role: str = Field(description="The target role of the interview.")
    difficulty: str = Field(description="Difficulty level of the interview (e.g., Junior, Intermediate, Senior, Lead).")
    readiness_score: int = Field(description="Estimated readiness score from 0 to 100.")
    strengths: List[str] = Field(default_factory=list, description="Candidate strengths matching the role requirements.")
    weaknesses: List[str] = Field(default_factory=list, description="Candidate areas of improvement or gaps relevant to the role.")
    focus_areas: List[str] = Field(default_factory=list, description="Core subjects/areas the candidate should focus on.")
    technical_questions: List[TechnicalQuestion] = Field(default_factory=list, description="Tailored technical interview questions.")
    behavioral_questions: List[BehavioralQuestion] = Field(default_factory=list, description="Tailored behavioral interview questions.")
    hr_questions: List[HRQuestion] = Field(default_factory=list, description="Tailored HR or cultural fit questions.")
    coding_topics: List[str] = Field(default_factory=list, description="Concepts and programming topics to review.")
    preparation_plan: PreparationPlan = Field(description="Structured study plan divided into short, medium, and long-term milestones.")
    confidence_score: float = Field(description="Confidence rating of the AI coach report (between 0.0 and 1.0).")

    model_config = {
        "populate_by_name": True
    }

class InterviewRequest(BaseModel):
    target_role: str = Field(description="The specific role the user is interviewing for.")
    job_description: Optional[str] = Field(None, description="Optional job description description text.")
