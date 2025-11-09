import asyncio
from agents.agent_graph import run_agent_workflow

async def test_workflow():
    """Test the agent workflow without image (location only)"""
    
    print("🤖 Testing Multi-Agent Workflow...")
    print("=" * 50)
    
    result = await run_agent_workflow(
        image_base64=None,  # Test without image first
        user_location="Boston, MA"
    )
    
    print("\n📊 AGENT EXECUTION LOG:")
    print("=" * 50)
    for log_entry in result.get("agent_log", []):
        agent = log_entry.get("agent")
        action = log_entry.get("action")
        duration = log_entry.get("duration_seconds")
        print(f"\n✓ {agent}: {action} ({duration}s)")
        if log_entry.get("result"):
            print(f"  Result: {log_entry['result']}")
    
    print("\n\n📍 LOCATION DATA:")
    print("=" * 50)
    print(f"Coordinates: {result.get('location_coords')}")
    
    print("\n\n🌉 BRIDGE DATA:")
    print("=" * 50)
    print(f"Bridges found: {result.get('bridge_count')}")
    print(f"Nearby bridges: {result.get('nearby_bridges')}")
    
    print("\n\n🌤️ WEATHER DATA:")
    print("=" * 50)
    print(f"Conditions: {result.get('weather_conditions')}")
    
    print("\n\n❌ ERRORS:")
    print("=" * 50)
    print(result.get('errors'))

if __name__ == "__main__":
    asyncio.run(test_workflow())