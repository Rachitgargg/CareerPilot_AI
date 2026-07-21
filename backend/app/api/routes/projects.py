import json
from fastapi import APIRouter, HTTPException
from typing import List
from app.schemas.projects import ActiveProject
from app.core.logging import logger
from app.core.config import settings

router = APIRouter()

@router.get("/projects/{session_id}", response_model=List[ActiveProject])
async def get_projects(session_id: str):
    """
    Retrieve user active and completed projects for a session.
    """
    session_dir = settings.STORAGE_DIR / "sessions" / session_id
    if not session_dir.exists():
        return []
        
    projects_path = session_dir / "projects.json"
    if not projects_path.exists():
        return []
        
    try:
        with open(projects_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        return data
    except Exception as e:
        logger.error(f"Failed to read projects.json for session {session_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to load projects.")

@router.put("/projects/{session_id}", response_model=List[ActiveProject])
async def update_projects(session_id: str, projects: List[ActiveProject]):
    """
    Update/overwrite user active and completed projects for a session.
    """
    session_dir = settings.STORAGE_DIR / "sessions" / session_id
    session_dir.mkdir(parents=True, exist_ok=True)
        
    projects_path = session_dir / "projects.json"
    try:
        # Serialize list of active projects
        serialized = [p.model_dump() for p in projects]
        with open(projects_path, "w", encoding="utf-8") as f:
            json.dump(serialized, f, indent=2, ensure_ascii=False)
            
        logger.info(f"Successfully updated projects.json for session: {session_id}")
        return projects
    except Exception as e:
        logger.error(f"Failed to write projects.json for session {session_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to save projects progress.")
