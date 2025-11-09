from langgraph.graph import StateGraph, END
from .agent_state import AgentState, create_initial_state
from .vehicle_agents import VehicleAgents

def create_agent_workflow():
    """
    Create LangGraph workflow with all agents
    """
    
    # Create graph
    workflow = StateGraph(AgentState)
    
    # Add nodes (agents)
    workflow.add_node("vision_agent", VehicleAgents.vision_agent)
    workflow.add_node("measurement_agent", VehicleAgents.measurement_agent)
    workflow.add_node("location_agent", VehicleAgents.location_agent)
    workflow.add_node("bridge_query_agent", VehicleAgents.bridge_query_agent)
    workflow.add_node("weather_agent", VehicleAgents.weather_agent)
    workflow.add_node("risk_assessment_agent", VehicleAgents.risk_assessment_agent)
    workflow.add_node("recommendation_agent", VehicleAgents.recommendation_agent)
    
    # Define edges (workflow)
    workflow.set_entry_point("vision_agent")
    workflow.add_edge("vision_agent", "measurement_agent")
    workflow.add_edge("measurement_agent", "location_agent")
    workflow.add_edge("location_agent", "bridge_query_agent")
    workflow.add_edge("bridge_query_agent", "weather_agent")
    workflow.add_edge("weather_agent", "risk_assessment_agent")
    workflow.add_edge("risk_assessment_agent", "recommendation_agent")
    workflow.add_edge("recommendation_agent", END)
    
    # Compile
    app = workflow.compile()
    
    return app

# Create singleton instance
agent_workflow = create_agent_workflow()

async def run_agent_workflow(
    image_base64: str = None,
    image_media_type: str = "image/jpeg",
    user_location: str = "Boston, MA"
) -> AgentState:
    """
    Run the complete agent workflow
    """
    initial_state = create_initial_state(
        image_base64=image_base64,
        image_media_type=image_media_type,
        user_location=user_location
    )
    
    # Run the workflow
    final_state = agent_workflow.invoke(initial_state)
    
    return final_state