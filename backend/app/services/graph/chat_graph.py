from typing import TypedDict, List, Dict, Optional
from langgraph.graph import StateGraph, START, END
from app.services.graph.chat_nodes import (
    load_memory_node,
    intent_detection_node,
    context_builder_node,
    tool_router_node,
    response_generation_node,
    save_memory_node
)

class ChatGraphState(TypedDict):
    session_id: str
    user_message: str
    chat_history: List[Dict[str, str]]
    intent: str
    needed_tools: List[str]
    context: str
    sources: List[str]
    response: str
    errors: List[str]

def build_chat_graph():
    builder = StateGraph(ChatGraphState)
    
    # Register the nodes
    builder.add_node("load_memory", load_memory_node)
    builder.add_node("intent_detection", intent_detection_node)
    builder.add_node("context_builder", context_builder_node)
    builder.add_node("tool_router", tool_router_node)
    builder.add_node("response_generation", response_generation_node)
    builder.add_node("save_memory", save_memory_node)
    
    # Linear execution order
    builder.add_edge(START, "load_memory")
    builder.add_edge("load_memory", "intent_detection")
    builder.add_edge("intent_detection", "context_builder")
    builder.add_edge("context_builder", "tool_router")
    builder.add_edge("tool_router", "response_generation")
    builder.add_edge("response_generation", "save_memory")
    builder.add_edge("save_memory", END)
    
    return builder.compile()

chat_graph = build_chat_graph()
