# CareerPilot AI Backend

FastAPI backend foundation for CareerPilot AI. Responsible for file upload validation, PDF text extraction, text cleaning, and project architecture layout.

## Project Structure

```text
backend/
├── app/
│   ├── api/
│   │   ├── routes/
│   │   │   ├── health.py
│   │   │   └── upload.py
│   │   └── __init__.py
│   ├── core/
│   │   ├── config.py
│   │   ├── logging.py
│   │   └── __init__.py
│   ├── prompts/
│   │   └── resume_extraction.txt
│   ├── schemas/
│   │   ├── career_profile.py
│   │   ├── health.py
│   │   ├── upload.py
│   │   └── __init__.py
│   ├── services/
│   │   ├── llm/
│   │   │   ├── ai_service.py
│   │   │   ├── embedding_client.py
│   │   │   └── groq_client.py
│   │   ├── parser/
│   │   │   ├── pdf_parser.py
│   │   │   └── text_cleaner.py
│   │   ├── resume/
│   │   │   ├── chunker.py
│   │   │   ├── resume_extractor.py
│   │   │   └── resume_pipeline.py
│   │   ├── vector/
│   │   │   ├── chroma_client.py
│   │   │   └── retriever.py
│   │   └── __init__.py
│   ├── utils/
│   │   └── __init__.py
│   ├── main.py
│   └── __init__.py
├── storage/
│   └── sessions/
├── uploads/
├── .env.example
├── main.py (entrypoint proxy)
├── requirements.txt
└── README.md
```

## Getting Started

### 1. Prerequisites
- Python 3.11+
- Virtual environment manager (`venv`)

### 2. Setup Virtual Environment
Navigate to the `backend/` directory:
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Dependencies
Install only the specific packages required for this phase:
```bash
pip install -r requirements.txt
```

### 4. Configure Environment
Copy `.env.example` to a new `.env` file:
```bash
cp .env.example .env
```
Add the required API keys to your `.env` file:
- `GROQ_API_KEY`: API key for Groq Cloud.
- `GOOGLE_API_KEY`: API key for Google Gemini developer access.

By default, the server configuration sets up host `0.0.0.0`, port `8000`, and file upload limits at `10MB`.

### 5. Run FastAPI Server
Start the development server with hot-reload enabled:
```bash
uvicorn app.main:app --reload --port 8000
```
*(Alternatively, you can run `uvicorn main:app --reload --port 8000` via the top-level proxy).*

---

## Architecture: Resume Intelligence Layer

Phase 2 builds a reusable, isolated, session-based career knowledge base pipeline:

```text
PDF Upload -> Text Extraction -> Text Cleaning
                                      ↓
                              Generate session_id (UUID)
                                      ↓
                             Groq Resume Extraction (JSON)
                                      ↓
                              Save profile.json
                                      ↓
                             ChromaDB Vector Store (sessions/{session_id}/chroma/)
                                      ↓
                         Gemini Document Embeddings
```

### Why a Hybrid Provider Model?
1. **Groq (Llama-3.3-70b-versatile)**: Leveraged for its high-quality reasoning capabilities, structured JSON output speed, and reliability in converting unstructured resume text into a strict schema.
2. **Google Gemini Embeddings (`models/text-embedding-004`)**: Used exclusively for generating semantic document embeddings. Using Gemini embeddings via API avoids running local transformer/PyTorch libraries, optimizing RAM and CPU usage so the application fits comfortably within Render's Free Tier limits.
3. **ChromaDB**: Persisted locally on disk and isolated per user session under `storage/sessions/{session_id}/chroma/`. This prevents cross-user pollution and keeps database operations extremely lightweight.

---

## Architecture: Master Career Analysis Layer (Phase 3)

Phase 3 builds the centralized reasoning engine of CareerPilot AI, producing a comprehensive career analysis in a single pass:

```text
START -> Load Profile Node -> Retrieve Context Node -> Master Analysis Node -> Validate Node -> Persist Node -> END
```

### LangGraph Workflow
1. **Load Profile Node**: Reads `profile.json` from the session storage.
2. **Retrieve Context Node**: Pulls top `k=4` chunks semantically related to career topics from the session's isolated ChromaDB database.
3. **Master Analysis Node**: Invokes Groq (`llama-3.3-70b-versatile`) to generate a comprehensive analysis covering ATS score, strengths, weaknesses, missing skills, prioritized roadmap, and recommended projects in a single call.
4. **Validate Node**: Validates schema compliance against the `MasterAnalysis` Pydantic model.
5. **Persist Node**: Saves the analysis as `master_analysis.json` in the session's storage directory.

### Smart Caching Strategy
To minimize Groq API dependency and reduce Render Free Tier resource utilization:
- The system checks if `master_analysis.json` already exists for the given `session_id`.
- If found, it parses, validates, and returns it immediately (sub-millisecond cache hits).
- If absent, it executes the LangGraph workflow.
- Regeneration only occurs if the underlying resume file or profile is re-parsed.

---

## API Documentation

Once the server is running, the interactive documentation is accessible at:
- **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

## Endpoints Summary

### 1. Health Status
- **Method**: `GET`
- **Path**: `/health`
- **Response Schema**:
  ```json
  {
    "status": "healthy",
    "service": "CareerPilot Backend"
  }
  ```

### 2. Resume PDF Upload
- **Method**: `POST`
- **Path**: `/upload`
- **Content-Type**: `multipart/form-data`
- **Body Parameter**: `resume` (must be a valid `.pdf` file up to 10MB)
- **Response Schema**:
  ```json
  {
    "success": true,
    "session_id": "3a078028-2b8e-4a6c-9418-842211e4bf5c",
    "profile_created": true,
    "chunks_created": 12
  }
  ```

#### Example cURL Request:
```bash
curl -X POST "http://localhost:8000/upload" \
  -H "accept: application/json" \
  -H "Content-Type: multipart/form-data" \
  -F "resume=@/path/to/your/resume.pdf"
```
