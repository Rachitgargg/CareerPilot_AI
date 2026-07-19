from typing import TypedDict, List, Dict, Optional
from langgraph.graph import StateGraph, START, END
from app.schemas.career_profile import CareerProfile
from app.schemas.master_analysis import MasterAnalysis
from app.schemas.tailoring import ResumeTailoringReport
from app.services.graph.tailoring_nodes import (
    load_profile_node,
    load_master_analysis_node,
    retrieve_context_node,
    tailoring_analysis_node,
    validate_output_node,
    persist_cache_node
)

class TailoringGraphState(TypedDict):
    session_id: str
    job_description: str
    job_hash: str
    job_requirements: Optional[dict]
    career_profile: Optional[CareerProfile]
    master_analysis: Optional[MasterAnalysis]
    resume_context: Optional[str]
    tailoring_report: Optional[ResumeTailoringReport]
    errors: List[str]

def build_tailoring_graph():
    builder = StateGraph(TailoringGraphState)
    
    # Register the nodes
    builder.add_node("load_profile", load_profile_node)
    builder.add_node("load_master_analysis", load_master_analysis_node)
    builder.add_node("retrieve_context", retrieve_context_node)
    builder.add_node("tailoring_analysis", tailoring_analysis_node)
    builder.add_node("validate_output", validate_output_node)
    builder.add_node("persist_cache", persist_cache_node)
    
    # Linear connections
    builder.add_edge(START, "load_profile")
    builder.add_edge("load_profile", "load_master_analysis")
    builder.add_edge("load_master_analysis", "retrieve_context")
    builder.add_edge("retrieve_context", "tailoring_analysis")
    builder.add_edge("tailoring_analysis", "validate_output")
    builder.add_edge("validate_output", "persist_cache")
    builder.add_edge("persist_cache", END)
    
    return builder.compile()

tailoring_graph = build_tailoring_graph()
