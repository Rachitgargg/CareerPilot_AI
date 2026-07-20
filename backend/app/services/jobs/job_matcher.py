import re
from typing import List, Dict, Any, Optional
from app.schemas.career_profile import CareerProfile
from app.schemas.master_analysis import MasterAnalysis

def normalize_job_listings(raw_jobs: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Deterministically normalizes raw job results to ensure all required fields are present.
    No LLM is used here.
    """
    normalized = []
    for job in raw_jobs:
        normalized.append({
            "title": str(job.get("title", "Software Engineer")).strip(),
            "company": str(job.get("company", "Tech Company")).strip(),
            "location": str(job.get("location", "Remote")).strip(),
            "employment_type": str(job.get("employment_type", "Full-time")).strip(),
            "experience_level": str(job.get("experience_level", "Mid-level")).strip(),
            "required_skills": [str(s).strip() for s in job.get("required_skills", [])],
            "url": str(job.get("url", "https://careers.google.com")).strip()
        })
    return normalized

def calculate_match_score(
    job: Dict[str, Any],
    profile: CareerProfile,
    preferred_role: Optional[str] = None,
    preferred_location: Optional[str] = None
) -> Dict[str, Any]:
    """
    Computes a deterministic match score (0-100) based on multiple weighted factors:
    1. Skills overlap (50%): candidate skills matching job requirements.
    2. Role/Title alignment (20%): target role keywords matching job title.
    3. Experience level alignment (15%): years of experience matching job level.
    4. Location alignment (15%): Remote vs. preferred location.
    """
    score = 0.0
    
    # Extract candidate skills
    candidate_skills = set()
    if profile.skills:
        for cat in ["programming_languages", "frameworks", "tools", "databases", "ai_ml_skills"]:
            skills_list = getattr(profile.skills, cat, []) or []
            candidate_skills.update([s.lower() for s in skills_list])
            
    # 1. Skills Overlap (Weight: 50 points)
    job_skills = [s.lower() for s in job.get("required_skills", [])]
    matching_skills = []
    missing_skills = []
    
    if job_skills:
        for skill in job_skills:
            # Check for exact or substring match
            if any(skill in cs or cs in skill for cs in candidate_skills):
                matching_skills.append(skill)
            else:
                missing_skills.append(skill)
                
        overlap_ratio = len(matching_skills) / len(job_skills)
        score += overlap_ratio * 50
    else:
        score += 35 # Default points if no skills required
        
    # 2. Role/Title Alignment (Weight: 20 points)
    target_role = preferred_role or "Software Engineer"
    role_words = set(re.findall(r'\w+', target_role.lower()))
    title_words = set(re.findall(r'\w+', job.get("title", "").lower()))
    
    word_overlap = role_words.intersection(title_words)
    if word_overlap:
        # Scale score based on overlap density
        score += (len(word_overlap) / len(role_words)) * 20
    else:
        # Fallback partial points for developer/engineer matching
        if "engineer" in target_role.lower() and "engineer" in job.get("title", "").lower():
            score += 10
        elif "developer" in target_role.lower() and "developer" in job.get("title", "").lower():
            score += 10
            
    # 3. Experience Level Alignment (Weight: 15 points)
    years_exp = len(profile.experience) if profile.experience else 0
    job_exp_level = job.get("experience_level", "Mid-level").lower()
    
    if "intern" in job_exp_level or "internship" in job_exp_level:
        if years_exp <= 1:
            score += 15
        else:
            score += 5
    elif "junior" in job_exp_level or "entry" in job_exp_level:
        if years_exp <= 2:
            score += 15
        else:
            score += 8
    elif "senior" in job_exp_level or "staff" in job_exp_level or "lead" in job_exp_level:
        if years_exp >= 4:
            score += 15
        elif years_exp >= 2:
            score += 8
        else:
            score += 3
    else: # Mid-level
        if 2 <= years_exp <= 5:
            score += 15
        else:
            score += 10
            
    # 4. Location Alignment (Weight: 15 points)
    pref_loc = preferred_location or "Remote"
    job_loc = job.get("location", "Remote")
    
    if pref_loc.lower() == job_loc.lower():
        score += 15
    elif "remote" in pref_loc.lower() and "remote" in job_loc.lower():
        score += 15
    elif "remote" in job_loc.lower():
        score += 12  # remote jobs are highly acceptable usually
    else:
        # Check substring match (e.g. New York)
        if pref_loc.lower() in job_loc.lower() or job_loc.lower() in pref_loc.lower():
            score += 10
            
    # Map raw lists back to proper casing from candidate's original skills
    casing_map = {}
    if profile.skills:
        for cat in ["programming_languages", "frameworks", "tools", "databases", "ai_ml_skills"]:
            for original_skill in (getattr(profile.skills, cat, []) or []):
                casing_map[original_skill.lower()] = original_skill
                
    mapped_matching_skills = [casing_map.get(s, s.capitalize()) for s in matching_skills]
    mapped_missing_skills = [s.capitalize() for s in missing_skills]
    
    final_score = min(100, max(0, int(round(score))))
    
    # Return enriched job dict
    matched_job = dict(job)
    matched_job.update({
        "match_score": final_score,
        "matching_skills": mapped_matching_skills,
        "missing_skills": mapped_missing_skills
    })
    return matched_job

def rank_and_select_jobs(
    normalized_jobs: List[Dict[str, Any]],
    profile: CareerProfile,
    preferred_role: Optional[str] = None,
    preferred_location: Optional[str] = None
) -> List[Dict[str, Any]]:
    """
    Ranks the jobs pool using deterministic Python match scoring and keeps the top 10.
    """
    scored_jobs = []
    for job in normalized_jobs:
        scored_jobs.append(calculate_match_score(job, profile, preferred_role, preferred_location))
        
    # Sort by match score descending
    scored_jobs.sort(key=lambda x: x["match_score"], reverse=True)
    
    # Return top 10
    return scored_jobs[:10]
