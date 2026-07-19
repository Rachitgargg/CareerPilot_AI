from typing import TypedDict, List, Optional
from langgraph.graph import StateGraph, START, END
from app.schemas.career_profile import CareerProfile
from app.schemas.master_analysis import MasterAnalysis
from app.services.graph.nodes import (
    load_profile_node,
    retrieve_context_node,
    analyze_node,
    validate_node,
    persist_node
)

class GraphState(TypedDict):
    session_id: str
    career_profile: Optional[CareerProfile]
    resume_context: Optional[str]
    master_analysis: Optional[MasterAnalysis]
    errors: List[str]

def build_career_graph():
    builder = StateGraph(GraphState)
    
    # Add nodes
    builder.add_node("load_profile", load_profile_node)
    builder.add_node("retrieve_context", retrieve_context_node)
    builder.add_node("analyze", analyze_node)
    builder.add_node("validate", validate_node)
    builder.add_node("persist", persist_node)
    
    # Connect graph sequentially
    builder.add_edge(START, "load_profile")
    builder.add_edge("load_profile", "retrieve_context")
    builder.add_edge("retrieve_context", "analyze")
    builder.add_edge("analyze", "validate")
    builder.add_edge("validate", "persist")
    builder.add_edge("persist", END)
    
    return builder.compile()

career_graph = build_career_graph()
