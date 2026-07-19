import os
import uuid
import time
import shutil
from fastapi import APIRouter, File, UploadFile, HTTPException
from fastapi.concurrency import run_in_threadpool
from app.core.config import settings
from app.core.logging import logger
from app.schemas.upload import UploadResponse
from app.services.parser.pdf_parser import extract_text_from_pdf, PDFParsingError
from app.services.parser.text_cleaner import clean_text

router = APIRouter()

def save_file_sync(src_file, dest_path: str):
    """Synchronous file copy helper, to be executed in a thread pool."""
    with open(dest_path, "wb") as buffer:
        shutil.copyfileobj(src_file, buffer)

@router.post("/upload", response_model=UploadResponse)
async def upload_resume(resume: UploadFile = File(...)):
    """
    Upload resume endpoint.
    - Validates extension (.pdf)
    - Validates size (<= MAX_UPLOAD_SIZE_MB)
    - Saves PDF temporarily with a generated UUID
    - Extracts PDF text using PyMuPDF (fitz)
    - Preprocesses/cleans text
    - Deletes the temporary file from disk immediately
    - Returns structured JSON response with text and metadata
    """
    logger.info(f"Upload received. Original filename: '{resume.filename}', content_type: '{resume.content_type}'")
    
    # 1. Validate file uploaded
    if not resume.filename:
        logger.error("Upload attempt with empty filename.")
        raise HTTPException(status_code=400, detail="No file was uploaded or filename is empty.")

    # 2. Validate extension
    ext = os.path.splitext(resume.filename)[1].lower()
    if ext != ".pdf":
        logger.warning(f"File validation failed: extension '{ext}' is not '.pdf'")
        raise HTTPException(status_code=400, detail="Wrong file type. Only PDF (.pdf) files are accepted.")

    # 3. Validate size
    try:
        resume.file.seek(0, 2)
        file_size = resume.file.tell()
        resume.file.seek(0)
    except Exception as e:
        logger.error(f"Failed to read file size: {str(e)}")
        raise HTTPException(status_code=400, detail="Could not read the uploaded file.")

    max_size_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
    if file_size > max_size_bytes:
        logger.warning(f"File validation failed: size {file_size} bytes exceeds limit of {max_size_bytes} bytes ({settings.MAX_UPLOAD_SIZE_MB}MB)")
        raise HTTPException(status_code=413, detail=f"File too large. Maximum allowed size is {settings.MAX_UPLOAD_SIZE_MB}MB.")

    # 4. Generate UUID filename and resolve temp path
    unique_filename = f"{uuid.uuid4()}{ext}"
    temp_file_path = os.path.join(settings.UPLOAD_DIR, unique_filename)
    
    # Ensure the destination directory exists
    settings.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

    start_time = time.time()
    try:
        # 5. Save the file to uploads/ using threadpool
        logger.info(f"Saving temporary file to: {temp_file_path}")
        await run_in_threadpool(save_file_sync, resume.file, temp_file_path)
        
        # 6. Extract PDF text using threadpool
        logger.info(f"Extracting text from PDF file: {temp_file_path}")
        raw_text, num_pages = await run_in_threadpool(extract_text_from_pdf, temp_file_path)
        
        extraction_time = time.time() - start_time
        logger.info(f"PDF extraction completed in {extraction_time:.4f} seconds.")
        
        # 7. Clean text
        cleaned_text = clean_text(raw_text)
        
        logger.info(
            f"Processing success: file='{resume.filename}', pages={num_pages}, "
            f"raw_chars={len(raw_text)}, cleaned_chars={len(cleaned_text)}"
        )
        
        return {
            "success": True,
            "filename": resume.filename,
            "pages": num_pages,
            "characters": len(cleaned_text),
            "text": cleaned_text
        }
        
    except PDFParsingError as e:
        logger.error(f"Unreadable PDF error for '{resume.filename}': {str(e)}")
        raise HTTPException(status_code=422, detail=f"Unreadable PDF: {str(e)}")
        
    except HTTPException:
        # Re-raise standard HTTP exceptions
        raise
        
    except Exception as e:
        logger.exception(f"Unexpected error processing '{resume.filename}': {str(e)}")
        raise HTTPException(status_code=500, detail="An unexpected error occurred while processing the PDF file.")
        
    finally:
        # 8. Always delete the temporary file from disk
        if os.path.exists(temp_file_path):
            try:
                os.remove(temp_file_path)
                logger.info(f"Successfully deleted temporary file: {temp_file_path}")
            except Exception as e:
                logger.error(f"Failed to delete temporary file '{temp_file_path}': {str(e)}")
