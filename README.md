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

## Documentation

For further information on design guidelines, specs, and details, please reference the `docs/` folder:
- [Product Requirements Document (PRD)](./docs/PRD.md)
- [System Architecture](./docs/ARCHITECTURE.md)
- [API Reference](./docs/API.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)
