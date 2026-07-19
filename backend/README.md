# CareerPilot AI Backend

This is the FastAPI backend application for CareerPilot AI.

## Project Structure

- `app/`: FastAPI application startup, configuration, and app initialization.
- `api/`: API router definitions, endpoint controllers (v1, v2).
- `agents/`: AI agents logic, prompt chains, LLM integrations.
- `workflows/`: Multi-agent orchestrations, state machines, workflow sequences.
- `rag/`: Retrieval-Augmented Generation retrieval pipelines, text chunking, formatting.
- `vectorstore/`: Vector database integrations (Pinecone, Chroma, etc.).
- `prompts/`: Prompt management, system messages, templates.
- `services/`: Core business logic, helper services, client integrations.
- `models/`: Pydantic input/output schemas and database models.
- `utils/`: Common utilities, logging, decorators, date/string formatters.
- `config/`: Application settings, environment configuration.
- `tests/`: Pytest unit and integration tests.

## Running Locally

### 1. Prerequisites
- Python 3.9+
- pip

### 2. Setup

Create a virtual environment:
```bash
python3 -m venv venv
source venv/bin/activate
```

Install dependencies:
```bash
pip install -r requirements.txt
```

### 3. Run Server

Run the development server using uvicorn:
```bash
uvicorn main:app --reload --port 8000
```
The API will be available at `http://localhost:8000`.
Interactive API documentation will be available at `http://localhost:8000/docs`.
