from pydantic import BaseModel

class UploadResponse(BaseModel):
    success: bool
    filename: str
    pages: int
    characters: int
    text: str
