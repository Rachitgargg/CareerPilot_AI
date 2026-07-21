from pydantic import BaseModel
from typing import List, Optional

class MatchBreakdown(BaseModel):
    skills_match: int
    projects_match: int
    experience_match: int
    education_match: int
    keywords_match: int

class BulletPointImprovement(BaseModel):
    original: str
    suggested: str
    reason: str

class SectionReordering(BaseModel):
    section: str
    reason: str

class ResumeTailoringReport(BaseModel):
    overall_match_score: int
    breakdown: MatchBreakdown
    missing_keywords: List[str]
    matched_keywords: List[str]
    missing_skills: List[str]
    recommended_skill_additions: List[str]
    projects_to_highlight: List[str]
    projects_to_deemphasize: List[str]
    bullet_point_improvements: List[BulletPointImprovement]
    professional_summary_suggestion: str
    section_reordering: List[SectionReordering]
    ats_recommendations: List[str]
    final_recommendations: List[str]
    confidence_score: float

class TailoringRequest(BaseModel):
    job_description: str

class ResumeTailoringApiResponse(BaseModel):
    overall_match_score: int
    breakdown: str
    matching_strengths: List[str]
    missing_keywords: List[str]
    bullet_point_improvements: List[BulletPointImprovement]
    final_recommendations: str
