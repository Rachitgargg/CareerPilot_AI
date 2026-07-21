from pydantic import BaseModel, field_validator
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

    @classmethod
    @field_validator("projects_to_highlight", "projects_to_deemphasize", mode="before")
    def clean_projects_list(cls, v):
        if not isinstance(v, list):
            return v
        cleaned = []
        for item in v:
            if isinstance(item, dict):
                name = item.get("project") or item.get("name") or item.get("title") or "Project"
                rationale = item.get("rationale") or item.get("reason") or item.get("description") or ""
                if rationale:
                    cleaned.append(f"{name}: {rationale}")
                else:
                    cleaned.append(str(name))
            else:
                cleaned.append(str(item))
        return cleaned

class TailoringRequest(BaseModel):
    job_description: str

class ResumeTailoringApiResponse(BaseModel):
    overall_match_score: int
    breakdown: str
    matching_strengths: List[str]
    missing_keywords: List[str]
    bullet_point_improvements: List[BulletPointImprovement]
    final_recommendations: str
