# Deployment Guide

This document describes how to deploy the CareerPilot AI application in different environments.

## 1. Docker Compose (Local & Single-Server)

You can run the entire stack locally using Docker Compose. Create a root `docker-compose.yml` to define services:

```yaml
version: '3.8'

services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "80:80"
    depends_on:
      - backend

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/careerpilot
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    depends_on:
      - db

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
      - POSTGRES_DB=careerpilot
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

## 2. Frontend Deployment (Static Hosting)

The frontend is a static Vite app. You can deploy it to:
- **Vercel / Netlify**: Connect your Git repository, set the build command to `npm run build` and output directory to `dist`. Set build working directory to `frontend`.
- **AWS S3 + CloudFront**: Sync the `frontend/dist` directory to an S3 bucket and distribute it via CloudFront.

## 3. Backend Deployment (Containers / VPS)

The FastAPI backend can be run with any ASGI server (e.g. Uvicorn, Hypercorn).
- **Render / Railway / Fly.io**: Deploy directly from the monorepo, pointing the build settings to the `backend/` directory with start command `uvicorn main:app --host 0.0.0.0 --port $PORT`.
- **AWS ECS / GCP Cloud Run**: Build a Docker image from the backend Dockerfile, push it to a registry (ECR/GCR), and run serverless containers.
