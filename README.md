# ✈️ CareerPilot AI — The Ultimate AI-Powered Career Optimization Platform

CareerPilot AI is a premium, full-stack career development and resume optimization platform. It utilizes advanced agentic RAG (Retrieval-Augmented Generation), localized job searches, and custom roadmap curation to help candidates land their dream roles. 

This project is organized as a unified, decoupled monorepo consisting of a **React/Vite Frontend** and a **FastAPI Backend**.

---

## 🚀 Key Features

*   **📊 Single-Pass Master Career Analysis**: Automatically parses resumes, extracts core facts, indexes text chunks into a vector database, and uses Groq to generate a master profile (ATS analysis, skills gaps, priority improvements, and recommendations) cached for all downstream features.
*   **📝 Resume Tailoring Engine**: paste a job description to receive detailed bullet-point rewrites, matching keywords, missing skill recommendations, and section ordering advice.
*   **🎯 Legitimate Job Discovery**: Fetches real-time remote positions calling the public Remotive API. Filters matches dynamically to comply with candidates' target city, country, or remote preferences.
*   **🤝 Interactive AI Career Coach**: Practise behavioral or technical mock interview questions tailored directly to your target role and job descriptions, with instant grading.
*   **💬 Persistent AI Career Mentor**: A full-bleed chat interface driven by LangGraph workflows to answer career planning questions using your resume's vectorized context.
*   **📈 Weekly Activity & Productivity Tracker**: Database-backed metrics tracking your progress checklist milestones and job application pipelines in real-time.

---

## 🛠️ Tech Stack & Architecture

### Frontend
*   **React 19 & TypeScript**: Strict type safety and state management.
*   **Vite**: Lightning-fast builds and module replacement.
*   **Tailwind CSS & Radix UI**: Glassmorphism aesthetic, custom interactive tabs, accordions, and dialog primitives.
*   **Framer Motion**: Smooth entry transitions and interactive micro-animations.

### Backend
*   **FastAPI**: Asynchronous RESTful router controllers.
*   **ChromaDB**: Lightweight, local persistent vector store storing resume chunks.
*   **Groq API (Llama-3.3 & Llama-3.1)**: Ultra-fast LLM completion models for analysis and coaching.
*   **Google Gemini Embeddings**: Google's embedding model for high-precision semantic retrieval.
*   **LangGraph**: Workflows orchestrating stateful chat and tailoring tasks.

```text
               +----------------------------------------+
               |         React / Vite Client            |
               |         (http://localhost:5173)        |
               +-------------------+--------------------+
                                   |
                          API Fetch (REST)
                                   v
               +-------------------+--------------------+
               |         FastAPI Dev Server             |
               |         (http://localhost:8000)        |
               +---------+--------------------+---------+
                         |                    |
             LangGraph & Services        ChromaDB Vector Store
                         |                    | (Resume Embeddings)
                         v                    v
             +-----------+-----------+  +-----+-----------------+
             |   Groq Client Layer   |  | Google Gemini Embed   |
             |  (Llama-3.3 / 3.1)    |  | (text-embedding-004)  |
             +-----------------------+  +-----------------------+
```

---

## 💻 Local Hosting Guide

Follow these steps to run the complete integrated system locally:

### 1. Pre-requisites
*   **Node.js**: Version 18.x or newer.
*   **Python**: Version 3.9, 3.10, or 3.11.
*   **API Keys**: A Groq API Key and a Google Gemini API Key.

---

### 2. Backend Setup
1.  Navigate into the `backend/` directory:
    ```bash
    cd backend
    ```
2.  Create and activate a virtual environment:
    ```bash
    python3 -m venv venv
    source venv/bin/activate
    ```
3.  Install the required dependencies:
    ```bash
    pip install -r requirements.txt
    ```
4.  Create your `.env` configuration file:
    ```bash
    cp .env.example .env
    ```
5.  Open `backend/.env` and update the environment variables:
    ```env
    HOST=0.0.0.0
    PORT=8000
    MAX_UPLOAD_SIZE_MB=10
    STORAGE_FOLDER=storage
    
    # Credentials (replace with your keys)
    GROQ_API_KEY=your_groq_api_key
    GOOGLE_API_KEY=your_google_gemini_api_key
    
    # Models Configuration
    GROQ_MODEL=llama-3.3-70b-versatile
    GOOGLE_EMBEDDING_MODEL=models/gemini-embedding-001
    ALLOWED_ORIGINS=http://localhost:5173
    ```
6.  Start the FastAPI local development server:
    ```bash
    PYTHONPATH=. venv/bin/uvicorn app.main:app --port 8000 --reload
    ```
    *Interactive Swagger API documentation is now live at `http://localhost:8000/docs`.*

---

### 3. Frontend Setup
1.  Navigate to the `frontend/` directory:
    ```bash
    cd ../frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Configure your environment file `.env`:
    Create a `.env` file in the `frontend` folder containing:
    ```env
    VITE_API_BASE_URL=http://localhost:8000
    ```
4.  Run the development server:
    ```bash
    npm run dev
    ```
    *The client application is now live at `http://localhost:5173`.*

---

## 🔄 End-to-End User Journey

1.  **Welcome Landing**: Visit `http://localhost:5173` and click **Get Started** to launch onboarding.
2.  **Resume Upload**: Upload your resume PDF (you can use the pre-built [sample_resume.pdf](file:///Users/rachit/Downloads/careerpilot-ai-frontend/sample_resume.pdf) located in the project root).
3.  **Real-time Dashboard**: View your visual ATS profile assessment, learning checklist roadmaps, and progress charts.
4.  **Job Tailoring**: Paste target job specs on the **Tailor Resume** tab to generate optimized bullet points and matching scores.
5.  **Job Search**: Search for software roles matching your location; remote positions are filtered to target your selected region.
6.  **AI Chat / Mock Interview**: Practice mock interview responses with live graded scoring.

---

## ⚡ Render Free Tier Optimization Guidelines

*   **API-based Embeddings**: The backend uses the remote Google Gemini Embeddings client, completely bypassing heavy local PyTorch/TensorTransformers libraries to guarantee minimal RAM usage (<80MB).
*   **PDF Cleanup**: Temporary uploads are kept strictly in-memory or deleted from the `backend/uploads/` directory immediately after text parsing.
*   **API Rate-Limit Fallback**: The Groq client has built-in automatic 429 recovery. If primary Llama-3.3 token limits are exhausted, it seamlessly falls back to alternative models (`llama-3.1-70b`, `mixtral-8x7b`, `llama-3.1-8b-instant`) to prevent application downtime.

---

## 📝 API Endpoints Summary

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/upload` | Extract PDF resume text, index into ChromaDB, cache CareerProfile. |
| `GET` | `/api/v1/health` | Read server deployment status check. |
| `POST` | `/api/v1/analysis/{session_id}` | Retrieve cached or run new Master Career Analysis workflow. |
| `POST` | `/api/v1/chat/{session_id}` | Process stateful chat queries and fetch vector context. |
| `POST` | `/api/v1/tailor/{session_id}` | Generate bullet point revisions and scoring metrics. |
| `POST` | `/api/v1/interview/{session_id}` | Initiate mock interview question session and grading. |
| `POST` | `/api/v1/jobs/{session_id}` | Query Remotive jobs with remote and location-filtering rules. |
| `PUT` | `/api/v1/projects/{session_id}` | Persist project milestone checkmarks and tracker items. |
