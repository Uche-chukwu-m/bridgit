from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import OpenAI
import base64
import os
from dotenv import load_dotenv
from typing import Optional, List, Dict
from agents.agent_graph import run_agent_workflow

load_dotenv()

app = FastAPI(title="BridgeGuardian API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Nemotron (via NVIDIA API using OpenAI-compatible client)
client = OpenAI(
    base_url="https://integrate.api.nvidia.com/v1",
    api_key=os.getenv("NVIDIA_API_KEY")  # You'll need to set this in your .env file
)

# Pydantic models
class RouteAnalysisRequest(BaseModel):
    vehicle_height_inches: int
    origin: str
    destination: str
    vehicle_description: Optional[str] = None

class AnalyzeVehicleResponse(BaseModel):
    success: bool
    agent_log: List[Dict]
    vehicle_analysis: Optional[Dict] = None
    measurements: Optional[Dict] = None
    location_data: Optional[Dict] = None
    bridge_data: Optional[Dict] = None
    weather_data: Optional[Dict] = None
    risk_assessment: Optional[Dict] = None
    recommendations: Optional[Dict] = None
    errors: Optional[List[str]] = None

class BridgeCheckRequest(BaseModel):
    vehicle_height_inches: int
    bridge_name: str
    bridge_clearance_inches: int
    vehicle_description: Optional[str] = None

# ============= NEMOTRON DOES EVERYTHING =============

def call_nemotron(prompt: str, image_base64: Optional[str] = None) -> str:
    """
    Single function to call Nemotron for ANY task
    Uses NVIDIA Llama Nemotron via OpenAI-compatible API
    """
    try:
        # Prepare messages for OpenAI format
        messages = []

        if image_base64:
            # For vision tasks with images
            messages.append({
                "role": "user",
                "content": [
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/jpeg;base64,{image_base64}"
                        }
                    },
                    {
                        "type": "text",
                        "text": prompt
                    }
                ]
            })
        else:
            # Text-only request
            messages.append({
                "role": "user",
                "content": prompt
            })

        # Call Nemotron using OpenAI-compatible API
        completion = client.chat.completions.create(
            model="meta/llama-3.1-70b-instruct",  # Meta Llama model (widely available)
            messages=messages,
            max_tokens=4000,
            temperature=0.7,
            top_p=1.0
        )

        return completion.choices[0].message.content

    except Exception as e:
        return f"Error: {str(e)}"

# ============= ENDPOINTS =============

@app.get("/")
def root():
    return {"status": "BridgeGuardian API running", "version": "1.0.0"}

@app.post("/analyze-vehicle", response_model=AnalyzeVehicleResponse)
async def analyze_vehicle(
    file: UploadFile = File(...),
    location: str = "Boston, MA"
):
    """
    Multi-Agent Vehicle Analysis
    
    This endpoint runs a sophisticated multi-agent workflow:
    1. Vision Agent - Identifies vehicle type
    2. Measurement Agent - Calculates height
    3. Location Agent - Geocodes location
    4. Bridge Query Agent - Finds nearby bridges
    5. Weather Agent - Checks conditions
    6. Risk Assessment Agent - Evaluates dangers
    7. Recommendation Agent - Generates advice
    """
    try:
        # Read and encode image
        contents = await file.read()
        image_base64 = base64.b64encode(contents).decode('utf-8')
        media_type = file.content_type or "image/jpeg"
        
        # Run agent workflow
        final_state = await run_agent_workflow(
            image_base64=image_base64,
            image_media_type=media_type,
            user_location=location
        )
        
        # Structure response
        response = {
            "success": len(final_state.get("errors", [])) == 0,
            "agent_log": final_state.get("agent_log", []),
            "vehicle_analysis": {
                "detected": final_state.get("vehicle_detected"),
                "type": final_state.get("vehicle_type"),
                "visual_detections": final_state.get("visual_detections"),
                "confidence": final_state.get("vision_confidence"),
                "reasoning": final_state.get("vision_reasoning")
            },
            "measurements": {
                "base_height_inches": final_state.get("base_height_inches"),
                "roof_equipment": final_state.get("roof_equipment"),
                "total_height_inches": final_state.get("total_height_inches"),
                "uncertainty_inches": final_state.get("measurement_uncertainty"),
                "reasoning": final_state.get("measurement_reasoning")
            },
            "location_data": {
                "coordinates": final_state.get("location_coords"),
                "geocoding_result": final_state.get("geocoding_result"),
                "reasoning": final_state.get("location_reasoning")
            },
            "bridge_data": {
                "nearby_bridges": final_state.get("nearby_bridges"),
                "count": final_state.get("bridge_count"),
                "reasoning": final_state.get("bridge_query_reasoning")
            },
            "weather_data": {
                "conditions": final_state.get("weather_conditions"),
                "clearance_adjustment": final_state.get("clearance_adjustment"),
                "warnings": final_state.get("weather_warnings")
            },
            "risk_assessment": {
                "dangerous_bridges": final_state.get("dangerous_bridges"),
                "risk_level": final_state.get("risk_level"),
                "strike_probability": final_state.get("strike_probability"),
                "reasoning": final_state.get("risk_reasoning")
            },
            "recommendations": {
                "recommendations": final_state.get("recommendations"),
                "safe_routes": final_state.get("safe_routes"),
                "avoid_routes": final_state.get("avoid_routes"),
                "summary": final_state.get("final_report")
            },
            "errors": final_state.get("errors", [])
        }
        
        return response
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze-bridge-sign")
async def analyze_bridge_sign(file: UploadFile = File(...)):
    """
    NEMOTRON: Read bridge clearance sign from photo
    """
    contents = await file.read()
    image_base64 = base64.b64encode(contents).decode('utf-8')
    
    prompt = """You are analyzing a bridge clearance sign photo.

TASKS:
1. Find and read ALL clearance signs
2. Identify clearance heights
3. Check for conditional information (by lane, by level, etc.)
4. Assess sign visibility and condition
5. Look for warning signs about height restrictions

RETURN JSON:
{
  "clearances_found": [
    {
      "clearance_inches": number,
      "clearance_display": "X'Y\\"",
      "applies_to": "all lanes / left lane / level 1-3 / etc",
      "sign_condition": "clear/faded/damaged/obscured",
      "confidence": number (0-1)
    }
  ],
  "minimum_clearance": number,
  "warnings": [
    "string - any warning signs visible"
  ],
  "sign_analysis": "detailed description of what you see",
  "concerns": ["any visibility or accuracy issues"]
}

Return ONLY JSON, no other text."""

    response = call_nemotron(prompt, image_base64)
    
    if "```json" in response:
        json_str = response.split("```json")[1].split("```")[0].strip()
    elif "```" in response:
        json_str = response.split("```")[1].split("```")[0].strip()
    else:
        json_str = response.strip()
    
    return {"analysis": json_str, "raw": response}

@app.post("/check-clearance")
def check_clearance(request: BridgeCheckRequest):
    """
    NEMOTRON: Analyze if vehicle will fit under specific bridge
    """
    
    prompt = f"""You are a bridge clearance safety expert.

SCENARIO:
- Vehicle height: {request.vehicle_height_inches}" ({request.vehicle_height_inches/12:.1f} feet)
- Vehicle description: {request.vehicle_description or "not provided"}
- Bridge: {request.bridge_name}
- Posted clearance: {request.bridge_clearance_inches}" ({request.bridge_clearance_inches/12:.1f} feet)

ANALYSIS REQUIRED:
1. Calculate clearance margins
2. Account for real-world factors:
   - Measurement uncertainty (±2-4")
   - Suspension compression (1-3" depending on road/load)
   - Tire pressure effects (0.5-1")
   - Road resurfacing reducing clearance (0-4")
   - Bridge settlement (0-3" for older bridges)
3. Assess risk level
4. Provide clear recommendation

RETURN JSON:
{{
  "will_fit": "yes/no/marginal",
  "margins": {{
    "nominal_inches": number,
    "worst_case_inches": number,
    "comfortable_clearance": boolean
  }},
  "risk_level": "SAFE/LOW/MEDIUM/HIGH/CRITICAL",
  "strike_probability": number (0-1),
  "grade": "A/B/C/D/F",
  "factors": {{
    "vehicle_uncertainty": "±X inches",
    "suspension_compression": "X inches",
    "effective_vehicle_height": number,
    "effective_bridge_clearance": number
  }},
  "recommendation": {{
    "action": "proceed/caution/avoid/stop",
    "explanation": "clear reasoning in 2-3 sentences",
    "alternative_action": "what to do instead"
  }},
  "warnings": [
    "string - specific concerns"
  ],
  "detailed_analysis": "comprehensive explanation for driver"
}}

BE CONSERVATIVE: Safety is paramount. When in doubt, recommend avoiding."""

    response = call_nemotron(prompt)
    
    if "```json" in response:
        json_str = response.split("```json")[1].split("```")[0].strip()
    elif "```" in response:
        json_str = response.split("```")[1].split("```")[0].strip()
    else:
        json_str = response.strip()
    
    return {"analysis": json_str, "raw": response}

@app.post("/plan-route")
def plan_route(request: RouteAnalysisRequest):
    """
    NEMOTRON: Plan complete route with safety analysis
    """
    
    prompt = f"""You are a route planning expert for tall vehicles.

REQUEST:
- Vehicle height: {request.vehicle_height_inches}" ({request.vehicle_height_inches/12:.1f} feet)
- Vehicle: {request.vehicle_description or "commercial truck"}
- From: {request.origin}
- To: {request.destination}

TASK: Create EXACTLY 3 route options with complete safety analysis

REQUIRED ROUTES:
1. Route A (SAFE): Grade A - Interstate highways only, all 14'+ clearances, ZERO dangerous bridges
2. Route C (MODERATE): Grade C - Mixed highways, some tight clearances (12'-13'), requires careful driving
3. Route F (DANGEROUS): Grade F - Includes 3+ problem bridges, very high strike risk, should be AVOIDED

Use your knowledge of major highways and known problem bridges:
- Storrow Drive, Boston: 10'6" (126") - NOTORIOUS, 150+ strikes
- 11 Foot 8 Bridge, Durham NC: 12'4" (148") - FAMOUS problem bridge
- BQE Brooklyn: Various low bridges 11'6"-12'0"
- Parkways in NY/NJ: Often 10'-11' clearances, trucks prohibited
- Most interstate highways: 14'-16' clearances (SAFE)

RETURN JSON:
{{
  "routes": [
    {{
      "name": "string (Route A: Safe Interstate Route)",
      "type": "interstate",
      "safety_grade": "A",
      "distance_miles": number,
      "duration_hours": number,
      "clearance_summary": "all safe clearances",
      "minimum_clearance": number (inches, should be 168+ for grade A),
      "bridges_analyzed": number,
      "risk_assessment": {{
        "overall_risk": "SAFE",
        "strike_probability": number (0-0.05 for grade A),
        "concerns": []
      }},
      "key_bridges": [
        {{
          "name": "string",
          "clearance_inches": number,
          "margin_inches": number,
          "risk": "SAFE"
        }}
      ],
      "recommendation": {{
        "recommended": true,
        "reasoning": "detailed explanation",
        "when_to_use": "Always - safest option"
      }},
      "turn_by_turn_warnings": []
    }},
    {{
      "name": "string (Route C: Shorter but Tighter)",
      "type": "mixed",
      "safety_grade": "C",
      "distance_miles": number (shorter than A),
      "duration_hours": number,
      "clearance_summary": "some tight clearances",
      "minimum_clearance": number (inches, 138-162 for grade C),
      "bridges_analyzed": number,
      "risk_assessment": {{
        "overall_risk": "MEDIUM",
        "strike_probability": number (0.25-0.45 for grade C),
        "concerns": ["list specific tight bridges"]
      }},
      "key_bridges": [
        {{
          "name": "string",
          "clearance_inches": number,
          "margin_inches": number,
          "risk": "CAUTION"
        }}
      ],
      "recommendation": {{
        "recommended": false,
        "reasoning": "detailed explanation",
        "when_to_use": "Only for experienced drivers in good conditions"
      }},
      "turn_by_turn_warnings": [
        "specific warnings for tight spots"
      ]
    }},
    {{
      "name": "string (Route F: AVOID - Dangerous Bridges)",
      "type": "prohibited",
      "safety_grade": "F",
      "distance_miles": number,
      "duration_hours": number,
      "clearance_summary": "DANGEROUS - multiple low bridges",
      "minimum_clearance": number (inches, <138 for grade F),
      "bridges_analyzed": number,
      "risk_assessment": {{
        "overall_risk": "CRITICAL",
        "strike_probability": number (0.85-0.99 for grade F),
        "concerns": ["list all dangerous bridges"]
      }},
      "key_bridges": [
        {{
          "name": "string (e.g., Storrow Drive)",
          "clearance_inches": number,
          "margin_inches": number (negative),
          "risk": "DANGER"
        }}
      ],
      "recommendation": {{
        "recommended": false,
        "reasoning": "DO NOT USE - explains why route is dangerous",
        "when_to_use": "NEVER for this vehicle height"
      }},
      "turn_by_turn_warnings": [
        "BLOCKED: specific dangerous bridges that will not fit"
      ]
    }}
  ],
  "overall_recommendation": {{
    "best_route": "Route A",
    "why": "explanation",
    "avoid_routes": ["Route F because it includes dangerous bridges"]
  }},
  "general_advice": [
    "Always use Route A for safety",
    "Route C requires extreme caution",
    "NEVER use Route F - guaranteed bridge strikes"
  ]
}}

CRITICAL: Return EXACTLY 3 routes in this order: A (safe), C (moderate), F (dangerous).
Base on real highway knowledge. Be specific about bridge locations."""

    response = call_nemotron(prompt)
    
    if "```json" in response:
        json_str = response.split("```json")[1].split("```")[0].strip()
    elif "```" in response:
        json_str = response.split("```")[1].split("```")[0].strip()
    else:
        json_str = response.strip()
    
    return {"analysis": json_str, "raw": response}

@app.post("/analyze-incident")
async def analyze_incident(
    file: UploadFile = File(...),
    vehicle_height: int = 0,
    bridge_clearance: int = 0
):
    """
    NEMOTRON: Analyze bridge strike incident from damage photo
    """
    contents = await file.read()
    image_base64 = base64.b64encode(contents).decode('utf-8')
    
    prompt = f"""You are analyzing a bridge strike incident photo.

CONTEXT:
- Reported vehicle height: {vehicle_height}" ({vehicle_height/12:.1f} feet)
- Reported bridge clearance: {bridge_clearance}" ({bridge_clearance/12:.1f} feet)

ANALYZE THE PHOTO:
1. Type and severity of damage visible
2. Point of impact (roof, cargo, equipment)
3. Whether strike was avoidable
4. Likely causes
5. Lessons learned

RETURN JSON:
{{
  "damage_assessment": {{
    "severity": "minor/moderate/severe/catastrophic",
    "damage_type": "scrape/dent/roof_peel/structural",
    "affected_areas": ["string"],
    "estimated_repair_cost": "range",
    "vehicle_likely_driveable": boolean
  }},
  "incident_analysis": {{
    "impact_point_inches": number (estimated height of impact),
    "actual_clearance_likely": number (inches),
    "measurement_discrepancy": "explanation if heights don't match damage",
    "contributing_factors": ["string"],
    "was_avoidable": boolean,
    "why_it_happened": "detailed explanation"
  }},
  "lessons_learned": [
    "string - what could have prevented this"
  ],
  "recommendations": {{
    "for_database": "how to update bridge data",
    "for_users": "warnings to give future users",
    "for_signage": "sign improvements needed"
  }},
  "visual_description": "what you see in the image"
}}

Be thorough - this data improves future safety."""

    response = call_nemotron(prompt, image_base64)
    
    if "```json" in response:
        json_str = response.split("```json")[1].split("```")[0].strip()
    elif "```" in response:
        json_str = response.split("```")[1].split("```")[0].strip()
    else:
        json_str = response.strip()
    
    return {"analysis": json_str, "raw": response}

# Run server
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)