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
    """Ensure storage and upload directories are clean after tests."""
    yield
    # Cleanup storage sessions
    if settings.STORAGE_DIR.exists():
        try:
            shutil.rmtree(settings.STORAGE_DIR)
        except Exception:
            pass
    if settings.UPLOAD_DIR.exists():
        try:
            shutil.rmtree(settings.UPLOAD_DIR)
        except Exception:
            pass

@pytest.fixture
def mock_groq_response():
    return """
    {
      "personal": {
        "name": "Jane Doe",
        "email": "jane.doe@example.com",
        "phone": "+1-555-0199",
        "location": "San Francisco, CA",
        "linkedin": "https://linkedin.com/in/janedoe",
        "github": "https://github.com/janedoe",
        "portfolio": "https://janedoe.dev"
      },
      "education": [
        {
          "institution": "Stanford University",
          "degree": "B.S.",
          "field": "Computer Science",
          "start_year": "2018",
          "end_year": "2022",
          "grade": "3.9"
        }
      ],
      "experience": [
        {
          "company": "Tech Corp",
          "role": "Software Engineer",
          "duration": "Jun 2022 - Present",
          "description": "Built scalable cloud features and machine learning microservices.",
          "technologies": ["Python", "FastAPI", "Docker", "AWS"]
        }
      ],
      "projects": [
        {
          "name": "CareerPilot AI",
          "description": "AI-powered resume optimizer backend.",
          "technologies": ["Python", "LangChain", "ChromaDB"],
          "links": ["https://github.com/janedoe/careerpilot"]
        }
      ],
      "skills": {
        "programming_languages": ["Python", "Go", "C++"],
        "frameworks": ["FastAPI", "React", "PyTorch"],
        "tools": ["Docker", "Git", "Kubernetes"],
        "databases": ["PostgreSQL", "Redis"],
        "ai_ml_skills": ["NLP", "Embeddings", "LLMs"]
      },
      "certifications": [
        {
          "name": "AWS Certified Developer",
          "issuer": "Amazon Web Services",
          "year": "2023"
        }
      ],
      "achievements": [
        "Won 1st place in university hackathon",
        "Published paper on semantic retrieval"
      ],
      "career_interests": [
        "AI Engineering",
        "MLOps",
        "Backend Architecture"
      ],
      "summary": "Experienced backend engineer passionate about building AI-integrated software solutions."
    }
    """

@patch("app.api.routes.upload.extract_text_from_pdf")
@patch("app.services.llm.groq_client.groq_client.get_completion")
@patch("app.services.vector.chroma_client.get_embeddings_instance")
def test_upload_pipeline_success(
    mock_get_embeddings,
    mock_groq_completion,
    mock_pdf_extract,
    mock_groq_response
):
    # Setup mocks
    mock_pdf_extract.return_value = ("Jane Doe Resume. Stanford University. Tech Corp Software Engineer. PyMuPDF experience.", 1)
    mock_groq_completion.return_value = mock_groq_response
    
    # Mock the embedding client
    mock_embedder = MagicMock()
    # When embed_documents is called, return a list of mock vectors
    mock_embedder.embed_documents.side_effect = lambda texts: [[0.1] * 768 for _ in texts]
    mock_get_embeddings.return_value = mock_embedder
    
    # Create a dummy PDF content for upload
    pdf_content = b"%PDF-1.4 dummy pdf structure content"
    files = {"resume": ("resume.pdf", pdf_content, "application/pdf")}
    
    # Run request
    response = client.post("/upload", files=files)
    
    # Asserts
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "session_id" in data
    assert data["profile_created"] is True
    assert data["chunks_created"] > 0
    
    session_id = data["session_id"]
    
    # Verify profile.json exists and is structured
    session_dir = settings.STORAGE_DIR / "sessions" / session_id
    profile_json_path = session_dir / "profile.json"
    assert profile_json_path.exists()
    
    with open(profile_json_path, "r", encoding="utf-8") as f:
        stored_profile = json.load(f)
    assert stored_profile["personal"]["name"] == "Jane Doe"
    assert stored_profile["personal"]["email"] == "jane.doe@example.com"
    assert stored_profile["experience"][0]["company"] == "Tech Corp"
    
    # Verify Chroma DB directories were created
    chroma_dir = session_dir / "chroma"
    assert chroma_dir.exists()
    
    # Verify upload directory is clean (PDF is deleted)
    assert not any(settings.UPLOAD_DIR.glob("*.pdf"))

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {
        "status": "healthy",
        "service": "CareerPilot Backend"
    }

def test_upload_non_pdf_rejected():
    files = {"resume": ("resume.txt", b"some plain text", "text/plain")}
    response = client.post("/upload", files=files)
    assert response.status_code == 400
    assert "Wrong file type" in response.json()["detail"]

def test_upload_empty_filename_rejected():
    files = {"resume": ("", b"some data", "application/pdf")}
    response = client.post("/upload", files=files)
    assert response.status_code in (400, 422)
    if response.status_code == 400:
        assert "No file was uploaded" in response.json()["detail"]
    else:
        assert "resume" in str(response.json()["detail"])

def test_upload_file_too_large_rejected():
    large_content = b"0" * (11 * 1024 * 1024)
    files = {"resume": ("resume.pdf", large_content, "application/pdf")}
    response = client.post("/upload", files=files)
    assert response.status_code == 413
    assert "File too large" in response.json()["detail"]

