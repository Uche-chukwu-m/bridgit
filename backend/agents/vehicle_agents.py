from openai import OpenAI
import os
import json
import time
from typing import Dict, Any
from .agent_state import AgentState, log_agent_action
from tools.external_tools import ExternalTools

client = OpenAI(
    base_url="https://integrate.api.nvidia.com/v1",
    api_key=os.getenv("NVIDIA_API_KEY")
)
tools = ExternalTools()

class VehicleAgents:
    """Collection of specialized agents for vehicle analysis"""
    
    @staticmethod
    def vision_agent(state: AgentState) -> AgentState:
        """
        Agent 1: Vision Analysis
        Analyzes image to identify vehicle type and visible features
        """
        start_time = time.time()
        agent_name = "VisionAgent"
        
        try:
            state = log_agent_action(state, agent_name, "Starting image analysis")
            
            if not state.get("image_base64"):
                state["errors"].append("No image provided")
                state["vehicle_detected"] = False
                return state
            
            # Call Nemotron for vision analysis
            response = client.chat.completions.create(
                model="nvidia/llama-3.1-nemotron-70b-instruct-v1",
                max_tokens=2000,
                messages=[{
                    "role": "user",
                    "content": [
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:{state.get('image_media_type', 'image/jpeg')};base64,{state['image_base64']}"
                            }
                        },
                        {
                            "type": "text",
                            "text": """You are an expert at analyzing vehicle dimensions from photos.

CRITICAL TASK: Estimate vehicle height as accurately as possible using ALL visual cues.

ANALYSIS STEPS:
1. Identify vehicle type and model (use proportions, logos, design)
2. Use reference objects for scale:
   - Wheels/tires (typically 30-40" diameter for trucks, 24-30" for vans)
   - Door height (typically 60-72" for cab doors)
   - Windows (standard sizes vary by vehicle type)
   - Nearby objects (if any people, cars, buildings visible)
3. Detect ALL roof-mounted equipment with estimated heights:
   - AC units: 8-12" typical (look at profile/shadow)
   - Antennas: 4-10" (measure visually against reference)
   - Roof racks: 3-8"
   - Satellite dishes: 6-10"
   - Custom equipment: estimate from proportions
4. Account for camera angle and perspective distortion
5. Provide confidence levels and uncertainty ranges

RESPOND WITH VALID JSON ONLY:
{
  "vehicle_detected": boolean,
  "vehicle_type": "box truck/RV/van/etc - be specific with model if visible",
  "make_model_estimate": "if logos/design visible",
  "base_height_estimate_inches": number (your best visual estimate of cab/base height),
  "estimation_method": "explain what visual references you used",
  "visible_items": [
    {
      "item": "AC unit/antenna/etc",
      "description": "detailed visual description",
      "height_estimate_inches": number (visual estimate from proportions),
      "estimation_confidence": 0.0-1.0,
      "visual_reasoning": "explain how you estimated this height"
    }
  ],
  "total_height_estimate_inches": number (base + all equipment),
  "uncertainty_range_inches": number (±X inches based on confidence),
  "overall_confidence": 0.0-1.0,
  "reference_objects_used": ["wheel diameter", "door height", etc],
  "perspective_notes": "any camera angle or distortion concerns",
  "reasoning": "comprehensive explanation of your height calculation"
}

BE PRECISE: Look for any visual clues about scale. Compare equipment sizes to vehicle proportions. Use multiple reference points."""
                        }
                    ]
                }]
            )
            
            # Parse response
            response_text = response.choices[0].message.content
            if "```json" in response_text:
                json_str = response_text.split("```json")[1].split("```")[0].strip()
            else:
                json_str = response_text.strip()
            
            result = json.loads(json_str)
            
            # Update state with enhanced visual measurements
            state["vehicle_detected"] = result.get("vehicle_detected", False)
            state["vehicle_type"] = result.get("vehicle_type")
            state["make_model_estimate"] = result.get("make_model_estimate")
            state["base_height_estimate"] = result.get("base_height_estimate_inches")
            state["visual_detections"] = result.get("visible_items", [])
            state["vision_confidence"] = result.get("overall_confidence", 0.8)
            state["vision_reasoning"] = result.get("reasoning")
            state["visual_estimation_method"] = result.get("estimation_method")
            state["perspective_notes"] = result.get("perspective_notes")
            state["reference_objects_used"] = result.get("reference_objects_used", [])
            state["total_height_visual_estimate"] = result.get("total_height_estimate_inches")
            state["uncertainty_range"] = result.get("uncertainty_range_inches", 5)
            
            duration = time.time() - start_time
            state = log_agent_action(
                state, agent_name, 
                f"Identified: {state['vehicle_type']}", 
                result, 
                duration
            )
            
        except Exception as e:
            state["errors"].append(f"Vision agent error: {str(e)}")
            state["vehicle_detected"] = False
            duration = time.time() - start_time
            state = log_agent_action(state, agent_name, f"Failed: {str(e)}", None, duration)
        
        return state
    
    @staticmethod
    def measurement_agent(state: AgentState) -> AgentState:
        """
        Agent 2: Measurement Calculation
        Calculates vehicle height based on vision analysis
        """
        start_time = time.time()
        agent_name = "MeasurementAgent"
        
        try:
            state = log_agent_action(state, agent_name, "Starting measurement calculation")
            
            if not state.get("vehicle_detected"):
                state["errors"].append("No vehicle detected - cannot measure")
                return state
            
            # First, look up base specs if known vehicle
            vehicle_type = state.get("vehicle_type", "")
            state = log_agent_action(state, agent_name, f"Looking up specs for: {vehicle_type}")
            
            vehicle_specs = tools.lookup_vehicle_specs(vehicle_type)
            
            # Call Nemotron for measurement reasoning
            prompt = f"""You are a vehicle measurement expert combining visual analysis with database knowledge.

VISUAL ANALYSIS FROM IMAGE:
- Base height estimate: {state.get('base_height_estimate', 'not available')} inches
- Total height visual estimate: {state.get('total_height_visual_estimate', 'not available')} inches
- Estimation method: {state.get('visual_estimation_method', 'not available')}
- Reference objects used: {state.get('reference_objects_used', [])}
- Uncertainty range: ±{state.get('uncertainty_range', 5)} inches
- Perspective notes: {state.get('perspective_notes', 'none')}

DATABASE LOOKUP:
- Vehicle type: {vehicle_type}
- Standard specs: {json.dumps(vehicle_specs, indent=2)}

DETECTED EQUIPMENT:
{json.dumps(state.get('visual_detections', []), indent=2)}

TASK:
Provide the MOST ACCURATE height estimate by combining visual analysis with database knowledge.

PRIORITIZATION:
1. If visual estimate used good reference objects (wheels, doors) → Trust visual estimate more
2. If make/model identified → Use database specs as baseline
3. Combine both sources with weighted confidence
4. Add equipment heights from visual detection

Return ONLY valid JSON:
{{
  "base_height_inches": number (your best estimate combining sources),
  "base_height_source": "visual/database/combined",
  "roof_equipment": [
    {{
      "item": "string",
      "height_added_inches": number (from visual or typical),
      "source": "visual_measurement/typical_value",
      "confidence": 0.0-1.0
    }}
  ],
  "total_height_inches": number (final best estimate),
  "uncertainty_inches": number (realistic uncertainty),
  "reasoning": "explain how you combined visual + database + equipment measurements"
}}"""
            
            message = client.chat.completions.create(
                model="nvidia/llama-3.1-nemotron-70b-instruct-v1",
                max_tokens=1500,
                messages=[{"role": "user", "content": prompt}]
            )
            
            response_text = message.choices[0].message.content
            if "```json" in response_text:
                json_str = response_text.split("```json")[1].split("```")[0].strip()
            else:
                json_str = response_text.strip()
            
            result = json.loads(json_str)
            
            # Update state
            state["base_height_inches"] = result.get("base_height_inches")
            state["roof_equipment"] = result.get("roof_equipment", [])
            state["total_height_inches"] = result.get("total_height_inches")
            state["measurement_uncertainty"] = result.get("uncertainty_inches", 3)
            state["measurement_reasoning"] = result.get("reasoning")
            
            duration = time.time() - start_time
            state = log_agent_action(
                state, agent_name,
                f"Calculated height: {state['total_height_inches']} inches",
                result,
                duration
            )
            
        except Exception as e:
            state["errors"].append(f"Measurement agent error: {str(e)}")
            duration = time.time() - start_time
            state = log_agent_action(state, agent_name, f"Failed: {str(e)}", None, duration)
        
        return state
    
    @staticmethod
    def location_agent(state: AgentState) -> AgentState:
        """
        Agent 3: Location Services
        Converts user location to coordinates
        """
        start_time = time.time()
        agent_name = "LocationAgent"
        
        try:
            state = log_agent_action(state, agent_name, "Resolving location")
            
            user_location = state.get("user_location")
            if not user_location:
                # Default to Boston for demo
                user_location = "Boston, MA"
                state["user_location"] = user_location
            
            state = log_agent_action(state, agent_name, f"Geocoding: {user_location}")
            
            # Call Mapbox Geocoding tool
            geocoding_result = tools.geocode_location(user_location)
            
            if geocoding_result.get("success"):
                state["location_coords"] = {
                    "latitude": geocoding_result["latitude"],
                    "longitude": geocoding_result["longitude"]
                }
                state["geocoding_result"] = geocoding_result
                state["location_reasoning"] = f"Resolved '{user_location}' to coordinates using Mapbox"
                
                duration = time.time() - start_time
                state = log_agent_action(
                    state, agent_name,
                    f"Location: ({geocoding_result['latitude']:.4f}, {geocoding_result['longitude']:.4f})",
                    geocoding_result,
                    duration
                )
            else:
                state["errors"].append(f"Location resolution failed: {geocoding_result.get('error')}")
                duration = time.time() - start_time
                state = log_agent_action(state, agent_name, "Failed to resolve location", None, duration)
            
        except Exception as e:
            state["errors"].append(f"Location agent error: {str(e)}")
            duration = time.time() - start_time
            state = log_agent_action(state, agent_name, f"Failed: {str(e)}", None, duration)
        
        return state
    
    @staticmethod
    def bridge_query_agent(state: AgentState) -> AgentState:
        """
        Agent 4: Bridge Database Query
        Finds bridges near user location
        """
        start_time = time.time()
        agent_name = "BridgeQueryAgent"
        
        try:
            state = log_agent_action(state, agent_name, "Querying bridge database")
            
            coords = state.get("location_coords")
            if not coords:
                state["errors"].append("No location coordinates - cannot query bridges")
                return state
            
            lat = coords["latitude"]
            lon = coords["longitude"]
            
            state = log_agent_action(state, agent_name, f"Searching bridges within 10km of location")
            
            # Call OSM Overpass tool
            bridge_result = tools.query_bridges_nearby(lat, lon, radius_km=10)
            
            if bridge_result.get("success"):
                state["nearby_bridges"] = bridge_result.get("bridges", [])
                state["bridge_count"] = bridge_result.get("bridges_found", 0)
                state["bridge_query_reasoning"] = f"Found {state['bridge_count']} bridges using OpenStreetMap"
                
                duration = time.time() - start_time
                state = log_agent_action(
                    state, agent_name,
                    f"Found {state['bridge_count']} bridges",
                    bridge_result,
                    duration
                )
            else:
                state["errors"].append(f"Bridge query failed: {bridge_result.get('error')}")
                state["nearby_bridges"] = []
                state["bridge_count"] = 0
                duration = time.time() - start_time
                state = log_agent_action(state, agent_name, "No bridges found", None, duration)
            
        except Exception as e:
            state["errors"].append(f"Bridge query agent error: {str(e)}")
            duration = time.time() - start_time
            state = log_agent_action(state, agent_name, f"Failed: {str(e)}", None, duration)
        
        return state
    
    @staticmethod
    def weather_agent(state: AgentState) -> AgentState:
        """
        Agent 5: Weather Check
        Gets weather conditions that might affect clearance
        """
        start_time = time.time()
        agent_name = "WeatherAgent"
        
        try:
            state = log_agent_action(state, agent_name, "Checking weather conditions")
            
            coords = state.get("location_coords")
            if not coords:
                # Skip weather check if no location
                return state
            
            lat = coords["latitude"]
            lon = coords["longitude"]
            
            # Call OpenWeather tool
            weather_result = tools.get_weather_conditions(lat, lon)
            
            if weather_result.get("success"):
                state["weather_conditions"] = weather_result
                state["clearance_adjustment"] = weather_result.get("clearance_impact_inches", 0)
                state["weather_warnings"] = weather_result.get("warnings", [])
                
                duration = time.time() - start_time
                state = log_agent_action(
                    state, agent_name,
                    f"Weather: {weather_result.get('condition')} ({weather_result.get('temperature')}°F)",
                    weather_result,
                    duration
                )
            else:
                duration = time.time() - start_time
                state = log_agent_action(state, agent_name, "Weather check failed", None, duration)
            
        except Exception as e:
            state["errors"].append(f"Weather agent error: {str(e)}")
            duration = time.time() - start_time
            state = log_agent_action(state, agent_name, f"Failed: {str(e)}", None, duration)
        
        return state
    
    @staticmethod
    def risk_assessment_agent(state: AgentState) -> AgentState:
        """
        Agent 6: Risk Assessment
        Analyzes which bridges are dangerous for this vehicle
        """
        start_time = time.time()
        agent_name = "RiskAssessmentAgent"
        
        try:
            state = log_agent_action(state, agent_name, "Assessing clearance risks")
            
            vehicle_height = state.get("total_height_inches")
            bridges = state.get("nearby_bridges", [])
            weather_impact = state.get("clearance_adjustment", 0)
            
            if not vehicle_height or not bridges:
                state["dangerous_bridges"] = []
                state["risk_level"] = "UNKNOWN"
                return state
            
            # Call Nemotron for risk reasoning
            prompt = f"""You are a bridge clearance safety expert.

VEHICLE:
- Height: {vehicle_height} inches ({vehicle_height/12:.1f} feet)
- Uncertainty: ±{state.get('measurement_uncertainty', 3)} inches
- Weather impact: {weather_impact} inches

NEARBY BRIDGES:
{json.dumps(bridges, indent=2)}

TASK:
Assess which bridges are dangerous for this vehicle.

Consider:
- Suspension compression (1-3 inches)
- Weather impact (already provided)
- Measurement uncertainty
- Margin of safety (need 6+ inches for "safe")

Return ONLY valid JSON:
{{
  "dangerous_bridges": [
    {{
      "bridge_name": "string",
      "clearance": "string from maxheight",
      "risk_level": "SAFE/CAUTION/DANGER/CRITICAL",
      "reasoning": "why this bridge is risky"
    }}
  ],
  "overall_risk": "SAFE/LOW/MEDIUM/HIGH/CRITICAL",
  "strike_probability": 0.0-1.0,
  "detailed_reasoning": "overall safety assessment"
}}"""
            
            message = client.chat.completions.create(
                model="nvidia/llama-3.1-nemotron-70b-instruct-v1",
                max_tokens=2000,
                messages=[{"role": "user", "content": prompt}]
            )
            
            response_text = message.choices[0].message.content
            if "```json" in response_text:
                json_str = response_text.split("```json")[1].split("```")[0].strip()
            else:
                json_str = response_text.strip()
            
            result = json.loads(json_str)
            
            # Update state
            state["dangerous_bridges"] = result.get("dangerous_bridges", [])
            state["risk_level"] = result.get("overall_risk", "UNKNOWN")
            state["strike_probability"] = result.get("strike_probability", 0.0)
            state["risk_reasoning"] = result.get("detailed_reasoning")
            
            duration = time.time() - start_time
            state = log_agent_action(
                state, agent_name,
                f"Risk: {state['risk_level']} ({len(state['dangerous_bridges'])} dangerous bridges)",
                result,
                duration
            )
            
        except Exception as e:
            state["errors"].append(f"Risk assessment agent error: {str(e)}")
            duration = time.time() - start_time
            state = log_agent_action(state, agent_name, f"Failed: {str(e)}", None, duration)
        
        return state
    
    @staticmethod
    def recommendation_agent(state: AgentState) -> AgentState:
        """
        Agent 7: Recommendations
        Generates final recommendations and report
        """
        start_time = time.time()
        agent_name = "RecommendationAgent"
        
        try:
            state = log_agent_action(state, agent_name, "Generating recommendations")
            
            # Call Nemotron to synthesize everything
            prompt = f"""You are a route safety advisor.

COMPLETE ANALYSIS:
{json.dumps({
    'vehicle': {
        'type': state.get('vehicle_type'),
        'height': state.get('total_height_inches'),
        'equipment': state.get('roof_equipment')
    },
    'location': state.get('geocoding_result', {}).get('place_name'),
    'bridges_found': state.get('bridge_count'),
    'dangerous_bridges': state.get('dangerous_bridges', []),
    'risk_level': state.get('risk_level'),
    'weather': state.get('weather_conditions', {}).get('condition')
}, indent=2)}

TASK:
Generate clear, actionable recommendations for the driver.

Return ONLY valid JSON:
{{
  "recommendations": [
    "specific action item 1",
    "specific action item 2"
  ],
  "safe_routes": ["route descriptions that are safe"],
  "avoid_routes": ["routes/areas to avoid"],
  "summary": "2-3 sentence summary of the situation"
}}"""
            
            message = client.chat.completions.create(
                model="nvidia/llama-3.1-nemotron-70b-instruct-v1",
                max_tokens=1500,
                messages=[{"role": "user", "content": prompt}]
            )
            
            response_text = message.choices[0].message.content
            if "```json" in response_text:
                json_str = response_text.split("```json")[1].split("```")[0].strip()
            else:
                json_str = response_text.strip()
            
            result = json.loads(json_str)
            
            # Update state
            state["recommendations"] = result.get("recommendations", [])
            state["safe_routes"] = result.get("safe_routes", [])
            state["avoid_routes"] = result.get("avoid_routes", [])
            state["final_report"] = result.get("summary")
            
            duration = time.time() - start_time
            state = log_agent_action(
                state, agent_name,
                "Recommendations generated",
                result,
                duration
            )
            
        except Exception as e:
            state["errors"].append(f"Recommendation agent error: {str(e)}")
            duration = time.time() - start_time
            state = log_agent_action(state, agent_name, f"Failed: {str(e)}", None, duration)
        
        return state