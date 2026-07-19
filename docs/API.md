# API Documentation

This document lists the major API endpoints provided by the CareerPilot AI backend.

## Base URL
- Local: `http://localhost:8000/api/v1`
- Swagger UI (Interactive Docs): `http://localhost:8000/docs`

---

## 1. Authentication Endpoints

### `POST /auth/register`
Creates a new user profile.
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "securepassword123",
    "name": "Jane Doe"
  }
  ```
- **Response**: `201 Created`

### `POST /auth/login`
Exchanges user credentials for an access token.
- **Request Body**: Form-encoded credentials (username, password).
- **Response**: JWT token.

---

## 2. Resume Endpoints

### `POST /resume/analyze`
Analyzes a resume against a target job description.
- **Request (Multipart Form-Data)**:
  - `file`: PDF or Docx resume.
  - `job_description`: (String) Target job description.
- **Response (`200 OK`)**:
  ```json
  {
    "overall_score": 82,
    "keyword_matches": ["react", "typescript", "fastapi"],
    "missing_keywords": ["docker", "ci/cd"],
    "suggestions": "Add Docker containers experience or deployment pipeline work..."
  }
  ```

---

## 3. Mock Interview Endpoints

### `POST /interview/start`
Starts a new mock interview session.
- **Request Body**:
  ```json
  {
    "target_role": "Fullstack Engineer",
    "focus_areas": ["System Design", "React", "Python"]
  }
  ```
- **Response (`200 OK`)**:
  ```json
  {
    "session_id": "int-99812",
    "first_question": "Can you describe your experience deploying FastAPI services?"
  }
  ```
