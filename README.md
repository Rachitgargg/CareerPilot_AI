# AI Career Copilot

AI Career Copilot is a professional full-stack platform designed to help job seekers optimize resumes, practice mock interviews, and build structured career paths.

This project is organized as a monorepo containing two decoupled, independent applications: the frontend (React/Vite) and the backend (FastAPI).

## Project Structure

```
AI-Career-Copilot/
├── frontend/          # React SPA (Vite + TypeScript + Tailwind CSS)
├── backend/           # FastAPI Application (Agentic RAG pipeline skeleton)
├── docs/              # Specifications, architecture drafts, APIs, and deployment plans
├── README.md          # Monorepo root guide (this file)
└── .gitignore         # Workspace-wide version control configuration
```

---

## Getting Started

Because the frontend and backend are completely independent applications, you configure and run them separately.

### 1. Frontend Development

The frontend is built with React, TypeScript, and Vite.

```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Run the local development server
npm run dev
```

The frontend will run at `http://localhost:5173` (or the configured port).

### 2. Backend Development

The backend is built with Python 3.9+ and FastAPI.

```bash
# Navigate to the backend directory
cd backend

# Create and activate a virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create your .env file
cp .env.example .env

# Run the local server
uvicorn main:app --reload --port 8000
```

The API docs will be interactive and accessible at `http://localhost:8000/docs`.

---

## Environment Variables

### Backend Configuration (`backend/.env`)
Create `backend/.env` with these configurations:
```env
HOST=0.0.0.0
PORT=8000
MAX_UPLOAD_SIZE_MB=10
GROQ_API_KEY=your_groq_api_key
GOOGLE_API_KEY=your_gemini_api_key
GROQ_MODEL=llama-3.3-70b-versatile
GOOGLE_EMBEDDING_MODEL=models/text-embedding-004
STORAGE_FOLDER=storage
```

### Frontend Configuration (`frontend/.env`)
Create `frontend/.env` with these configurations:
```env
VITE_API_BASE_URL=http://localhost:8000
```

---

## Running Locally & End-to-End Integration

Follow these steps to run and test the complete integrated system:

1. **Start the Backend**:
   ```bash
   cd backend
   source venv/bin/activate
   PYTHONPATH=. uvicorn app.main:app --port 8000 --reload
   ```
2. **Start the Frontend**:
   ```bash
   cd frontend
   npm run dev
   ```
3. **E2E Flow**:
   * Navigate to `http://localhost:5173/resume-upload` and upload a resume (PDF).
   * Wait for processing; upon success, navigate to Dashboard showing live profile metrics, suggestions, and recommended projects.
   * Talk to the Career Mentor on `/chat` to test real LLM chat.
   * Optimize bullet points in `/resume-tailoring` by pasting job descriptions.
   * Generate interview prep sessions for your target role in `/interview-prep`.
   * Search and match job listings tailored to your graduation status and skills on `/jobs`.

---

## Documentation

For further information on design guidelines, specs, and details, please reference the `docs/` folder:
- [Product Requirements Document (PRD)](./docs/PRD.md)
- [System Architecture](./docs/ARCHITECTURE.md)
- [API Reference](./docs/API.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)
