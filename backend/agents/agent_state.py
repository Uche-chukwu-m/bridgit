from typing import TypedDict, List, Dict, Any, Optional
from datetime import datetime

class AgentState(TypedDict, total=False):
    """
    State that flows through the agent graph
    """
    # Input
    image_base64: Optional[str]
    image_media_type: Optional[str]
    user_location: Optional[str]
    
    # Vision Agent Output
    vehicle_detected: Optional[bool]
    vehicle_type: Optional[str]
    visual_detections: Optional[List[Dict[str, Any]]]
    vision_confidence: Optional[float]
    vision_reasoning: Optional[str]
    
    # Measurement Agent Output
    base_height_inches: Optional[int]
    roof_equipment: Optional[List[Dict[str, Any]]]
    total_height_inches: Optional[int]
    measurement_uncertainty: Optional[int]
    measurement_reasoning: Optional[str]
    
    # Location Agent Output
    location_coords: Optional[Dict[str, float]]
    geocoding_result: Optional[Dict[str, Any]]
    location_reasoning: Optional[str]
    
    # Bridge Query Agent Output
    nearby_bridges: Optional[List[Dict[str, Any]]]
    bridge_count: Optional[int]
    bridge_query_reasoning: Optional[str]
    
    # Weather Agent Output
    weather_conditions: Optional[Dict[str, Any]]
    clearance_adjustment: Optional[int]
    weather_warnings: Optional[List[str]]
    
    # Risk Assessment Agent Output
    dangerous_bridges: Optional[List[Dict[str, Any]]]
    risk_level: Optional[str]
    strike_probability: Optional[float]
    risk_reasoning: Optional[str]
    
    # Recommendation Agent Output
    recommendations: Optional[List[str]]
    safe_routes: Optional[List[str]]
    avoid_routes: Optional[List[str]]
    final_report: Optional[str]
    
    # Agent Execution Log
    agent_log: List[Dict[str, Any]]
    
    # Errors
    errors: List[str]

def create_initial_state(
    image_base64: str = None,
    image_media_type: str = None,
    user_location: str = None
) -> AgentState:
    """Create initial state for agent graph"""
    return {
        "image_base64": image_base64,
        "image_media_type": image_media_type,
        "user_location": user_location,
        "agent_log": [],
        "errors": []
    }

def log_agent_action(
    state: AgentState,
    agent_name: str,
    action: str,
    result: Any = None,
    duration: float = 0
) -> AgentState:
    """Add entry to agent execution log"""
    log_entry = {
        "agent": agent_name,
        "action": action,
        "timestamp": datetime.now().isoformat(),
        "duration_seconds": round(duration, 2),
        "result": result
    }
    state["agent_log"].append(log_entry)
    return state