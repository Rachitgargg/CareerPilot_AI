from pydantic import BaseModel, Field
from typing import List, Optional

class JobDiscoveryRequest(BaseModel):
    preferred_role: Optional[str] = Field(None, description="The preferred target role for job discovery.")
    location: Optional[str] = Field(None, description="Preferred location constraint (e.g. Remote, New York, etc.).")

class RecommendedJob(BaseModel):
    title: str = Field(description="The job title of the discovery result.")
    company: str = Field(description="The hiring company name.")
    location: str = Field(description="Job location (city/state or Remote).")
    match_score: int = Field(description="The match score computed by Python ranking engine (0 to 100).")
    why_this_matches: str = Field(description="AI explanation explaining why this job aligns with the candidate.")
    matching_strengths: List[str] = Field(default_factory=list, description="Candidate strengths that directly match the job role.")
    matching_skills: List[str] = Field(default_factory=list, description="Candidate skills that match required skills of the job.")
    missing_skills: List[str] = Field(default_factory=list, description="Required skills from the job description not present in candidate's profile.")
    learning_recommendations: List[str] = Field(default_factory=list, description="Targeted learning actions to acquire missing skills.")
    application_priority: str = Field(description="Application urgency: High / Medium / Low.")
    url: str = Field(description="The direct job application URL.")

class JobDiscoveryResponse(BaseModel):
    recommended_jobs: List[RecommendedJob] = Field(default_factory=list, description="List of top 10 recommended and ranked jobs.")
    career_summary: str = Field(description="Short overall summary matching candidate profile to the current job market.")
    overall_recommendation: str = Field(description="Strategic overall career recommendation for the candidate.")
