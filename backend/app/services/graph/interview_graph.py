from typing import TypedDict, List, Optional
from langgraph.graph import StateGraph, START, END
from app.schemas.career_profile import CareerProfile
from app.schemas.master_analysis import MasterAnalysis
from app.schemas.interview import InterviewCoachReport
from app.services.graph.interview_nodes import (
    load_profile_node,
    load_master_analysis_node,
    retrieve_resume_context_node,
    determine_focus_node,
    generate_report_node,
    validate_report_node,
    persist_cache_node
)

class InterviewGraphState(TypedDict):
    session_id: str
    target_role: str
    job_description: Optional[str]
    job_hash: Optional[str] # Cache key identifier
    career_profile: Optional[CareerProfile]
    master_analysis: Optional[MasterAnalysis]
    resume_context: Optional[str]
    interview_focus: Optional[dict]
    report: Optional[InterviewCoachReport]
    errors: List[str]

def build_interview_graph():
    builder = StateGraph(InterviewGraphState)
    
    # 1. Register nodes
    builder.add_node("load_profile", load_profile_node)
    builder.add_node("load_master_analysis", load_master_analysis_node)
    builder.add_node("retrieve_resume_context", retrieve_resume_context_node)
    builder.add_node("determine_focus", determine_focus_node)
    builder.add_node("generate_report", generate_report_node)
    builder.add_node("validate_report", validate_report_node)
    builder.add_node("persist_cache", persist_cache_node)
    
    # 2. Build linear connection sequence
    builder.add_edge(START, "load_profile")
    builder.add_edge("load_profile", "load_master_analysis")
    builder.add_edge("load_master_analysis", "retrieve_resume_context")
    builder.add_edge("retrieve_resume_context", "determine_focus")
    builder.add_edge("determine_focus", "generate_report")
    builder.add_edge("generate_report", "validate_report")
    builder.add_edge("validate_report", "persist_cache")
    builder.add_edge("persist_cache", END)
    
    return builder.compile()

interview_graph = build_interview_graph()
