from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.logging import logger
from app.api.routes import health, upload, analysis, chat, tailor, interview, jobs
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Server startup events
    logger.info("Starting CareerPilot AI Backend...")
    logger.info(f"Loaded config: HOST={settings.HOST}, PORT={settings.PORT}, MAX_UPLOAD_SIZE={settings.MAX_UPLOAD_SIZE_MB}MB")
    
    # Ensure upload directory exists
    try:
        settings.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
        logger.info(f"Verified uploads directory at: {settings.UPLOAD_DIR}")
    except Exception as e:
        logger.error(f"Failed to create uploads directory: {str(e)}")
        
    # Ensure storage and sessions directories exist
    try:
        sessions_dir = settings.STORAGE_DIR / "sessions"
        sessions_dir.mkdir(parents=True, exist_ok=True)
        logger.info(f"Verified storage sessions directory at: {sessions_dir}")
    except Exception as e:
        logger.error(f"Failed to create storage sessions directory: {str(e)}")
        
    yield
    
    # Server shutdown events
    logger.info("Stopping CareerPilot AI Backend...")

app = FastAPI(
    title="CareerPilot AI Backend",
    description="FastAPI Backend Foundation for CareerPilot AI.",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS
origins = [origin.strip() for origin in settings.ALLOWED_ORIGINS.split(",") if origin.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(health.router)
app.include_router(upload.router)
app.include_router(analysis.router, prefix="/api/v1")
app.include_router(chat.router, prefix="/api/v1")
app.include_router(tailor.router, prefix="/api/v1")
app.include_router(interview.router, prefix="/api/v1")
app.include_router(jobs.router, prefix="/api/v1")
