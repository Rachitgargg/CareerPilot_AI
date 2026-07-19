import fitz  # PyMuPDF
from app.core.logging import logger

class PDFParsingError(Exception):
    """Exception raised when PDF parsing fails or the file is corrupted."""
    pass

def extract_text_from_pdf(pdf_path: str) -> tuple[str, int]:
    """
    Extracts text from each page of a PDF using PyMuPDF (fitz).
    
    Args:
        pdf_path: Absolute path to the PDF file.
        
    Returns:
        A tuple containing:
            - combined_text: Extracted and concatenated text from all non-blank pages.
            - total_pages: Total number of pages in the PDF.
            
    Raises:
        PDFParsingError: If PyMuPDF fails to open the document or process it.
    """
    doc = None
    try:
        doc = fitz.open(pdf_path)
    except Exception as e:
        logger.error(f"Failed to open PDF file {pdf_path}: {str(e)}")
        raise PDFParsingError(f"The PDF file is unreadable or corrupted: {str(e)}")
        
    try:
        pages_text = []
        total_pages = len(doc)
        
        for page_num in range(total_pages):
            page = doc.load_page(page_num)
            text = page.get_text("text")
            # Ignore blank pages
            if text and text.strip():
                pages_text.append(text)
                
        combined_text = "\n".join(pages_text)
        return combined_text, total_pages
    except Exception as e:
        logger.error(f"Error extracting text from PDF file {pdf_path}: {str(e)}")
        raise PDFParsingError(f"An error occurred while parsing the PDF: {str(e)}")
    finally:
        if doc is not None:
            doc.close()
