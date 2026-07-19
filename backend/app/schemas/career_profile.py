from pydantic import BaseModel, Field
from typing import List, Optional

class PersonalInfo(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    linkedin: Optional[str] = None
    github: Optional[str] = None
    portfolio: Optional[str] = None

class EducationEntry(BaseModel):
    institution: Optional[str] = None
    degree: Optional[str] = None
    field: Optional[str] = None
    start_year: Optional[str] = None
    end_year: Optional[str] = None
    grade: Optional[str] = None

class ExperienceEntry(BaseModel):
    company: Optional[str] = None
    role: Optional[str] = None
    duration: Optional[str] = None
    description: Optional[str] = None
    technologies: List[str] = Field(default_factory=list)

class ProjectEntry(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    technologies: List[str] = Field(default_factory=list)
    links: List[str] = Field(default_factory=list)

class SkillsInfo(BaseModel):
    programming_languages: List[str] = Field(default_factory=list)
    frameworks: List[str] = Field(default_factory=list)
    tools: List[str] = Field(default_factory=list)
    databases: List[str] = Field(default_factory=list)
    ai_ml_skills: List[str] = Field(default_factory=list)

class CertificationEntry(BaseModel):
    name: Optional[str] = None
    issuer: Optional[str] = None
    year: Optional[str] = None

class CareerProfile(BaseModel):
    personal: PersonalInfo = Field(default_factory=PersonalInfo)
    education: List[EducationEntry] = Field(default_factory=list)
    experience: List[ExperienceEntry] = Field(default_factory=list)
    projects: List[ProjectEntry] = Field(default_factory=list)
    skills: SkillsInfo = Field(default_factory=SkillsInfo)
    certifications: List[CertificationEntry] = Field(default_factory=list)
    achievements: List[str] = Field(default_factory=list)
    career_interests: List[str] = Field(default_factory=list)
    summary: Optional[str] = None
