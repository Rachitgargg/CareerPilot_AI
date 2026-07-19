from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document
from app.core.logging import logger

def chunk_resume(text: str) -> list[Document]:
    """
    Split cleaned resume text into chunks.
    Configured with chunk_size=800 and chunk_overlap=150.
    Outputs: List of LangChain Document objects with source and chunk_index metadata.
    """
    logger.info("Starting resume chunking...")
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=800,
        chunk_overlap=150
    )
    
    # Split text
    chunks = splitter.split_text(text)
    logger.info(f"Split resume text into {len(chunks)} chunks.")
    
    # Create Document objects with metadata
    documents = []
    for idx, chunk_text in enumerate(chunks, start=1):
        doc = Document(
            page_content=chunk_text,
            metadata={
                "source": "resume",
                "chunk_index": idx
            }
        )
        documents.append(doc)
        
    return documents
