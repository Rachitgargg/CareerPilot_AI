import json
from fastapi import APIRouter, HTTPException
from app.schemas.career_profile import CareerProfile
from app.core.logging import logger
from app.core.config import settings

router = APIRouter()

@router.get("/profile/{session_id}", response_model=CareerProfile)
async def get_profile(session_id: str):
    """
    Retrieve the parsed user CareerProfile (profile.json) for a given session.
    """
    session_dir = settings.STORAGE_DIR / "sessions" / session_id
    if not session_dir.exists():
        logger.error(f"Session directory not found for ID: {session_id}")
        raise HTTPException(status_code=404, detail="Session not found. Please upload a resume first.")
        
    profile_path = session_dir / "profile.json"
    if not profile_path.exists():
        logger.error(f"profile.json not found for session: {session_id}")
        raise HTTPException(status_code=404, detail="Career profile not found. Please complete resume upload.")
        
    try:
        with open(profile_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        return data
    except Exception as e:
        logger.error(f"Failed to read profile.json: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to load user profile.")

@router.put("/profile/{session_id}", response_model=CareerProfile)
async def update_profile(session_id: str, updated_profile: CareerProfile):
    """
    Overwrite/update the user CareerProfile (profile.json) for a given session.
    """
    session_dir = settings.STORAGE_DIR / "sessions" / session_id
    session_dir.mkdir(parents=True, exist_ok=True)
        
    profile_path = session_dir / "profile.json"
    try:
        # Write serialized profile back to session folder
        profile_json = updated_profile.model_dump()
        with open(profile_path, "w", encoding="utf-8") as f:
            json.dump(profile_json, f, indent=2, ensure_ascii=False)
            
        logger.info(f"Successfully updated profile.json for session: {session_id}")
        return updated_profile
    except Exception as e:
        logger.error(f"Failed to write profile.json: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to save user profile changes.")
