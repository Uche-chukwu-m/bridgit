# BridgeGuardian 🌉

AI-powered vehicle measurement and route planning system to prevent bridge strikes. Uses computer vision and multi-agent AI to analyze vehicle height, find nearby bridges, and recommend safe routes.

---

## 🎯 Overview

BridgeGuardian prevents the **1,000+ yearly bridge strikes** that cause $300M+ in damage by:
1. **Measuring** vehicle height using AI vision analysis
2. **Finding** nearby low-clearance bridges 
3. **Planning** safe routes that avoid dangerous bridges
4. **Alerting** drivers in real-time about upcoming hazards

---

## 🏗️ Architecture & Data Flow

### High-Level Flow
```
User uploads vehicle photo → Frontend → Backend API → Multi-Agent System → Response
                                ↓
                          Computer Vision
                                ↓
                          Agent Workflow
                                ↓
                    7 Specialized AI Agents
```

---


## 📊 State Management

All agents share a common state object that flows through the workflow:

```python
AgentState = {
    # Input
    "image_base64": str,
    "user_location": str,
    
    # Agent 1: Vision
    "vehicle_detected": bool,
    "vehicle_type": str,
    "visual_detections": list,
    
    # Agent 2: Measurement
    "total_height_inches": int,
    "roof_equipment": list,
    
    # Agent 3: Location
    "location_coords": {"lat": float, "lon": float},
    
    # Agent 4: Bridges
    "nearby_bridges": list,
    "bridge_count": int,
    
    # Agent 5: Weather
    "weather_conditions": dict,
    "clearance_adjustment": int,
    
    # Agent 6: Risk
    "dangerous_bridges": list,
    "risk_level": str,
    
    # Agent 7: Recommendations
    "recommendations": list,
    "final_report": str,
    
    # Metadata
    "agent_log": list,
    "errors": list
}
```

---

## 🚀 Why NVIDIA Nemotron?

BridgeGuardian uses **NVIDIA's Llama 3.1 Nemotron 70B Instruct** as its core AI model for vision analysis and reasoning. Here's why we chose Nemotron over alternatives like GPT-4, Claude, or Gemini:

### 🎯 Key Advantages

#### 1. **Multimodal Vision + Reasoning**
- Single model handles both image analysis AND complex reasoning
- Analyzes vehicle photos to extract height measurements using visual reference objects
- Combines visual data with database knowledge for accurate estimates

#### 2. **Superior Structured Output**
- Consistently produces valid, well-formatted JSON (critical for agent workflows)
- Follows complex prompt instructions with high fidelity
- Minimal parsing errors compared to other models

#### 3. **Safety-Critical Performance**
- Conservative risk assessment aligns with bridge strike prevention mission
- Detailed reasoning traces for every decision (explainable AI)
- Uncertainty quantification built into outputs

### 🔍 Verification

For complete proof of NVIDIA Nemotron usage, see [NEMOTRON_VERIFICATION.md](NEMOTRON_VERIFICATION.md), which includes:
- API endpoint evidence
- Model identifier in code
- Sample API responses
- Network request verification
- Usage statistics
- Comparative analysis

---

## 🛠️ Technology Stack

### Frontend
- **React** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Axios** - HTTP client
- **Mapbox GL** - Map visualization

### Backend
- **FastAPI** - API framework
- **LangGraph** - Agent orchestration
- **OpenAI SDK** - NVIDIA Nemotron API client
- **Pydantic** - Data validation
- **python-dotenv** - Environment config

### AI & ML
- **NVIDIA Nemotron** - Vision & reasoning LLM
  - Model: `nvidia/llama-3.1-nemotron-70b-instruct`
  - Vision-capable for vehicle analysis
  - Reasoning for risk assessment

### External APIs
- **Mapbox Geocoding** - Location → GPS
- **OpenStreetMap Overpass** - Bridge database
- **OpenWeather** - Weather conditions

---

## 🚀 Getting Started

### Prerequisites
```bash
# Backend
- Python 3.12+
- NVIDIA API Key (from build.nvidia.com)

# Frontend
- Node.js 18+
- npm or yarn
```

### Installation

#### 1. Clone & Setup Environment
```bash
git clone <repo-url>
cd bridgeguardian

# Create Python virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install backend dependencies
cd backend
pip install -r requirements.txt
```

#### 2. Configure Environment Variables
```bash
# backend/.env
NVIDIA_API_KEY=your_nvidia_api_key_here
MAPBOX_API_KEY=your_mapbox_key  # Optional
OPENWEATHER_API_KEY=your_key    # Optional
```

#### 3. Install Frontend Dependencies
```bash
cd ../frontend
npm install
```
---

## 🎨 Features

### Current Features ✅
- ✅ AI-powered vehicle height measurement
- ✅ Multi-agent workflow orchestration
- ✅ Bridge database querying (OSM)
- ✅ Risk assessment & classification
- ✅ Route recommendations
- ✅ Real-time weather impact
- ✅ Interactive UI with map visualization
- ✅ Community for Data aggregation and feedback

### Planned Features 🚧
- 🚧 Live GPS tracking during route
- 🚧 Real-time alerts (escalating warnings)
- 🚧 Historical incident database
- 🚧 Mobile app (React Native)
- 🚧 Fleet management dashboard
- 🚧 Integration with trucking GPS systems

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 🙏 Acknowledgments

- **NVIDIA** - Nemotron AI platform
- **OpenStreetMap** - Bridge data
- **Mapbox** - Geocoding & mapping
- **LangGraph** - Agent orchestration framework

