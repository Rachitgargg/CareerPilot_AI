from pydantic import BaseModel, Field
from typing import List, Optional

class AtsAnalysis(BaseModel):
    score: int = Field(description="Integrate an ATS rating score between 0 and 100")
    strengths: List[str] = Field(default_factory=list, description="Key professional strengths highlighted in profile")
    weaknesses: List[str] = Field(default_factory=list, description="Core weaknesses or gaps in experience/formatting")
    improvements: List[str] = Field(default_factory=list, description="Actionable points to improve career standing and resume strength")

class SkillsGap(BaseModel):
    existing_skills: List[str] = Field(default_factory=list, description="Skills the user already has")
    missing_skills: List[str] = Field(default_factory=list, description="Skills the user needs for target roles")
    priority_skills: List[str] = Field(default_factory=list, description="Top 3 skills to focus on first")

class ProjectRecommendation(BaseModel):
    title: str = Field(description="Title of the recommended project")
    description: str = Field(description="Details of what the project does")
    difficulty: str = Field(description="Difficulty level: Beginner / Intermediate / Advanced")
    technologies: List[str] = Field(default_factory=list, description="Tech stack list to build the project")
    reason: str = Field(description="Why this project helps the user's career")

class LearningRoadmap(BaseModel):
    next_30_days: List[str] = Field(default_factory=list, description="30 day plan")
    next_90_days: List[str] = Field(default_factory=list, description="90 day plan")
    long_term: List[str] = Field(default_factory=list, description="Long term learning objectives")

class MasterAnalysis(BaseModel):
    career_summary: str = Field(description="3-4 sentence professional summary")
    ats_analysis: AtsAnalysis
    skills_gap: SkillsGap
    project_recommendations: List[ProjectRecommendation] = Field(default_factory=list)
    learning_roadmap: LearningRoadmap
    career_recommendations: List[str] = Field(default_factory=list)
    interview_focus: List[str] = Field(default_factory=list)
