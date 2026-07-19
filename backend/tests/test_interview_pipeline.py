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
from app.schemas.interview import InterviewCoachReport
from app.services.interview.interview_parser import compute_interview_cache_key

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
    session_id = "test-session-interview"
    session_dir = settings.STORAGE_DIR / "sessions" / session_id
    session_dir.mkdir(parents=True, exist_ok=True)
    
    # 1. Save profile.json
    profile_data = {
        "personal": {"name": "Interview Candidate", "email": "candidate@example.com"},
        "education": [],
        "experience": [
            {
                "company": "Tech Corp",
                "role": "Software Engineer",
                "duration": "2 years",
                "description": "Built web apps using React and Python."
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
        "career_interests": [],
        "summary": "Full stack software engineer"
    }
    with open(session_dir / "profile.json", "w", encoding="utf-8") as f:
        json.dump(profile_data, f)
        
    # 2. Save master_analysis.json
    analysis_data = {
        "career_summary": "Strong software engineer with full stack skills.",
        "ats_analysis": {"score": 80, "strengths": [], "weaknesses": [], "improvements": []},
        "skills_gap": {"existing_skills": [], "missing_skills": [], "priority_skills": []},
        "project_recommendations": [],
        "learning_roadmap": {"next_30_days": [], "next_90_days": [], "long_term": []},
        "career_recommendations": [],
        "interview_focus": ["Python coding", "React rendering", "Web security"]
    }
    with open(session_dir / "master_analysis.json", "w", encoding="utf-8") as f:
        json.dump(analysis_data, f)
        
    return session_id

@pytest.fixture
def mock_interview_report():
    return InterviewCoachReport(
        role="AI Engineer",
        difficulty="Intermediate",
        readiness_score=85,
        strengths=["Strong Python base", "Experience with REST APIs"],
        weaknesses=["No commercial LLM experience", "System Design exposure is theoretical"],
        focus_areas=["LLM application engineering", "RAG architectures"],
        technical_questions=[
            {
                "question": "What is the difference between embedding model and reasoning model?",
                "why_it_matters": "Tests foundational understanding of AI stack.",
                "what_to_cover": "Discuss tokens, vector representation vs. generative generation."
            }
        ],
        behavioral_questions=[
            {
                "question": "Tell me about a time you solved a complex backend issue.",
                "what_interviewer_is_looking_for": "Problem solving skills, STAR framework usage."
            }
        ],
        hr_questions=[
            {
                "question": "Why do you want to transition to AI Engineering?",
                "suggested_answer_direction": "Connect experience in Python and FastAPI to high-quality AI service builds."
            }
        ],
        coding_topics=["FastAPI endpoints", "Vector database indices"],
        preparation_plan={
            "30_minutes": ["Quickly read LLM guidelines", "Review vector collection schemas"],
            "1_day": ["Practice LangChain graph flow coding", "Review master analysis gaps"],
            "1_week": ["Implement RAG prototype", "Study system design scalability"]
        },
        confidence_score=0.92
    )

def test_cache_key_correctness():
    """Verify that cache keys are computed correctly and filesystem-safe."""
    # 1. Without JD
    key_no_jd = compute_interview_cache_key("AI Engineer")
    assert key_no_jd == "ai_engineer_no_jd"
    
    key_no_jd_dirty = compute_interview_cache_key("  AI -- Engineer ! ")
    assert key_no_jd_dirty == "ai_engineer_no_jd"

    # 2. With JD
    jd = "Build and optimize REST APIs using FastAPI and LangChain."
    jd_hash = hashlib.sha256(jd.strip().encode("utf-8")).hexdigest()
    key_with_jd = compute_interview_cache_key("AI Engineer", jd)
    assert key_with_jd == f"ai_engineer_{jd_hash}"

@patch("app.services.llm.ai_service.generate_interview_coach")
def test_interview_success_with_jd(mock_generate, dummy_session_and_profile_and_analysis, mock_interview_report):
    session_id = dummy_session_and_profile_and_analysis
    mock_generate.return_value = mock_interview_report
    
    jd = "Looking for an engineer to build FastAPI backends with RAG architectures."
    response = client.post(
        f"/api/v1/interview/{session_id}",
        json={"target_role": "AI Engineer", "job_description": jd}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["role"] == "AI Engineer"
    assert data["readiness_score"] == 85
    assert data["preparation_plan"]["30_minutes"] == ["Quickly read LLM guidelines", "Review vector collection schemas"]
    assert data["confidence_score"] == 0.92
    
    # Check that it cached correctly
    cache_key = compute_interview_cache_key("AI Engineer", jd)
    cache_path = settings.STORAGE_DIR / "sessions" / session_id / "interview" / f"{cache_key}.json"
    assert cache_path.exists()
    
    with open(cache_path, "r", encoding="utf-8") as f:
        cached_data = json.load(f)
    assert cached_data["role"] == "AI Engineer"
    assert cached_data["readiness_score"] == 85

@patch("app.services.llm.ai_service.generate_interview_coach")
def test_interview_success_without_jd(mock_generate, dummy_session_and_profile_and_analysis, mock_interview_report):
    session_id = dummy_session_and_profile_and_analysis
    mock_generate.return_value = mock_interview_report
    
    # Request without job description
    response = client.post(
        f"/api/v1/interview/{session_id}",
        json={"target_role": "AI Engineer"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["role"] == "AI Engineer"
    assert data["difficulty"] == "Intermediate"
    
    # Verify cached path
    cache_key = compute_interview_cache_key("AI Engineer")
    cache_path = settings.STORAGE_DIR / "sessions" / session_id / "interview" / f"{cache_key}.json"
    assert cache_path.exists()

@patch("app.services.llm.ai_service.generate_interview_coach")
def test_interview_cache_reuse(mock_generate, dummy_session_and_profile_and_analysis, mock_interview_report):
    session_id = dummy_session_and_profile_and_analysis
    mock_generate.return_value = mock_interview_report
    
    target_role = "AI Engineer"
    
    # 1. First call (Cache Miss)
    res1 = client.post(
        f"/api/v1/interview/{session_id}",
        json={"target_role": target_role}
    )
    assert res1.status_code == 200
    assert mock_generate.call_count == 1
    
    # 2. Modify cache to verify cache hit uses the cached file
    cache_key = compute_interview_cache_key(target_role)
    cache_path = settings.STORAGE_DIR / "sessions" / session_id / "interview" / f"{cache_key}.json"
    with open(cache_path, "r", encoding="utf-8") as f:
        cached = json.load(f)
    cached["readiness_score"] = 99
    with open(cache_path, "w", encoding="utf-8") as f:
        json.dump(cached, f)
        
    # 3. Second call (Cache Hit)
    res2 = client.post(
        f"/api/v1/interview/{session_id}",
        json={"target_role": target_role}
    )
    assert res2.status_code == 200
    assert mock_generate.call_count == 1  # No extra LLM call
    assert res2.json()["readiness_score"] == 99

def test_interview_invalid_session():
    response = client.post(
        "/api/v1/interview/non-existent-session-id",
        json={"target_role": "AI Engineer"}
    )
    assert response.status_code == 404
    assert "Session not found" in response.json()["detail"]

def test_interview_missing_profile():
    session_id = "missing-profile-session"
    session_dir = settings.STORAGE_DIR / "sessions" / session_id
    session_dir.mkdir(parents=True, exist_ok=True)
    
    # profile.json is missing, but master_analysis.json is present (hypothetical)
    analysis_data = {"career_summary": "test"}
    with open(session_dir / "master_analysis.json", "w", encoding="utf-8") as f:
        json.dump(analysis_data, f)
        
    response = client.post(
        f"/api/v1/interview/{session_id}",
        json={"target_role": "AI Engineer"}
    )
    assert response.status_code == 404
    assert "Career profile not found" in response.json()["detail"]

def test_interview_missing_analysis():
    session_id = "missing-analysis-session"
    session_dir = settings.STORAGE_DIR / "sessions" / session_id
    session_dir.mkdir(parents=True, exist_ok=True)
    
    # profile.json is present, but master_analysis.json is missing
    profile_data = {"personal": {"name": "Test"}}
    with open(session_dir / "profile.json", "w", encoding="utf-8") as f:
        json.dump(profile_data, f)
        
    response = client.post(
        f"/api/v1/interview/{session_id}",
        json={"target_role": "AI Engineer"}
    )
    assert response.status_code == 404
    assert "Master career analysis not found" in response.json()["detail"]

def test_interview_empty_target_role(dummy_session_and_profile_and_analysis):
    session_id = dummy_session_and_profile_and_analysis
    
    # 1. Empty target role
    res = client.post(
        f"/api/v1/interview/{session_id}",
        json={"target_role": ""}
    )
    assert res.status_code == 400
    assert "Target role cannot be empty" in res.json()["detail"]
    
    # 2. Whitespace target role
    res_ws = client.post(
        f"/api/v1/interview/{session_id}",
        json={"target_role": "   "}
    )
    assert res_ws.status_code == 400
    assert "Target role cannot be empty" in res_ws.json()["detail"]
