import os
import json
import shutil
import pytest
import hashlib
from pathlib import Path
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient
from app.main import app
from app.core.config import settings
from app.schemas.jobs import JobDiscoveryResponse
from app.services.jobs.job_matcher import calculate_match_score

client = TestClient(app)

@pytest.fixture(autouse=True)
def clean_storage_after_test():
    """Clean storage sessions after each test."""
    yield
    if settings.STORAGE_DIR.exists():
        try:
            shutil.rmtree(settings.STORAGE_DIR)
        except Exception:
            pass

@pytest.fixture
def dummy_session_and_profile_and_analysis():
    session_id = "test-session-jobs"
    session_dir = settings.STORAGE_DIR / "sessions" / session_id
    session_dir.mkdir(parents=True, exist_ok=True)
    
    # 1. Save profile.json
    profile_data = {
        "personal": {"name": "Job seeker", "email": "seeker@example.com"},
        "education": [
            {
                "institution": "State University",
                "degree": "B.S.",
                "field": "Computer Science",
                "end_year": "2026"  # Indicates upcoming grad (student)
            }
        ],
        "experience": [
            {
                "company": "Startup Inc",
                "role": "Software Engineer Intern",
                "duration": "6 months",
                "description": "Wrote backend APIs in Python."
            }
        ],
        "projects": [],
        "skills": {
            "programming_languages": ["Python", "JavaScript"],
            "frameworks": ["FastAPI", "React"],
            "tools": [],
            "databases": ["PostgreSQL"],
            "ai_ml_skills": []
        },
        "certifications": [],
        "achievements": [],
        "career_interests": ["AI Engineer", "Backend Developer"],
        "summary": "Junior full stack dev."
    }
    with open(session_dir / "profile.json", "w", encoding="utf-8") as f:
        json.dump(profile_data, f)
        
    # 2. Save master_analysis.json
    analysis_data = {
        "career_summary": "Looking for entry-level engineering roles.",
        "ats_analysis": {"score": 78, "strengths": ["FastAPI skill"], "weaknesses": [], "improvements": []},
        "skills_gap": {"existing_skills": ["Python", "FastAPI"], "missing_skills": ["Docker", "Kubernetes"], "priority_skills": []},
        "project_recommendations": [],
        "learning_roadmap": {"next_30_days": [], "next_90_days": [], "long_term": []},
        "career_recommendations": [],
        "interview_focus": ["Python coding"]
    }
    with open(session_dir / "master_analysis.json", "w", encoding="utf-8") as f:
        json.dump(analysis_data, f)
        
    return session_id

@pytest.fixture
def mock_jobs_response():
    return JobDiscoveryResponse(
        recommended_jobs=[
            {
                "title": "AI Engineer Intern",
                "company": "OpenAI",
                "location": "Remote",
                "match_score": 95,
                "why_this_matches": "High skills overlap with FastAPI and Python.",
                "matching_strengths": ["Python expertise", "FastAPI backend building"],
                "matching_skills": ["Python", "FastAPI"],
                "missing_skills": ["Docker"],
                "learning_recommendations": ["Learn Docker basics in 1 day."],
                "application_priority": "High",
                "url": "https://careers.openai.com/jobs/ai-intern-0"
            }
        ],
        career_summary="Great market fit for AI engineering internships.",
        overall_recommendation="Apply immediately to OpenAI and Anthropic positions."
    )

def test_match_scoring():
    """Verify that Python match scoring algorithm weights skills, location, role, and experience correctly."""
    from app.schemas.career_profile import CareerProfile
    
    profile = CareerProfile.model_validate({
        "personal": {},
        "education": [],
        "experience": [
            {"company": "A", "role": "Engineer", "duration": "5 years"} # 5 years -> Senior alignment
        ],
        "projects": [],
        "skills": {
            "programming_languages": ["Python", "Go"],
            "frameworks": ["FastAPI"],
            "tools": [],
            "databases": ["PostgreSQL"],
            "ai_ml_skills": []
        },
        "certifications": [],
        "achievements": [],
        "career_interests": []
    })
    
    job = {
        "title": "Senior AI Engineer",
        "company": "Meta",
        "location": "Remote",
        "employment_type": "Full-time",
        "experience_level": "Senior",
        "required_skills": ["Python", "FastAPI", "PyTorch", "Kubernetes"],
        "url": "https://careers.meta.com/jobs/senior-ai-0"
    }
    
    matched = calculate_match_score(job, profile, preferred_role="AI Engineer", preferred_location="Remote")
    assert matched["match_score"] > 0
    assert matched["match_score"] <= 100
    assert "Python" in matched["matching_skills"]
    assert "FastAPI" in matched["matching_skills"]
    assert "Pytorch" in matched["missing_skills"]

@patch("app.services.llm.ai_service.generate_job_recommendations")
def test_job_discovery_success_with_params(mock_generate, dummy_session_and_profile_and_analysis, mock_jobs_response):
    session_id = dummy_session_and_profile_and_analysis
    mock_generate.return_value = mock_jobs_response
    
    response = client.post(
        f"/api/v1/jobs/{session_id}",
        json={"preferred_role": "AI Engineer", "location": "Remote"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert len(data["recommended_jobs"]) == 1
    assert data["recommended_jobs"][0]["company"] == "OpenAI"
    assert data["recommended_jobs"][0]["match_score"] == 95
    assert data["recommended_jobs"][0]["application_priority"] == "High"
    assert "Apply immediately" in data["overall_recommendation"]

@patch("app.services.llm.ai_service.generate_job_recommendations")
def test_job_discovery_success_empty_request(mock_generate, dummy_session_and_profile_and_analysis, mock_jobs_response):
    session_id = dummy_session_and_profile_and_analysis
    mock_generate.return_value = mock_jobs_response
    
    # Empty request body (both fields default to None, should infer role and location)
    response = client.post(
        f"/api/v1/jobs/{session_id}",
        json={}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["recommended_jobs"][0]["company"] == "OpenAI"

@patch("app.services.llm.ai_service.generate_job_recommendations")
def test_job_discovery_cache_reuse(mock_generate, dummy_session_and_profile_and_analysis, mock_jobs_response):
    session_id = dummy_session_and_profile_and_analysis
    mock_generate.return_value = mock_jobs_response
    
    # 1. First call (Cache Miss)
    res1 = client.post(
        f"/api/v1/jobs/{session_id}",
        json={"preferred_role": "AI Engineer", "location": "Remote"}
    )
    assert res1.status_code == 200
    assert mock_generate.call_count == 1
    
    # Find files in jobs cache dir to modify
    cache_dir = settings.STORAGE_DIR / "sessions" / session_id / "jobs"
    files = list(cache_dir.glob("*.json"))
    assert len(files) == 1
    
    # 2. Modify cache file
    with open(files[0], "r", encoding="utf-8") as f:
        cached = json.load(f)
    cached["overall_recommendation"] = "Apply to Microsoft instead"
    with open(files[0], "w", encoding="utf-8") as f:
        json.dump(cached, f)
        
    # 3. Second call (Cache Hit)
    res2 = client.post(
        f"/api/v1/jobs/{session_id}",
        json={"preferred_role": "AI Engineer", "location": "Remote"}
    )
    assert res2.status_code == 200
    assert mock_generate.call_count == 1  # No extra LLM call
    assert res2.json()["overall_recommendation"] == "Apply to Microsoft instead"

def test_jobs_invalid_session():
    response = client.post(
        "/api/v1/jobs/non-existent-session-id",
        json={}
    )
    assert response.status_code == 404
    assert "Session not found" in response.json()["detail"]

def test_jobs_missing_profile():
    session_id = "missing-profile-session-jobs"
    session_dir = settings.STORAGE_DIR / "sessions" / session_id
    session_dir.mkdir(parents=True, exist_ok=True)
    
    # profile.json is missing, but master_analysis.json is present (hypothetical)
    analysis_data = {"career_summary": "test"}
    with open(session_dir / "master_analysis.json", "w", encoding="utf-8") as f:
        json.dump(analysis_data, f)
        
    response = client.post(
        f"/api/v1/jobs/{session_id}",
        json={}
    )
    assert response.status_code == 404
    assert "Career profile not found" in response.json()["detail"]

def test_jobs_missing_analysis():
    session_id = "missing-analysis-session-jobs"
    session_dir = settings.STORAGE_DIR / "sessions" / session_id
    session_dir.mkdir(parents=True, exist_ok=True)
    
    # profile.json is present, but master_analysis.json is missing
    profile_data = {"personal": {"name": "Test"}}
    with open(session_dir / "profile.json", "w", encoding="utf-8") as f:
        json.dump(profile_data, f)
        
    response = client.post(
        f"/api/v1/jobs/{session_id}",
        json={}
    )
    assert response.status_code == 404
    assert "Master career analysis not found" in response.json()["detail"]
