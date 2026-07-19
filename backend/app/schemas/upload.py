from pydantic import BaseModel

class UploadResponse(BaseModel):
    success: bool
    session_id: str
    profile_created: bool
    chunks_created: int

