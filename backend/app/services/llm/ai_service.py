import json
from typing import Optional
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


def detect_intent_with_groq(message: str, history: list) -> str:
    """
    Detect user query intent using Groq LLM.
    """
    logger.info("Detecting chat intent using Groq...")
    
    # 1. Load prompt template
    intent_prompt_path = Path(__file__).resolve().parent.parent.parent / "prompts" / "chat" / "intent_detection.txt"
    try:
        with open(intent_prompt_path, "r", encoding="utf-8") as f:
            template = f.read()
    except Exception as e:
        logger.error(f"Failed to load intent detection prompt template: {str(e)}")
        raise RuntimeError(f"Intent template missing: {str(e)}")
    
    # Format history as string
    formatted_history = ""
    for msg in history[-10:]: # last 10 messages for context
        role = msg.get("role", "user").capitalize()
        content = msg.get("content", "")
        formatted_history += f"{role}: {content}\n"
        
    user_prompt = template.format(
        history=formatted_history or "No previous history.",
        message=message
    )
    
    messages = [
        {"role": "user", "content": user_prompt}
    ]
    
    try:
        response_str = groq_client.get_completion(
            messages=messages,
            response_format={"type": "json_object"},
            temperature=0.0
        )
    except Exception as e:
        logger.error(f"Groq API call failed for intent detection: {str(e)}")
        raise RuntimeError(f"LLM intent detection failed: {str(e)}")
        
    try:
        parsed_json = json.loads(response_str)
        intent = parsed_json.get("intent", "general").strip().lower()
    except Exception as e:
        logger.error(f"Failed to parse Groq response for intent: {str(e)}")
        intent = "general"
        
    allowed_intents = {"career_advice", "resume_question", "skills", "projects", "roadmap", "ats", "interview", "general"}
    if intent not in allowed_intents:
        logger.warning(f"Groq returned unknown intent: {intent}. Defaulting to general.")
        intent = "general"
        
    logger.info(f"Detected intent: {intent}")
    return intent


def generate_chat_response_with_groq(context: str, history: list, message: str) -> str:
    """
    Generate professional AI career mentor chat response using Groq.
    """
    logger.info("Generating chat response using Groq...")
    
    # 1. Load prompts
    base_prompts_dir = Path(__file__).resolve().parent.parent.parent / "prompts" / "chat"
    system_path = base_prompts_dir / "system.txt"
    response_path = base_prompts_dir / "response_generation.txt"
    
    try:
        with open(system_path, "r", encoding="utf-8") as f:
            system_prompt = f.read()
        with open(response_path, "r", encoding="utf-8") as f:
            response_template = f.read()
    except Exception as e:
        logger.error(f"Failed to load chat prompts: {str(e)}")
        raise RuntimeError(f"Chat prompts missing: {str(e)}")
        
    # Format context prompt
    context_prompt = response_template.format(context=context or "No specific context available.")
    
    # Build messages list
    messages = []
    
    # Add main system persona prompt
    messages.append({"role": "system", "content": system_prompt})
    
    # Add context prompt as assistant system guidance instruction
    messages.append({"role": "system", "content": context_prompt})
    
    # Add only the most recent N exchanges (last 20 messages)
    recent_history = history[-20:] if history else []
    for msg in recent_history:
        messages.append({
            "role": msg.get("role", "user"),
            "content": msg.get("content", "")
        })
        
    # Add user message
    messages.append({"role": "user", "content": message})
    
    try:
        response_str = groq_client.get_completion(
            messages=messages,
            temperature=0.4
        )
        return response_str
    except Exception as e:
        logger.error(f"Groq API call failed for chat response: {str(e)}")
        raise RuntimeError(f"LLM chat response generation failed: {str(e)}")


def generate_resume_tailoring(
    profile: CareerProfile,
    analysis: MasterAnalysis,
    resume_context: str,
    job_description: str
):
    """
    Generate resume tailoring report comparing profile, analysis, and context against job description.
    Uses Groq and returns a validated ResumeTailoringReport.
    """
    from app.schemas.tailoring import ResumeTailoringReport
    logger.info("Generating resume tailoring report using Groq...")
    
    prompt_path = Path(__file__).resolve().parent.parent.parent / "prompts" / "resume_tailoring.txt"
    try:
        with open(prompt_path, "r", encoding="utf-8") as f:
            template = f.read()
    except Exception as e:
        logger.error(f"Failed to load resume tailoring prompt template: {str(e)}")
        raise RuntimeError(f"Prompt template missing: {str(e)}")
        
    user_prompt = template.format(
        career_profile=profile.model_dump_json(indent=2),
        master_analysis=analysis.model_dump_json(indent=2) if analysis else "No master analysis available.",
        resume_context=resume_context or "No additional resume excerpts available.",
        job_description=job_description
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
            temperature=0.2
        )
        duration = time.time() - start_time
        logger.info(f"Groq API tailoring call completed in {duration:.4f} seconds.")
    except Exception as e:
        logger.error(f"Groq API call failed for resume tailoring: {str(e)}")
        raise RuntimeError(f"LLM tailoring failed: {str(e)}")
        
    try:
        parsed_json = json.loads(response_str)
    except json.JSONDecodeError as e:
        logger.error(f"Groq did not return valid JSON for tailoring: {str(e)}")
        raise ValueError(f"Failed to parse LLM response as JSON: {str(e)}")
        
    try:
        report = ResumeTailoringReport.model_validate(parsed_json)
        return report
    except Exception as e:
        logger.error(f"Validation of tailoring report failed: {str(e)}")
        raise ValueError(f"Generated tailoring report did not conform to schema: {str(e)}")


def generate_interview_coach(
    profile: CareerProfile,
    analysis: MasterAnalysis,
    resume_context: str,
    target_role: str,
    interview_focus: Optional[dict] = None,
    job_description: Optional[str] = None
):
    """
    Generate interview coach report comparing sliced profile, sliced analysis, and context against target role and optional job description.
    Uses Groq and returns a validated InterviewCoachReport.
    """
    from app.schemas.interview import InterviewCoachReport
    from app.services.interview.interview_parser import slice_interview_context
    
    logger.info("Generating interview coach report using Groq...")
    
    prompt_path = Path(__file__).resolve().parent.parent.parent / "prompts" / "interview_coach.txt"
    try:
        with open(prompt_path, "r", encoding="utf-8") as f:
            template = f.read()
    except Exception as e:
        logger.error(f"Failed to load interview coach prompt template: {str(e)}")
        raise RuntimeError(f"Prompt template missing: {str(e)}")
        
    # Calculate original sizes
    full_profile_str = profile.model_dump_json()
    full_analysis_str = analysis.model_dump_json() if analysis else ""
    original_size = len(full_profile_str) + len(full_analysis_str)
    
    # Perform Context Slicing to minimize prompt size (Render Free Tier optimization)
    focus_areas = interview_focus.get("focus_areas", []) if interview_focus else []
    sliced_profile, sliced_analysis = slice_interview_context(profile, analysis, focus_areas)
    
    sliced_profile_str = json.dumps(sliced_profile, indent=2)
    sliced_analysis_str = json.dumps(sliced_analysis, indent=2)
    sliced_size = len(sliced_profile_str) + len(sliced_analysis_str)
    
    reduction = ((original_size - sliced_size) / original_size * 100) if original_size > 0 else 0
    logger.info(
        f"Context Slicing Complete | "
        f"Original Context Size: {original_size} chars | "
        f"Sliced Context Size: {sliced_size} chars | "
        f"Size Reduction: {reduction:.2f}%"
    )
        
    user_prompt = template.format(
        career_profile=sliced_profile_str,
        master_analysis=sliced_analysis_str,
        resume_context=resume_context or "No additional resume excerpts available.",
        target_role=target_role,
        job_description=job_description or "Not provided."
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
        logger.info(f"Groq API interview coach call completed in {duration:.4f} seconds.")
    except Exception as e:
        logger.error(f"Groq API call failed for interview coach: {str(e)}")
        raise RuntimeError(f"LLM interview coaching failed: {str(e)}")
        
    try:
        parsed_json = json.loads(response_str)
    except json.JSONDecodeError as e:
        logger.error(f"Groq did not return valid JSON for interview coach: {str(e)}")
        raise ValueError(f"Failed to parse LLM response as JSON: {str(e)}")
        
    try:
        report = InterviewCoachReport.model_validate(parsed_json)
        return report
    except Exception as e:
        logger.error(f"Validation of interview coach report failed: {str(e)}")
        raise ValueError(f"Generated interview coach report did not conform to schema: {str(e)}")


def generate_job_recommendations(
    profile: CareerProfile,
    analysis: MasterAnalysis,
    jobs_list: list,
    target_role: str
):
    """
    Generate personalized AI explanations and priorities for the top 10 ranked jobs using Groq.
    Returns a validated JobDiscoveryResponse.
    """
    from app.schemas.jobs import JobDiscoveryResponse
    
    logger.info("Generating job recommendations using Groq...")
    
    prompt_path = Path(__file__).resolve().parent.parent.parent / "prompts" / "job_discovery.txt"
    try:
        with open(prompt_path, "r", encoding="utf-8") as f:
            template = f.read()
    except Exception as e:
        logger.error(f"Failed to load job discovery prompt template: {str(e)}")
        raise RuntimeError(f"Prompt template missing: {str(e)}")
        
    # Context slicing to minimize prompt token count
    sliced_profile = {
        "summary": profile.summary or "",
        "skills": profile.skills.model_dump() if profile.skills else {},
        "education": [
            {"degree": edu.degree, "field": edu.field} 
            for edu in profile.education
        ] if profile.education else []
    }
    
    sliced_analysis = {
        "career_summary": analysis.career_summary or "",
        "skills_gap": analysis.skills_gap.model_dump() if analysis.skills_gap else {},
        "strengths": analysis.ats_analysis.strengths if analysis.ats_analysis else []
    }
    
    # Measure sizes
    full_size = len(profile.model_dump_json()) + len(analysis.model_dump_json() if analysis else "")
    sliced_size = len(json.dumps(sliced_profile)) + len(json.dumps(sliced_analysis))
    reduction = ((full_size - sliced_size) / full_size * 100) if full_size > 0 else 0
    
    logger.info(
        f"Context Slicing for Job Discovery | "
        f"Original Size: {full_size} chars | "
        f"Sliced Size: {sliced_size} chars | "
        f"Reduction: {reduction:.2f}%"
    )
    
    user_prompt = template.format(
        career_profile=json.dumps(sliced_profile, indent=2),
        master_analysis=json.dumps(sliced_analysis, indent=2),
        ranked_jobs=json.dumps(jobs_list, indent=2),
        target_role=target_role
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
            temperature=0.2
        )
        duration = time.time() - start_time
        logger.info(f"Groq API job recommendations completed in {duration:.4f} seconds.")
    except Exception as e:
        logger.error(f"Groq API call failed for job recommendations: {str(e)}")
        raise RuntimeError(f"LLM job recommendations failed: {str(e)}")
        
    try:
        parsed_json = json.loads(response_str)
    except json.JSONDecodeError as e:
        logger.error(f"Groq did not return valid JSON for job recommendations: {str(e)}")
        raise ValueError(f"Failed to parse LLM response as JSON: {str(e)}")
        
    try:
        report = JobDiscoveryResponse.model_validate(parsed_json)
        return report
    except Exception as e:
        logger.error(f"Validation of job recommendations failed: {str(e)}")
        raise ValueError(f"Generated job recommendations did not conform to schema: {str(e)}")



