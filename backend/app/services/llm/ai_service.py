import json
from pathlib import Path
from app.core.logging import logger
from app.schemas.career_profile import CareerProfile
from app.schemas.master_analysis import MasterAnalysis
from app.services.llm.embedding_client import embedding_client
from app.services.llm.groq_client import groq_client

PROMPT_PATH = Path(__file__).resolve().parent.parent.parent / "prompts" / "master_analysis.txt"

def extract_resume_profile(text: str) -> CareerProfile:
    """
    Extract structured CareerProfile from raw resume text using Groq LLM.
    Downstream business logic calls this instead of calling groq_client directly.
    """
    from app.services.resume.resume_extractor import extract_career_profile
    return extract_career_profile(text)

def get_embeddings_instance():
    """
    Get the underlying LangChain GoogleGenAIEmbeddings client instance.
    Used by vector store layer.
    """
    return embedding_client.embeddings

def generate_master_analysis(profile: CareerProfile, resume_context: str) -> MasterAnalysis:
    """
    Generate master career analysis using Groq LLM.
    Downstream business logic calls this instead of calling groq_client directly.
    """
    logger.info("Generating master career analysis using Groq...")
    
    # Load prompt template
    try:
        with open(PROMPT_PATH, "r", encoding="utf-8") as f:
            template = f.read()
    except Exception as e:
        logger.error(f"Failed to load master analysis prompt template: {str(e)}")
        raise RuntimeError(f"Prompt template missing: {str(e)}")
        
    user_prompt = template.format(
        career_profile=profile.model_dump_json(indent=2),
        resume_context=resume_context or "No additional context found."
    )
    
    messages = [
        {"role": "user", "content": user_prompt}
    ]
    
    import time
    start_time = time.time()
    try:
        response_str = groq_client.get_completion(
            messages=messages,
            response_format={"type": "json_object"},
            temperature=0.3
        )
        duration = time.time() - start_time
        logger.info(f"Groq API master analysis call completed in {duration:.4f} seconds.")
    except Exception as e:
        logger.error(f"Groq API call failed for master analysis: {str(e)}")
        raise RuntimeError(f"LLM analysis failed: {str(e)}")
        
    try:
        parsed_json = json.loads(response_str)
    except json.JSONDecodeError as e:
        logger.error(f"Groq did not return valid JSON for master analysis: {str(e)}")
        raise ValueError(f"Failed to parse LLM analysis response as JSON: {str(e)}")
        
    try:
        analysis = MasterAnalysis.model_validate(parsed_json)
        logger.info("Successfully validated master career analysis response.")
        return analysis
    except Exception as e:
        logger.error(f"Validation of master career analysis failed: {str(e)}")
        raise ValueError(f"Generated analysis data did not conform to schema: {str(e)}")

