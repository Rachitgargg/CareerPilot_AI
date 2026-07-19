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
from app.schemas.tailoring import ResumeTailoringReport

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
    # Setup dummy session
    session_id = "test-session-tailoring"
    session_dir = settings.STORAGE_DIR / "sessions" / session_id
    session_dir.mkdir(parents=True, exist_ok=True)
    
    # 1. Save dummy profile.json
    profile_data = {
        "personal": {"name": "Test Tailor", "email": "tailor@example.com"},
        "education": [],
        "experience": [],
        "projects": [],
        "skills": {
            "programming_languages": ["Python", "Go"],
            "frameworks": ["FastAPI"],
            "tools": [],
            "databases": [],
            "ai_ml_skills": []
        },
        "certifications": [],
        "achievements": [],
        "career_interests": [],
        "summary": "Software engineer"
    }
    with open(session_dir / "profile.json", "w", encoding="utf-8") as f:
        json.dump(profile_data, f)
        
    # 2. Save dummy master_analysis.json
    analysis_data = {
        "career_summary": "Analysis summary",
        "ats_analysis": {"score": 75, "strengths": [], "weaknesses": [], "improvements": []},
        "skills_gap": {"existing_skills": [], "missing_skills": [], "priority_skills": []},
        "project_recommendations": [],
        "learning_roadmap": {"next_30_days": [], "next_90_days": [], "long_term": []},
        "career_recommendations": [],
        "interview_focus": []
    }
    with open(session_dir / "master_analysis.json", "w", encoding="utf-8") as f:
        json.dump(analysis_data, f)
        
    return session_id

@pytest.fixture
def mock_tailoring_report():
    return ResumeTailoringReport(
        overall_match_score=85,
        breakdown={
            "skills_match": 90,
            "projects_match": 80,
            "experience_match": 75,
            "education_match": 95,
            "keywords_match": 70
        },
        missing_keywords=["kubernetes", "docker"],
        matched_keywords=["python", "fastapi"],
        missing_skills=["kubernetes"],
        recommended_skill_additions=["docker"],
        projects_to_highlight=["FastAPI Project"],
        projects_to_deemphasize=["Old VB6 Project"],
        bullet_point_improvements=[
            {
                "original": "Worked on backend stuff.",
                "suggested": "Built FastAPI microservices.",
                "reason": "Clearer tech stack."
            }
        ],
        professional_summary_suggestion="Experienced engineer specialized in FastAPI.",
        section_reordering=[
            {
                "section": "Skills",
                "reason": "Move skills section to top to highlight tech match."
            }
        ],
        ats_recommendations=["Add Docker keyword."],
        final_recommendations=["Apply today."],
        confidence_score=0.95
    )


@patch("app.services.llm.ai_service.generate_resume_tailoring")
def test_tailor_success(mock_generate, dummy_session_and_profile_and_analysis, mock_tailoring_report):
    session_id = dummy_session_and_profile_and_analysis
    mock_generate.return_value = mock_tailoring_report
    
    job_description = "We are looking for a Python engineer with FastAPI experience."
    response = client.post(
        f"/api/v1/tailor/{session_id}",
        json={"job_description": job_description}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["overall_match_score"] == 85
    assert data["breakdown"]["skills_match"] == 90
    assert "kubernetes" in data["missing_keywords"]
    assert "python" in data["matched_keywords"]
    assert data["confidence_score"] == 0.95
    
    # Verify cached file is saved as job hash JSON
    job_hash = hashlib.sha256(job_description.strip().encode("utf-8")).hexdigest()
    cache_path = settings.STORAGE_DIR / "sessions" / session_id / "tailoring" / f"{job_hash}.json"
    assert cache_path.exists()
    
    with open(cache_path, "r", encoding="utf-8") as f:
        cached_data = json.load(f)
    assert cached_data["overall_match_score"] == 85


@patch("app.services.llm.ai_service.generate_resume_tailoring")
def test_tailor_cache_reuse(mock_generate, dummy_session_and_profile_and_analysis, mock_tailoring_report):
    session_id = dummy_session_and_profile_and_analysis
    mock_generate.return_value = mock_tailoring_report
    
    job_description = "We are looking for a Python engineer with FastAPI experience."
    
    # First request: computes and caches
    res1 = client.post(
        f"/api/v1/tailor/{session_id}",
        json={"job_description": job_description}
    )
    assert res1.status_code == 200
    assert mock_generate.call_count == 1
    
    # Manually modify the cached file
    job_hash = hashlib.sha256(job_description.strip().encode("utf-8")).hexdigest()
    cache_path = settings.STORAGE_DIR / "sessions" / session_id / "tailoring" / f"{job_hash}.json"
    with open(cache_path, "r", encoding="utf-8") as f:
        cache_data = json.load(f)
        
    cache_data["overall_match_score"] = 99
    with open(cache_path, "w", encoding="utf-8") as f:
        json.dump(cache_data, f)
        
    # Second request: should hit cache directly and return modified overall score
    res2 = client.post(
        f"/api/v1/tailor/{session_id}",
        json={"job_description": job_description}
    )
    assert res2.status_code == 200
    assert mock_generate.call_count == 1  # Still 1 call!
    assert res2.json()["overall_match_score"] == 99


def test_tailor_invalid_session():
    response = client.post(
        "/api/v1/tailor/non-existent-session-12345",
        json={"job_description": "Wanted: Developer"}
    )
    assert response.status_code == 404
    assert "Session not found" in response.json()["detail"]


def test_tailor_missing_profile():
    # Session dir exists, but profile.json is missing
    session_id = "missing-profile-tailoring"
    session_dir = settings.STORAGE_DIR / "sessions" / session_id
    session_dir.mkdir(parents=True, exist_ok=True)
    
    response = client.post(
        f"/api/v1/tailor/{session_id}",
        json={"job_description": "Wanted: Developer"}
    )
    assert response.status_code == 404
    assert "Career profile not found" in response.json()["detail"]


def test_tailor_missing_analysis():
    # Session and profile exist, but master_analysis.json is missing
    session_id = "missing-analysis-tailoring"
    session_dir = settings.STORAGE_DIR / "sessions" / session_id
    session_dir.mkdir(parents=True, exist_ok=True)
    
    # Save profile
    profile_data = {
        "personal": {"name": "Test User"},
        "summary": "Software engineer"
    }
    with open(session_dir / "profile.json", "w", encoding="utf-8") as f:
        json.dump(profile_data, f)
        
    response = client.post(
        f"/api/v1/tailor/{session_id}",
        json={"job_description": "Wanted: Developer"}
    )
    assert response.status_code == 404
    assert "Master career analysis not found" in response.json()["detail"]


def test_tailor_empty_job_description(dummy_session_and_profile_and_analysis):
    session_id = dummy_session_and_profile_and_analysis
    
    # Send empty description
    response = client.post(
        f"/api/v1/tailor/{session_id}",
        json={"job_description": ""}
    )
    assert response.status_code == 400
    assert "Job description cannot be empty" in response.json()["detail"]
    
    # Send whitespace description
    response_ws = client.post(
        f"/api/v1/tailor/{session_id}",
        json={"job_description": "    "}
    )
    assert response_ws.status_code == 400
