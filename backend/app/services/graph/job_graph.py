from typing import TypedDict, List, Optional
from langgraph.graph import StateGraph, START, END
from app.schemas.career_profile import CareerProfile
from app.schemas.master_analysis import MasterAnalysis
from app.schemas.jobs import JobDiscoveryResponse
from app.services.graph.job_nodes import (
    load_profile_node,
    load_master_analysis_node,
    generate_search_query_node,
    search_jobs_node,
    normalize_jobs_node,
    python_match_scoring_node,
    generate_recommendations_node
)

class JobGraphState(TypedDict):
    session_id: str
    preferred_role: Optional[str]
    location: Optional[str]
    career_profile: Optional[CareerProfile]
    master_analysis: Optional[MasterAnalysis]
    search_query: Optional[str]
    raw_jobs: Optional[List[dict]]
    normalized_jobs: Optional[List[dict]]
    scored_jobs: Optional[List[dict]]
    report: Optional[JobDiscoveryResponse]
    errors: List[str]

def build_job_graph():
    builder = StateGraph(JobGraphState)
    
    # 1. Register nodes
    builder.add_node("load_profile", load_profile_node)
    builder.add_node("load_master_analysis", load_master_analysis_node)
    builder.add_node("generate_search_query", generate_search_query_node)
    builder.add_node("search_jobs", search_jobs_node)
    builder.add_node("normalize_jobs", normalize_jobs_node)
    builder.add_node("python_match_scoring", python_match_scoring_node)
    builder.add_node("generate_recommendations", generate_recommendations_node)
    
    # 2. Build linear sequence
    builder.add_edge(START, "load_profile")
    builder.add_edge("load_profile", "load_master_analysis")
    builder.add_edge("load_master_analysis", "generate_search_query")
    builder.add_edge("generate_search_query", "search_jobs")
    builder.add_edge("search_jobs", "normalize_jobs")
    builder.add_edge("normalize_jobs", "python_match_scoring")
    builder.add_edge("python_match_scoring", "generate_recommendations")
    builder.add_edge("generate_recommendations", END)
    
    return builder.compile()

job_graph = build_job_graph()
