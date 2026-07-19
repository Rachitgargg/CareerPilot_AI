import os
import json
from pathlib import Path
from app.core.config import settings
from app.core.logging import logger
from app.schemas.career_profile import CareerProfile
from app.services.llm.groq_client import groq_client

PROMPT_PATH = Path(__file__).resolve().parent.parent.parent / "prompts" / "resume_extraction.txt"

def load_prompt_template() -> str:
    try:
        with open(PROMPT_PATH, "r", encoding="utf-8") as f:
            return f.read()
    except Exception as e:
        logger.error(f"Failed to load resume extraction prompt template from {PROMPT_PATH}: {str(e)}")
        raise RuntimeError(f"Prompt template missing: {str(e)}")

def extract_career_profile(text: str) -> CareerProfile:
    """
    Extract structured career profile from raw cleaned resume text.
    """
    logger.info("Starting resume details extraction using Groq...")
    
    # 1. Load prompt template
    template = load_prompt_template()
    
    # 2. Format template with text
    user_prompt = template.format(resume_text=text)
    
    messages = [
        {"role": "user", "content": user_prompt}
    ]
    
    # 3. Call Groq client completion in JSON mode
    try:
        response_str = groq_client.get_completion(
            messages=messages,
            response_format={"type": "json_object"},
            temperature=0.1
        )
    except Exception as e:
        logger.error(f"Groq client failed during resume extraction: {str(e)}")
        raise RuntimeError(f"LLM extraction failed: {str(e)}")
        
    # 4. Parse JSON and validate with CareerProfile
    try:
        parsed_json = json.loads(response_str)
    except json.JSONDecodeError as e:
        logger.error(f"Groq did not return valid JSON: {str(e)}")
        raise ValueError(f"Failed to parse LLM response as JSON: {str(e)}")
        
    try:
        profile = CareerProfile.model_validate(parsed_json)
        logger.info("Successfully validated extracted resume JSON into CareerProfile schema.")
        return profile
    except Exception as e:
        logger.error(f"Validation of extracted profile failed: {str(e)}")
        raise ValueError(f"Extracted resume data did not conform to schema: {str(e)}")
