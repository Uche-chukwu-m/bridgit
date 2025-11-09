import React, { useState, useEffect } from 'react';
import { Brain, Zap, Activity, ChevronRight, Upload, Camera } from 'lucide-react';
import AgentPipeline from '../components/AgentPipeline';
import { analyzeVehicleImage } from '../services/api';

export default function AgentAnalysisPage() {
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [agentProgress, setAgentProgress] = useState([]);
  const [currentAgentIndex, setCurrentAgentIndex] = useState(-1);
  const [expandedOverviewAgents, setExpandedOverviewAgents] = useState(new Set());

  const AGENT_CONFIGS = [
    {
      name: 'Vision Agent',
      duration: 2500,
      tasks: [
        'Loading image into neural network...',
        'Detecting vehicle in frame...',
        'Identifying vehicle type and class...',
        'Scanning for roof equipment...',
        'Analyzing visual features...'
      ]
    },
    {
      name: 'Measurement Agent',
      duration: 2000,
      tasks: [
        'Calibrating image scale...',
        'Measuring base vehicle height...',
        'Detecting roof modifications...',
        'Calculating total height...',
        'Computing measurement uncertainty...'
      ]
    },
    {
      name: 'Location Agent',
      duration: 1500,
      tasks: [
        'Extracting GPS metadata...',
        'Geocoding coordinates...',
        'Identifying city and state...',
        'Finding nearby landmarks...'
      ]
    },
    {
      name: 'Bridge Query Agent',
      duration: 3000,
      tasks: [
        'Querying OpenStreetMap database...',
        'Finding bridges within 50km radius...',
        'Filtering by clearance data...',
        'Calculating distances...',
        'Ranking by danger level...'
      ]
    },
    {
      name: 'Weather Agent',
      duration: 1200,
      tasks: [
        'Fetching current weather data...',
        'Analyzing temperature effects...',
        'Checking for precipitation...',
        'Calculating clearance adjustments...'
      ]
    },
    {
      name: 'Risk Assessment Agent',
      duration: 2200,
      tasks: [
        'Analyzing vehicle-bridge clearance gaps...',
        'Computing strike probabilities...',
        'Evaluating route dangers...',
        'Identifying critical risk factors...',
        'Generating risk score...'
      ]
    },
    {
      name: 'Recommendation Agent',
      duration: 1800,
      tasks: [
        'Synthesizing all agent data...',
        'Generating safety recommendations...',
        'Planning safe route alternatives...',
        'Preparing final report...'
      ]
    }
  ];

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    console.log('File selected:', file);
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setError(null);
      setResult(null);
      setAgentProgress([]);
      setCurrentAgentIndex(-1);
      console.log('Image preview created, state reset');
    }
  };

  const simulateAgentProgress = async () => {
    setAgentProgress([]);
    setCurrentAgentIndex(0);
    
    // Simulate each agent completing with task-level updates
    for (let i = 0; i < AGENT_CONFIGS.length; i++) {
      setCurrentAgentIndex(i);
      const agent = AGENT_CONFIGS[i];
      
      // Add starting log
      setAgentProgress(prev => [...prev, {
        agent: agent.name,
        status: 'loading',
        message: `Starting ${agent.name}...`,
        timestamp: new Date().toISOString(),
        tasks: [],
        currentTaskIndex: -1
      }]);
      
      // Simulate tasks within the agent
      const taskDuration = agent.duration / agent.tasks.length;
      for (let taskIdx = 0; taskIdx < agent.tasks.length; taskIdx++) {
        // Update current task
        setAgentProgress(prev => {
          const updated = [...prev];
          const agentLogIndex = updated.findLastIndex(log => log.agent === agent.name);
          if (agentLogIndex !== -1) {
            updated[agentLogIndex] = {
              ...updated[agentLogIndex],
              currentTask: agent.tasks[taskIdx],
              currentTaskIndex: taskIdx,
              tasks: agent.tasks.slice(0, taskIdx + 1)
            };
          }
          return updated;
        });
        
        // Wait for task duration
        await new Promise(resolve => setTimeout(resolve, taskDuration));
      }
      
      // Mark agent as complete
      setAgentProgress(prev => {
        const updated = [...prev];
        const lastIndex = updated.findLastIndex(log => log.agent === agent.name);
        if (lastIndex !== -1) {
          updated[lastIndex] = {
            ...updated[lastIndex],
            status: 'success',
            success: true,
            message: `${agent.name} completed successfully`,
            timestamp: new Date().toISOString(),
            currentTask: null,
            completedTasks: agent.tasks.length
          };
        }
        return updated;
      });
    }
    
    setCurrentAgentIndex(-1);
    console.log('✅ Simulated progress completed');
  };

  const handleAnalyze = async () => {
    if (!imageFile) {
      console.error('No image file selected');
      setError('Please select an image first');
      return;
    }
    
    console.log('Starting analysis with file:', imageFile.name);
    setAnalyzing(true);
    setError(null);
    setResult(null);
    
    try {
      // Start simulated progress in background (don't await)
      console.log('Starting simulated progress...');
      const progressPromise = simulateAgentProgress();
      
      // Call actual API
      console.log('Calling API endpoint /analyze-vehicle...');
      const response = await analyzeVehicleImage(imageFile);
      console.log('✅ Agent Analysis Response:', response);
      
      // Wait for progress simulation to complete before showing results
      await progressPromise;
      
      console.log('Analysis complete, setting result');
      setResult(response);
      
      // Add success notification to progress
      setAgentProgress(prev => [...prev, {
        agent: 'System',
        status: 'success',
        success: true,
        message: '✅ All agents completed successfully! Analysis ready.',
        timestamp: new Date().toISOString()
      }]);
      
    } catch (err) {
      console.error('❌ Analysis error details:', err);
      console.error('Error response:', err.response);
      console.error('Error message:', err.message);
      
      let errorMessage = 'Failed to analyze image. ';
      
      if (err.response) {
        // Server responded with error
        errorMessage += `Server error: ${err.response.status} - ${err.response.data?.detail || err.response.statusText}`;
        console.error('Server response data:', err.response.data);
      } else if (err.request) {
        // Request made but no response
        errorMessage += 'No response from server. Make sure the backend is running at http://localhost:8000';
        console.error('Check if backend server is running: http://localhost:8000');
      } else {
        // Something else happened
        errorMessage += err.message;
      }
      
      setError(errorMessage);
      setAgentProgress(prev => [...prev, {
        agent: 'System',
        status: 'error',
        error: true,
        message: '❌ Analysis failed: ' + err.message,
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setAnalyzing(false);
      console.log('Analysis process completed (success or failure)');
    }
  };

  const toggleOverviewAgent = (index) => {
    const newExpanded = new Set(expandedOverviewAgents);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedOverviewAgents(newExpanded);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-3 rounded-xl mr-4">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              AI Agent Pipeline
            </h1>
            <p className="text-lg text-gray-600">
              Watch our 7-agent system analyze vehicles in real-time
            </p>
          </div>
        </div>

        {/* Agent Overview */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200 p-6 mb-8">
          <h2 className="text-lg font-bold text-purple-900 mb-3 flex items-center">
            <Activity className="w-5 h-5 mr-2" />
            How It Works
          </h2>
          <p className="text-sm text-purple-800 mb-4">
            Our multi-agent system processes your vehicle through a sophisticated pipeline:
          </p>
          
          {/* Agent badges in horizontal grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {AGENT_CONFIGS.map((agent, index) => (
              <AgentBadge 
                key={index}
                number={index + 1} 
                name={agent.name} 
                description={agent.tasks[0].replace('...', '')}
                tasks={agent.tasks}
                isExpanded={expandedOverviewAgents.has(index)}
                onToggle={() => toggleOverviewAgent(index)}
              />
            ))}
            
            <div className="sm:col-span-2 lg:col-span-1 p-3 bg-white rounded-lg border border-purple-200 flex items-center justify-center">
              <p className="text-xs text-gray-600 text-center">
                <Zap className="w-4 h-4 inline mr-1 text-yellow-500" />
                Each agent runs independently
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Upload Section */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-8">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center">
              <Upload className="w-5 h-5 mr-2 text-blue-600" />
              Upload Vehicle Image
            </h3>

            {!imagePreview ? (
              <label className="block cursor-pointer">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
                  <Camera className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p className="text-sm text-gray-600 mb-2">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">
                    PNG, JPG up to 10MB
                  </p>
                </div>
                <input
                  ref={React.createRef()}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>
            ) : (
              <div>
                <div className="relative mb-4">
                  <img
                    src={imagePreview}
                    alt="Vehicle preview"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => {
                      setImagePreview(null);
                      setImageFile(null);
                      setResult(null);
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <button
                  onClick={() => {
                    console.log('=== BUTTON CLICKED ===');
                    console.log('Image file:', imageFile);
                    console.log('Analyzing state:', analyzing);
                    if (!imageFile) {
                      console.error('ERROR: No image file!');
                      alert('No image file selected!');
                      return;
                    }
                    if (analyzing) {
                      console.warn('Already analyzing, skipping...');
                      return;
                    }
                    console.log('Calling handleAnalyze...');
                    handleAnalyze();
                  }}
                  disabled={analyzing}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {analyzing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Brain className="w-5 h-5 mr-2" />
                      Start Agent Pipeline
                    </>
                  )}
                </button>
              </div>
            )}

            {error && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Right: Agent Pipeline */}
        <div className="lg:col-span-2">
          {!result && !analyzing && agentProgress.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <Brain className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Upload an image to begin
              </h3>
              <p className="text-gray-600">
                Watch as our AI agents analyze your vehicle step by step
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Real-time Progress Bar */}
              {analyzing && (
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200 p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-purple-900 flex items-center">
                      <Activity className="w-5 h-5 mr-2 animate-pulse" />
                      Pipeline in Progress
                    </h3>
                    <span className="text-sm font-semibold text-purple-700">
                      {agentProgress.filter(a => a.success).length} / {AGENT_CONFIGS.length}
                    </span>
                  </div>
                  
                  {/* Animated Progress Bar */}
                  <div className="relative w-full bg-purple-200 rounded-full h-4 overflow-hidden">
                    <div 
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-600 to-pink-600 transition-all duration-500 ease-out"
                      style={{ 
                        width: `${(agentProgress.filter(a => a.success).length / AGENT_CONFIGS.length) * 100}%` 
                      }}
                    >
                      <div className="absolute inset-0 bg-white/30 animate-pulse" />
                    </div>
                  </div>
                  
                  {currentAgentIndex >= 0 && (
                    <div className="mt-3">
                      <p className="text-sm text-purple-700 flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600 mr-2" />
                        Currently running: <span className="font-semibold ml-1">{AGENT_CONFIGS[currentAgentIndex].name}</span>
                      </p>
                      {agentProgress[currentAgentIndex]?.currentTask && (
                        <p className="text-xs text-purple-600 mt-2 ml-6 animate-pulse flex items-center">
                          <ChevronRight className="w-3 h-3 mr-1" />
                          {agentProgress[currentAgentIndex].currentTask}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
              
              {/* Agent Pipeline Component */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <Activity className="w-6 h-6 mr-2 text-purple-600" />
                  Agent Execution Log
                </h3>
                <AgentPipeline 
                  agentLog={analyzing ? agentProgress : (result?.agent_log || [])} 
                  analysisData={result} 
                  isLoading={analyzing} 
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AgentBadge({ number, name, description, tasks = [], isExpanded = false, onToggle }) {
  return (
    <div className="bg-white rounded-lg border-2 border-purple-200 overflow-hidden transition-all hover:shadow-md">
      <div 
        className="flex items-start p-2 cursor-pointer hover:bg-purple-50 transition-colors"
        onClick={onToggle}
      >
        <div className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-2 flex-shrink-0">
          {number}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-purple-900 text-xs">{name}</p>
          <p className="text-purple-700 text-xs">{description}</p>
        </div>
        <ChevronRight 
          className={`w-4 h-4 text-purple-600 flex-shrink-0 transition-transform ${isExpanded ? 'rotate-90' : ''}`} 
        />
      </div>
      
      {/* Expandable task list */}
      {isExpanded && tasks.length > 0 && (
        <div className="border-t border-purple-200 bg-purple-50 p-3">
          <p className="text-xs font-semibold text-purple-900 mb-2">Tasks:</p>
          <ul className="space-y-1">
            {tasks.map((task, idx) => (
              <li key={idx} className="text-xs text-purple-700 flex items-start">
                <span className="text-purple-400 mr-2">•</span>
                {task}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
