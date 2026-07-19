# CareerPilot AI - Workspace Rules & Architecture Guidelines

## LLM and Embedding Providers
- **Primary AI Provider**: Use **Groq** for all reasoning, structured JSON extraction, resume analysis, roadmaps, question generation, and chat interactions. Do NOT use Gemini for reasoning or text generation tasks.
- **Embeddings Provider**: Use **Google Gemini Embeddings** exclusively. Do NOT use local embedding models (e.g. `sentence-transformers`, `all-MiniLM-L6-v2`, `BGE`, etc.) to prevent high RAM/CPU usage on Render Free Tier.

## Service Isolation & Directory Layout
- Separate LLM and Embedding layers in `app/services/`:
  - `app/services/llm/groq_client.py` for all Groq LLM API integrations.
  - `app/services/llm/embedding_client.py` for Google Gemini Embeddings API integrations.
  - `app/services/llm/ai_service.py` to abstract both clients for downstream business services.

## Vector Database
- Use **ChromaDB**.
- Only store embeddings for:
  - Resume chunks
  - Job descriptions (optional)
  - User notes (optional)
- Do NOT embed chat history, generated LLM answers, ATS reports, roadmap results, or master analyses.

## Processing Strategy & Optimization
- **Single Pass Master Analysis**: Integrate analysis into a single unified workspace pass returning: ATS Analysis, Skills Gap, Strengths, Weaknesses, Recommended Projects, Learning Roadmap, Career Summary, and Career Score. Cache and reuse this payload instead of spawning independent LLM agents.
- **Render Optimization**: Minimize RAM/CPU utilization. Ensure resumes are parsed once, embeddings are generated once, and database writes/searches are kept to a minimum.
## Backend Principles

- Keep API endpoints thin.
- Business logic belongs in services.
- Never call Groq directly from API routes.
- Never call Chroma directly from API routes.
- Never call Gemini embeddings directly from API routes.
- All AI interactions must go through app/services/llm/.

---

## Render Optimization

- Parse resume exactly once.
- Generate embeddings exactly once.
- Cache master analysis.
- Delete uploaded PDFs after extraction.
- Never regenerate embeddings unless resume changes.
- Never regenerate master analysis unless resume changes.
- Prefer async endpoints.
- Avoid unnecessary memory usage.
- Avoid duplicate storage.
- Keep Chroma lightweight.

---

## LangGraph

LangGraph is used only for workflow orchestration.

Avoid unnecessary nodes.

Python should handle deterministic logic.

Only reasoning nodes should invoke Groq.

---

## API Design

Use RESTful endpoints.

Return consistent response schemas.

Use Pydantic for every request and response.

Never return unstructured dictionaries.

---

## Logging

Log metadata only.

Never log resumes.

Never log API keys.

Never log embeddings.

---

## Git Workflow

Every completed phase must:

- Build successfully.
- Pass available tests.
- Be committed.
- Be pushed to GitHub.

Never leave a phase uncommitted.

---

## Code Quality

Use type hints.

Use docstrings.

Keep functions small.

Avoid duplicated logic.

Follow PEP8.

Use dependency injection where appropriate.

---

## Storage

Persist only:

- profile.json
- master_analysis.json
- ChromaDB

Do not persist temporary PDFs.

Do not persist generated chat responses.

Generated AI outputs such as master_analysis.json must be cached and reused. Never regenerate unless the underlying resume/profile changes.

---

## Future Features

The existing frontend must not be redesigned.

Backend APIs should adapt to the frontend rather than changing frontend architecture.

Frontend changes should remain minimal.
## Simplicity First

This project is intended to demonstrate modern AI engineering.

Prefer simpler, production-ready solutions over overly complex architectures.

Avoid introducing additional databases, queues, background workers, caches, or microservices unless explicitly required.

Keep the backend deployable on a single Render Free instance.