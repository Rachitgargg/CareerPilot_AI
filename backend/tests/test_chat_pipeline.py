import os
import json
import shutil
import pytest
from pathlib import Path
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient
from app.main import app
from app.core.config import settings

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
    session_id = "test-session-chat"
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


@patch("app.services.llm.ai_service.detect_intent_with_groq")
@patch("app.services.llm.ai_service.generate_chat_response_with_groq")
def test_chat_new_conversation(
    mock_generate_response,
    mock_detect_intent,
    dummy_session_and_profile
):
    session_id = dummy_session_and_profile
    
    # Setup mock behaviors
    mock_detect_intent.return_value = "general"
    mock_generate_response.return_value = "Hello! I am your AI career mentor."
    
    # Request chat endpoint
    response = client.post(
        f"/api/v1/chat/{session_id}",
        json={"message": "Hello mentor!"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["response"] == "Hello! I am your AI career mentor."
    assert "career_profile" in data["sources"]
    assert "master_analysis" not in data["sources"]
    assert "resume" not in data["sources"]
    
    # Verify memory persistence on disk
    history_path = settings.STORAGE_DIR / "sessions" / session_id / "chat_history.json"
    assert history_path.exists()
    
    with open(history_path, "r", encoding="utf-8") as f:
        history = json.load(f)
        
    assert len(history) == 2
    assert history[0] == {"role": "user", "content": "Hello mentor!"}
    assert history[1] == {"role": "assistant", "content": "Hello! I am your AI career mentor."}


@patch("app.services.llm.ai_service.detect_intent_with_groq")
@patch("app.services.llm.ai_service.generate_chat_response_with_groq")
def test_chat_existing_conversation(
    mock_generate_response,
    mock_detect_intent,
    dummy_session_and_profile
):
    session_id = dummy_session_and_profile
    session_dir = settings.STORAGE_DIR / "sessions" / session_id
    
    # Pre-populate history on disk
    initial_history = [
        {"role": "user", "content": "Hi"},
        {"role": "assistant", "content": "Hello! How can I help today?"}
    ]
    history_path = session_dir / "chat_history.json"
    with open(history_path, "w", encoding="utf-8") as f:
        json.dump(initial_history, f)
        
    # Setup mock behaviors
    mock_detect_intent.return_value = "general"
    mock_generate_response.return_value = "I am ready to help you."
    
    # Send another message
    response = client.post(
        f"/api/v1/chat/{session_id}",
        json={"message": "Tell me about yourself"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["response"] == "I am ready to help you."
    
    # Verify history loaded and appended chronologically
    with open(history_path, "r", encoding="utf-8") as f:
        history = json.load(f)
        
    assert len(history) == 4
    assert history[0] == {"role": "user", "content": "Hi"}
    assert history[1] == {"role": "assistant", "content": "Hello! How can I help today?"}
    assert history[2] == {"role": "user", "content": "Tell me about yourself"}
    assert history[3] == {"role": "assistant", "content": "I am ready to help you."}


def test_chat_missing_session():
    response = client.post(
        "/api/v1/chat/non-existent-session-id",
        json={"message": "hello"}
    )
    assert response.status_code == 404
    assert "Session not found" in response.json()["detail"]


def test_chat_missing_profile():
    # Session directory exists but profile.json is missing
    session_id = "no-profile-session"
    session_dir = settings.STORAGE_DIR / "sessions" / session_id
    session_dir.mkdir(parents=True, exist_ok=True)
    
    response = client.post(
        f"/api/v1/chat/{session_id}",
        json={"message": "hello"}
    )
    assert response.status_code == 404
    assert "Career profile not found" in response.json()["detail"]


@patch("app.services.llm.ai_service.detect_intent_with_groq")
@patch("app.services.llm.ai_service.generate_chat_response_with_groq")
def test_chat_intent_routing_career_advice_no_analysis(
    mock_generate_response,
    mock_detect_intent,
    dummy_session_and_profile
):
    session_id = dummy_session_and_profile
    
    # 1. Test career_advice intent but master_analysis.json is missing
    mock_detect_intent.return_value = "career_advice"
    mock_generate_response.return_value = "I am giving you general advice based on profile."
    
    response = client.post(
        f"/api/v1/chat/{session_id}",
        json={"message": "Give me some career advice"}
    )
    
    assert response.status_code == 200
    data = response.json()
    # Should only return profile source since analysis doesn't exist
    assert "career_profile" in data["sources"]
    assert "master_analysis" not in data["sources"]


@patch("app.services.llm.ai_service.detect_intent_with_groq")
@patch("app.services.llm.ai_service.generate_chat_response_with_groq")
def test_chat_intent_routing_career_advice_with_analysis(
    mock_generate_response,
    mock_detect_intent,
    dummy_session_and_profile
):
    session_id = dummy_session_and_profile
    session_dir = settings.STORAGE_DIR / "sessions" / session_id
    
    # 2. Test career_advice intent when master_analysis.json EXISTS
    analysis_data = {"career_summary": "Summary of analysis"}
    with open(session_dir / "master_analysis.json", "w", encoding="utf-8") as f:
        json.dump(analysis_data, f)
        
    mock_detect_intent.return_value = "career_advice"
    mock_generate_response.return_value = "I am giving you specific advice using your profile and analysis."
    
    response = client.post(
        f"/api/v1/chat/{session_id}",
        json={"message": "Give me some career advice"}
    )
    
    assert response.status_code == 200
    data = response.json()
    # Both profile and analysis should be in sources
    assert "career_profile" in data["sources"]
    assert "master_analysis" in data["sources"]
    assert "resume" not in data["sources"]


@patch("app.services.graph.chat_tools.retrieve_relevant_chunks")
@patch("app.services.llm.ai_service.detect_intent_with_groq")
@patch("app.services.llm.ai_service.generate_chat_response_with_groq")
def test_chat_intent_routing_resume_question(
    mock_generate_response,
    mock_detect_intent,
    mock_retrieve,
    dummy_session_and_profile
):
    session_id = dummy_session_and_profile
    
    # Mock retrieval to return dummy documents
    mock_doc = MagicMock()
    mock_doc.page_content = "Extracted resume content here."
    mock_retrieve.return_value = [mock_doc]
    
    mock_detect_intent.return_value = "resume_question"
    mock_generate_response.return_value = "Based on your resume, you have experience with Python."
    
    response = client.post(
        f"/api/v1/chat/{session_id}",
        json={"message": "What does my resume say about Python?"}
    )
    
    assert response.status_code == 200
    data = response.json()
    # Should query resume chunks from ChromaDB
    assert "career_profile" in data["sources"]
    assert "resume" in data["sources"]
    assert "master_analysis" not in data["sources"]


@patch("app.services.llm.ai_service.detect_intent_with_groq")
@patch("app.services.llm.ai_service.generate_chat_response_with_groq")
def test_chat_corrupted_history_non_list(
    mock_generate_response,
    mock_detect_intent,
    dummy_session_and_profile
):
    session_id = dummy_session_and_profile
    session_dir = settings.STORAGE_DIR / "sessions" / session_id
    
    # Save corrupted history as a dictionary
    corrupted_data = {"key": "not a list"}
    history_path = session_dir / "chat_history.json"
    with open(history_path, "w", encoding="utf-8") as f:
        json.dump(corrupted_data, f)
        
    mock_detect_intent.return_value = "general"
    mock_generate_response.return_value = "Recovered from corrupted history."
    
    response = client.post(
        f"/api/v1/chat/{session_id}",
        json={"message": "Retry message"}
    )
    
    assert response.status_code == 200
    assert response.json()["response"] == "Recovered from corrupted history."
    
    # Verify that the history was reset to a list and saved correctly
    with open(history_path, "r", encoding="utf-8") as f:
        history = json.load(f)
    assert isinstance(history, list)
    assert len(history) == 2
