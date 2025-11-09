# Bridgit - Devpost Submission

## Inspiration
In high school, I witnessed the most traumatic event of my life. Coming back from school, a fuel tanker speeding at around 60 mph slammed into a bridge that was too low for it. For a second, it felt like a movie—then a blinding flash. The tanker exploded. Lives were lost. That moment made me realize how a simple lack of awareness about vehicle height and bridge clearance could turn an ordinary trip into a tragedy.

That experience haunted me for years. I learned that bridge strikes happen far more often than people think—thousands of times per year in the US alone, causing millions in damage, traffic disruptions, and sometimes catastrophic accidents. The problem isn't just inexperienced drivers; it's that most people driving rental trucks, RVs, or commercial vehicles simply don't know their exact height, especially after adding roof equipment like AC units, antennas, or ladder racks.

Bridgit was born from a simple question: **What if we could prevent these tragedies using AI?**

## What it does
Bridgit is a comprehensive AI-powered safety platform that prevents bridge strikes through three core features:

### 1. **AI Vehicle Height Measurement**
- Users upload a photo of their vehicle (rental truck, RV, delivery van, etc.)
- Our **7-agent multi-agent system** analyzes the image:
  - **Vision Agent**: Identifies vehicle type and detects roof equipment
  - **Measurement Agent**: Calculates precise height using computer vision
  - **Location Agent**: Determines where the photo was taken
  - **Bridge Query Agent**: Searches nearby bridge database
  - **Weather Agent**: Checks current conditions that affect clearance
  - **Risk Assessment Agent**: Evaluates danger level for local bridges
  - **Recommendation Agent**: Provides actionable safety guidance
- Returns exact height including often-forgotten additions (AC units add 6-10 inches, antennas 4-6 inches)
- Shows visual breakdown with confidence scores

### 2. **Intelligent Route Planning**
- Enter your origin, destination, and vehicle height
- AI analyzes your route for low bridge hazards
- Returns:
  - Safe routes with bridge clearances
  - Risk levels (SAFE, LOW, MEDIUM, HIGH, CRITICAL)
  - Specific bridges to avoid
  - Alternative routes if needed
  - Distance, duration, and safety grades
- Real-time "Start This Route" navigation with live monitoring

### 3. **Bridge Strike Prevention System**
- Live monitoring page tracks your location as you drive
- Escalating warning system:
  - **5 miles out**: Yellow alert notification
  - **1 mile out**: Orange warning with bridge details
  - **500 feet**: Red critical alert to stop
- Shows exact clearance, your vehicle height, and safety margin
- Incident reporting for near-misses or actual strikes

### 4. **Vehicle Library**
- Pre-configured profiles for common vehicles (U-Haul 10'/15'/20', Penske trucks, RVs)
- Interactive portfolio system to customize roof equipment
- Real-time height calculation as you toggle modifications
- Instant safety warnings for high-risk configurations

## How we built it

### **Technology Stack**
- **Frontend**: React 18.2 + Vite 5.0 + Tailwind CSS 3.3
  - Modern, responsive UI with component-based architecture
  - React Router for seamless navigation
  - Axios for API communication
  - Lucide React for beautiful, consistent icons

- **Backend**: FastAPI + Python 3.12
  - High-performance async API endpoints
  - RESTful architecture for scalability
  - CORS middleware for cross-origin requests
  - Multipart file upload handling for images

- **AI/ML Core**: LangGraph 1.0.2 Multi-Agent System
  - 7 specialized AI agents working in sequence
  - State management for agent communication
  - Meta Llama 3.1 70B Instruct via NVIDIA API
  - OpenAI SDK for NVIDIA API compatibility

- **External Integrations**:
  - **NVIDIA AI**: Meta Llama 3.1 70B for vision analysis and route planning
  - **OpenStreetMap Overpass API**: Bridge database queries
  - **Mapbox Geocoding API**: Location detection and reverse geocoding
  - **OpenWeather API**: Real-time weather data for clearance adjustments

### **Architecture**
```
User Upload → FastAPI Endpoint → LangGraph Workflow → 7-Agent Pipeline → Response
```

Each agent processes the previous agent's output, building a comprehensive analysis:
1. Vision Agent analyzes the image for vehicle type and roof items
2. Measurement Agent calculates heights using detected objects
3. Location Agent determines GPS coordinates or nearest city
4. Bridge Query Agent searches OSM for nearby low bridges
5. Weather Agent checks conditions (rain/snow can reduce clearance)
6. Risk Assessment Agent evaluates danger based on all data
7. Recommendation Agent provides specific guidance

### **Development Process**
1. **Research Phase**: Studied bridge strike statistics, rental truck heights, and common causes
2. **Design Phase**: Created user flows for photo upload, route planning, and monitoring
3. **Backend First**: Built the 7-agent system with LangGraph, tested each agent individually
4. **Frontend Integration**: Created React components matching the agent pipeline
5. **Iteration**: Added vehicle library, route planning, and real-time monitoring based on user needs
6. **Polish**: Agent Pipeline UI visualization, portfolio modals, responsive design

## Challenges We Ran Into

### 1. **AI Model Availability**
- **Problem**: Initially used `nvidia/llama-3.1-nemotron-70b-instruct`, but it wasn't available in our NVIDIA account, causing 404 errors
- **Solution**: Switched to `meta/llama-3.1-70b-instruct`, a widely-available model that worked perfectly
- **Lesson**: Always verify model availability before building dependencies

### 2. **Multi-Agent State Management**
- **Problem**: Getting 7 agents to communicate their results to each other sequentially was complex
- **Solution**: Used LangGraph's state management to create a shared context that each agent could read from and write to
- **Lesson**: LangGraph excels at orchestrating complex multi-agent workflows

### 3. **Computer Vision Height Measurement**
- **Problem**: Accurately measuring vehicle height from a single photo without known reference points
- **Solution**: 
  - Used license plates as scale references (standard 6" × 12")
  - Instructed users to stand at specific distances
  - Provided confidence scores rather than claiming perfect accuracy
- **Lesson**: Set realistic expectations and communicate uncertainty to users

### 4. **Bridge Database Accuracy**
- **Problem**: OpenStreetMap data isn't always complete or accurate for bridge clearances
- **Solution**:
  - Cross-referenced multiple data sources
  - Added user incident reporting to crowdsource corrections
  - Displayed confidence levels for each bridge clearance
- **Lesson**: Real-world data is messy; build systems that acknowledge and handle uncertainty

### 5. **AI Response Parsing**
- **Problem**: AI sometimes returned responses wrapped in markdown code blocks (```json...```), causing parsing errors
- **Solution**: Added preprocessing to strip markdown formatting before JSON parsing
- **Lesson**: Always sanitize AI outputs before using them in production code

### 6. **Route Matching Flexibility**
- **Problem**: Route planner only worked for exact city pair matches (boston-nyc but not nyc-boston)
- **Solution**: Implemented bidirectional matching—try forward, then reverse, then fallback
- **Lesson**: Users don't think in database keys; build flexible matching

### 7. **Data Structure Mismatches**
- **Problem**: AI returned fields like `distance_miles` and `duration_hours`, but frontend expected `distance` and `duration`
- **Solution**: Added transformation layer to map AI response to frontend format
- **Lesson**: Always have a contract/schema between AI and UI, with adapters for mismatches

## Accomplishments We're Proud Of

### 1. **The 7-Agent Pipeline**
Building a working multi-agent system where each agent has a specific expertise and they all work together seamlessly. The Vision Agent detects objects, Measurement calculates heights, Location finds where you are, Bridge Query searches databases, Weather checks conditions, Risk assesses danger, and Recommendation provides guidance. It's like having a team of experts analyzing every aspect of bridge strike risk.

### 2. **Real-Time Agent Pipeline Visualization**
Creating the `AgentPipeline` component that shows users exactly what each AI agent is doing in real-time. Users can watch the progress bar fill up (5/7 agents completed), see which agent is currently working (with a loading spinner), and click to expand any agent to see its detailed findings. This transparency builds trust in the AI system.

### 3. **Interactive Vehicle Portfolio System**
The vehicle library with interactive portfolios where users can select a vehicle type (U-Haul 15', Class A RV, etc.) and toggle roof equipment modifications. As they check/uncheck AC units, antennas, and other items, the total height updates in real-time. It's educational and practical.

### 4. **Intelligent Route Planning**
The AI doesn't just find low bridges on your route—it evaluates the entire journey, assigns risk levels, calculates safety grades, and recommends alternatives. The "Start This Route" button passes all data to a live monitoring page for real-time tracking.

### 5. **User Experience Design**
From the homepage's embedded bridge strike video to the feet/inches height input (13'6" instead of just 162 inches), every detail was designed for real-world truck drivers, RV owners, and rental customers who aren't height experts.

### 6. **Comprehensive Documentation**
The README.md with architecture diagrams, complete agent workflow explanations, API endpoint documentation, and setup instructions. Future developers (or hackathon judges!) can understand the entire system at a glance.

### 7. **Handling Real-World Complexity**
- Same-city validation (preventing boston→boston routes)
- Bidirectional route matching
- AI response sanitization
- Error handling with helpful messages
- Confidence scores for uncertain measurements
- Weather-based clearance adjustments

### 8. **Preventing Actual Tragedies**
Building something that could genuinely save lives. Every bridge strike prevented is a person who gets home safely, a family that doesn't lose a loved one, a community that doesn't experience trauma. That's what drives us.

## What We Learned

### **Technical Learnings**

1. **Multi-Agent Systems are Powerful but Complex**
   - LangGraph makes orchestration manageable
   - Each agent needs a clear, focused responsibility
   - State management is critical for agent communication
   - Sequential pipelines work better than parallel for dependent tasks

2. **AI is a Tool, Not a Magic Solution**
   - Computer vision can't perfectly measure height from one photo
   - Bridge databases have gaps and errors
   - Users need to understand confidence levels and limitations
   - Combine AI with traditional data sources for best results

3. **Frontend-Backend Contracts Matter**
   - Define data schemas early
   - Build transformation layers for mismatches
   - Validate responses before rendering
   - Handle errors gracefully with user-friendly messages

4. **Real-World Data is Messy**
   - OpenStreetMap has incomplete bridge data
   - Some bridges aren't in any database
   - Weather affects clearance (snow accumulation, road flooding)
   - User-reported incidents help fill gaps

5. **User Experience Drives Adoption**
   - Truckers think in feet/inches, not total inches
   - City dropdowns are easier than typing city names
   - Visual feedback (progress bars, agent status) builds trust
   - Warnings must be clear and actionable

### **Problem-Solving Learnings**

1. **Break Down Complex Problems**
   - "Prevent bridge strikes" → Measure vehicle → Find bridges → Plan routes → Monitor trips
   - Each piece is solvable individually
   - Integration comes after individual pieces work

2. **Iterate Based on Reality**
   - Started with simple route matching, added bidirectional after testing
   - Added vehicle library when photo uploads seemed intimidating
   - Created agent pipeline visualization when users asked "what's happening?"

3. **Embrace Uncertainty**
   - Show confidence scores
   - Explain AI limitations
   - Provide ranges instead of exact numbers
   - Let users make informed decisions

### **Domain Learnings**

1. **Bridge Strikes are Preventable**
   - 90%+ are caused by driver error (not equipment failure)
   - Most drivers don't know their vehicle height
   - Roof equipment is often forgotten (AC units, antennas)
   - GPS systems don't account for height restrictions

2. **The Human Factor**
   - Rental truck customers get minimal training
   - RV owners add equipment without recalculating height
   - Delivery drivers rush and ignore signs
   - Fatigue and stress reduce awareness

3. **Regulations Vary**
   - Different states have different height limits (13'6" common, but varies)
   - Some cities ban tall trucks on certain roads (Storrow Drive in Boston)
   - Bridges built decades ago weren't designed for modern vehicles

### **Personal Learnings**

1. **Technology Can Honor Tragedy**
   - My high school experience motivated this project
   - Building tools that prevent future tragedies is meaningful work
   - Code can save lives

2. **Hackathons Force Prioritization**
   - Can't build everything—focus on core value
   - MVP first, polish later
   - Working demo beats perfect documentation

3. **Collaboration Amplifies Impact**
   - LangGraph community examples helped debug agents
   - NVIDIA API documentation enabled quick integration
   - Open source tools (React, FastAPI, OSM) made this possible

4. **Users Don't Read Instructions**
   - Design must be intuitive
   - Errors must be self-explanatory
   - Warnings must be impossible to miss

---

## The Impact We Hope to Have

Every year, thousands of bridge strikes occur in the US alone. Each one risks lives, causes massive traffic disruptions, costs tens of thousands in repairs, and traumatizes communities. Bridgit aims to prevent these tragedies by making bridge clearance awareness effortless.

We envision:
- **Rental companies** integrating Bridgit into checkout processes
- **GPS apps** adopting height-aware routing
- **Fleet managers** using our API to protect drivers
- **Individual drivers** checking their height before every trip
- **Fewer families** experiencing the trauma I witnessed

Because no one should die because of a number they didn't know.

---

*Built with ❤️ and AI to prevent tragedies, one route at a time.*
