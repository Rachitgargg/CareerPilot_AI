import os
import json
import shutil
import pytest
from pathlib import Path
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient
from app.main import app
from app.core.config import settings
from app.schemas.master_analysis import MasterAnalysis
from app.schemas.career_profile import CareerProfile

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
def dummy_session_and_profile():
    # Setup dummy session and profile
    session_id = "test-session-analysis"
    session_dir = settings.STORAGE_DIR / "sessions" / session_id
    session_dir.mkdir(parents=True, exist_ok=True)
    
    # Save dummy profile.json
    profile_data = {
        "personal": {"name": "Test User", "email": "test@example.com"},
        "education": [],
        "experience": [],
        "projects": [],
        "skills": {
            "programming_languages": [],
            "frameworks": [],
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
        
    return session_id

@pytest.fixture
def mock_master_analysis():
    return MasterAnalysis(
        career_summary="Test career summary statement.",
        ats_analysis={
            "score": 80,
            "strengths": ["Python development"],
            "weaknesses": ["No cloud experience"],
            "improvements": ["Learn AWS"]
        },
        skills_gap={
            "existing_skills": ["Python"],
            "missing_skills": ["AWS"],
            "priority_skills": ["AWS"]
        },
        project_recommendations=[
            {
                "title": "Cloud Project",
                "description": "Build FastAPI app on AWS.",
                "difficulty": "Intermediate",
                "technologies": ["FastAPI", "AWS"],
                "reason": "Showcase cloud skills"
            }
        ],
        learning_roadmap={
            "next_30_days": ["Learn Docker"],
            "next_90_days": ["Learn AWS ECS"],
            "long_term": ["MLOps frameworks"]
        },
        career_recommendations=["Target cloud startups"],
        interview_focus=["System design", "Docker containers"]
    )

@patch("app.services.vector.retriever.retrieve_relevant_chunks")
@patch("app.services.llm.ai_service.generate_master_analysis")
def test_analysis_pipeline_success(
    mock_generate_analysis,
    mock_retrieve,
    dummy_session_and_profile,
    mock_master_analysis
):
    session_id = dummy_session_and_profile
    
    # Setup mocks
    mock_retrieve.return_value = []
    mock_generate_analysis.return_value = mock_master_analysis
    
    # Run request
    response = client.post(f"/api/v1/analysis/{session_id}")
    
    assert response.status_code == 200
    data = response.json()
    assert data["career_summary"] == "Test career summary statement."
    assert data["ats_analysis"]["score"] == 80
    assert data["skills_gap"]["existing_skills"] == ["Python"]
    
    # Verify file is persisted in storage
    analysis_path = settings.STORAGE_DIR / "sessions" / session_id / "master_analysis.json"
    assert analysis_path.exists()
    
    with open(analysis_path, "r", encoding="utf-8") as f:
        stored_data = json.load(f)
    assert stored_data["career_summary"] == "Test career summary statement."
    assert stored_data["ats_analysis"]["score"] == 80

@patch("app.services.vector.retriever.retrieve_relevant_chunks")
@patch("app.services.llm.ai_service.generate_master_analysis")
def test_analysis_cache_reuse(
    mock_generate_analysis,
    mock_retrieve,
    dummy_session_and_profile,
    mock_master_analysis
):
    session_id = dummy_session_and_profile
    mock_retrieve.return_value = []
    mock_generate_analysis.return_value = mock_master_analysis
    
    # First request: generates and caches
    res1 = client.post(f"/api/v1/analysis/{session_id}")
    assert res1.status_code == 200
    assert mock_generate_analysis.call_count == 1
    
    # Modify the cached file manually to verify subsequent calls load it
    analysis_path = settings.STORAGE_DIR / "sessions" / session_id / "master_analysis.json"
    with open(analysis_path, "r", encoding="utf-8") as f:
        cache_data = json.load(f)
    cache_data["career_summary"] = "MODIFIED CACHED STATEMENT"
    with open(analysis_path, "w", encoding="utf-8") as f:
        json.dump(cache_data, f)
        
    # Second request: should hit cache and NOT invoke Groq/generate_master_analysis again
    res2 = client.post(f"/api/v1/analysis/{session_id}")
    assert res2.status_code == 200
    assert mock_generate_analysis.call_count == 1 # still 1!
    assert res2.json()["career_summary"] == "MODIFIED CACHED STATEMENT"

def test_analysis_missing_session():
    response = client.post("/api/v1/analysis/non-existent-session-1234")
    assert response.status_code == 404
    assert "Session not found" in response.json()["detail"]

def test_analysis_missing_profile():
    # Session exists but profile.json doesn't
    session_id = "missing-profile-session"
    session_dir = settings.STORAGE_DIR / "sessions" / session_id
    session_dir.mkdir(parents=True, exist_ok=True)
    
    response = client.post(f"/api/v1/analysis/{session_id}")
    assert response.status_code == 404
    assert "Career profile not found" in response.json()["detail"]

@patch("app.services.vector.retriever.retrieve_relevant_chunks")
@patch("app.services.llm.ai_service.generate_master_analysis")
def test_analysis_validation_failure(
    mock_generate_analysis,
    mock_retrieve,
    dummy_session_and_profile
):
    session_id = dummy_session_and_profile
    mock_retrieve.return_value = []
    
    # Mock generation to raise ValueError (e.g. JSON schema mismatch or extraction error)
    mock_generate_analysis.side_effect = ValueError("Extracted resume data did not conform to schema")
    
    response = client.post(f"/api/v1/analysis/{session_id}")
    assert response.status_code == 422
    assert "Analysis validation failed" in response.json()["detail"]
