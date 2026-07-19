import hashlib
import re
from typing import Dict, Any, Optional
from app.schemas.career_profile import CareerProfile
from app.schemas.master_analysis import MasterAnalysis

def compute_interview_cache_key(target_role: str, job_description: Optional[str] = None) -> str:
    """
    Computes a deterministic, filesystem-safe unique cache key for interview coach reports.
    Uses the slugified target role and the SHA-256 hash of the job description (if present).
    """
    # Clean and slugify target role
    role_norm = re.sub(r'[^a-zA-Z0-9]', '_', target_role.strip().lower())
    role_norm = "_".join(filter(None, role_norm.split("_"))) # reduce multiple underscores
    
    if job_description and job_description.strip():
        jd_hash = hashlib.sha256(job_description.strip().encode("utf-8")).hexdigest()
        return f"{role_norm}_{jd_hash}"
    else:
        return f"{role_norm}_no_jd"

def determine_interview_focus(
    target_role: str,
    career_profile: CareerProfile,
    master_analysis: MasterAnalysis,
    job_description: Optional[str] = None
) -> Dict[str, Any]:
    """
    Python-based logic to determine the interview difficulty, focus areas, and coding topics.
    If a job description is supplied, it is prioritized.
    Otherwise, we infer using CareerProfile and MasterAnalysis.
    """
    focus = {
        "target_role": target_role,
        "difficulty": "Intermediate",
        "focus_areas": [],
        "coding_topics": []
    }
    
    # 1. Experience Level / Difficulty inference
    years_of_experience = len(career_profile.experience) if career_profile.experience else 0
        
    text_to_search = job_description or ""
    if not text_to_search and master_analysis.career_summary:
        text_to_search = master_analysis.career_summary
        
    text_lower = text_to_search.lower()
    if any(k in text_lower for k in ["senior", "sr.", "lead", "principal", "staff", "architect"]):
        focus["difficulty"] = "Senior"
    elif any(k in text_lower for k in ["junior", "jr.", "entry", "associate", "intern"]):
        focus["difficulty"] = "Junior"
    elif years_of_experience >= 5:
        focus["difficulty"] = "Senior"
    elif years_of_experience <= 1:
        focus["difficulty"] = "Junior"
    else:
        focus["difficulty"] = "Intermediate"
        
    # 2. Focus Areas & Coding Topics inference
    if job_description:
        desc_lower = job_description.lower()
        if "system design" in desc_lower or "architecture" in desc_lower:
            focus["focus_areas"].append("System Design")
            focus["coding_topics"].append("System Design Patterns")
        if any(x in desc_lower for x in ["machine learning", "ai", "llm", "deep learning", "nlp"]):
            focus["focus_areas"].append("Machine Learning & AI")
            focus["coding_topics"].extend(["Neural Networks", "LLMs", "Model Evaluation"])
        if any(x in desc_lower for x in ["react", "frontend", "javascript", "typescript", "angular", "vue"]):
            focus["focus_areas"].append("Frontend Development")
            focus["coding_topics"].extend(["React Components", "State Management", "DOM Performance"])
        if any(x in desc_lower for x in ["database", "sql", "postgresql", "mysql", "nosql"]):
            focus["focus_areas"].append("Databases & Data Modeling")
            focus["coding_topics"].append("SQL Queries & Indexing")
        if any(x in desc_lower for x in ["api", "rest", "graphql", "backend", "microservices"]):
            focus["focus_areas"].append("API Design & Microservices")
            focus["coding_topics"].append("REST API Design & Web Protocols")
            
    # Fallbacks using MasterAnalysis and CareerProfile
    if not focus["focus_areas"]:
        if master_analysis.interview_focus:
            focus["focus_areas"].extend(master_analysis.interview_focus)
        else:
            focus["focus_areas"].append("General Software Engineering")
            
    if not focus["coding_topics"]:
        if career_profile.skills and career_profile.skills.programming_languages:
            langs = ", ".join(career_profile.skills.programming_languages)
            focus["coding_topics"].append(f"Algorithms in {langs}")
        else:
            focus["coding_topics"].append("Data Structures & Algorithms")
            
    # De-duplicate
    focus["focus_areas"] = list(dict.fromkeys(focus["focus_areas"]))
    focus["coding_topics"] = list(dict.fromkeys(focus["coding_topics"]))
    
    return focus


def slice_interview_context(
    profile: CareerProfile,
    analysis: MasterAnalysis,
    focus_areas: list
) -> tuple[dict, dict]:
    """
    Slices the CareerProfile and MasterAnalysis to include only the required
    sub-sections to minimize prompt size and avoid injecting the entire objects.
    """
    focus_lower = [f.lower() for f in focus_areas]
    
    # Check if technical focus
    is_technical = any(
        any(k in f for k in ["tech", "cod", "develop", "engineer", "system", "data", "algorithm", "python", "javascript", "sql"]) 
        for f in focus_lower
    )
    # Check if behavioral focus
    is_behavioral = any(
        any(k in f for k in ["behav", "soft", "lead", "manage", "communication", "conflict"]) 
        for f in focus_lower
    )
    
    sliced_profile = {}
    sliced_analysis = {}
    
    # Always include career summary if available
    if profile.summary:
        sliced_profile["summary"] = profile.summary
    if analysis.career_summary:
        sliced_analysis["career_summary"] = analysis.career_summary

    if is_technical:
        # Technical interview -> Technical resume chunks, Relevant MasterAnalysis (skills_gap, interview_focus) and Profile skills/projects
        sliced_profile["skills"] = profile.skills.model_dump() if profile.skills else {}
        sliced_profile["projects"] = [
            {"name": p.name, "description": p.description, "technologies": p.technologies} 
            for p in profile.projects
        ] if profile.projects else []
        
        if analysis.skills_gap:
            sliced_analysis["skills_gap"] = analysis.skills_gap.model_dump()
        sliced_analysis["interview_focus"] = analysis.interview_focus
        
    elif is_behavioral:
        # Behavioral interview -> Projects, Experience, and Strengths
        sliced_profile["projects"] = [
            {"name": p.name, "description": p.description} 
            for p in profile.projects
        ] if profile.projects else []
        sliced_profile["experience"] = [
            {"company": e.company, "role": e.role, "duration": e.duration, "description": e.description} 
            for e in profile.experience
        ] if profile.experience else []
        
        if analysis.ats_analysis:
            sliced_analysis["strengths"] = analysis.ats_analysis.strengths
            
    else:
        # General interview -> CareerProfile summary, MasterAnalysis summary, Education, Experience summary
        sliced_profile["education"] = [
            {"institution": edu.institution, "degree": edu.degree, "field": edu.field} 
            for edu in profile.education
        ] if profile.education else []
        sliced_profile["experience"] = [
            {"company": e.company, "role": e.role, "duration": e.duration} 
            for e in profile.experience
        ] if profile.experience else []
        
        if analysis.ats_analysis:
            sliced_analysis["strengths"] = analysis.ats_analysis.strengths
            sliced_analysis["weaknesses"] = analysis.ats_analysis.weaknesses
            
    return sliced_profile, sliced_analysis
