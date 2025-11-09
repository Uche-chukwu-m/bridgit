import React, { useState } from 'react';
import { 
  Camera, 
  Ruler, 
  MapPin, 
  Building2, 
  CloudRain, 
  AlertTriangle, 
  Lightbulb,
  CheckCircle,
  Loader,
  XCircle,
  ChevronDown,
  ChevronRight,
  Info,
  Activity
} from 'lucide-react';

const AGENT_CONFIG = [
  {
    id: 'vision',
    name: 'Vision Agent',
    icon: Camera,
    description: 'Analyzing vehicle image',
    color: 'blue',
    dataKey: 'vehicle_analysis',
    expectedTasks: [
      'Loading image into neural network',
      'Detecting vehicle in frame',
      'Identifying vehicle type and class',
      'Scanning for roof equipment',
      'Analyzing visual features'
    ]
  },
  {
    id: 'measurement',
    name: 'Measurement Agent',
    icon: Ruler,
    description: 'Calculating vehicle height',
    color: 'purple',
    dataKey: 'measurements',
    expectedTasks: [
      'Calibrating image scale',
      'Measuring base vehicle height',
      'Detecting roof modifications',
      'Calculating total height',
      'Computing measurement uncertainty'
    ]
  },
  {
    id: 'location',
    name: 'Location Agent',
    icon: MapPin,
    description: 'Finding GPS coordinates',
    color: 'green',
    dataKey: 'location_data',
    expectedTasks: [
      'Extracting GPS metadata',
      'Geocoding coordinates',
      'Identifying city and state',
      'Finding nearby landmarks'
    ]
  },
  {
    id: 'bridge',
    name: 'Bridge Query Agent',
    icon: Building2,
    description: 'Searching nearby bridges',
    color: 'orange',
    dataKey: 'bridge_data',
    expectedTasks: [
      'Querying OpenStreetMap database',
      'Finding bridges within 50km radius',
      'Filtering by clearance data',
      'Calculating distances',
      'Ranking by danger level'
    ]
  },
  {
    id: 'weather',
    name: 'Weather Agent',
    icon: CloudRain,
    description: 'Checking weather conditions',
    color: 'cyan',
    dataKey: 'weather_data',
    expectedTasks: [
      'Fetching current weather data',
      'Analyzing temperature effects',
      'Checking for precipitation',
      'Calculating clearance adjustments'
    ]
  },
  {
    id: 'risk',
    name: 'Risk Assessment Agent',
    icon: AlertTriangle,
    description: 'Analyzing danger levels',
    color: 'red',
    dataKey: 'risk_assessment',
    expectedTasks: [
      'Analyzing vehicle-bridge clearance gaps',
      'Computing strike probabilities',
      'Evaluating route dangers',
      'Identifying critical risk factors',
      'Generating risk score'
    ]
  },
  {
    id: 'recommendation',
    name: 'Recommendation Agent',
    icon: Lightbulb,
    description: 'Generating final advice',
    color: 'yellow',
    dataKey: 'recommendations',
    expectedTasks: [
      'Synthesizing all agent data',
      'Generating safety recommendations',
      'Planning safe route alternatives',
      'Preparing final report'
    ]
  }
];

export default function AgentPipeline({ agentLog = [], analysisData = {}, isLoading = false }) {
  const [expandedAgents, setExpandedAgents] = useState(new Set());

  console.log('AgentPipeline rendered - Updated version with clickable dropdowns');

  const toggleAgent = (agentId) => {
    const newExpanded = new Set(expandedAgents);
    if (newExpanded.has(agentId)) {
      newExpanded.delete(agentId);
    } else {
      newExpanded.add(agentId);
    }
    setExpandedAgents(newExpanded);
  };

  const getAgentStatus = (agentConfig) => {
    const logEntry = agentLog.find(log => 
      log.agent?.toLowerCase().includes(agentConfig.id) ||
      log.agent?.toLowerCase().includes(agentConfig.name.toLowerCase())
    );

    if (logEntry) {
      if (logEntry.status === 'success' || logEntry.success) {
        return { status: 'completed', logEntry };
      } else if (logEntry.status === 'error' || logEntry.error) {
        return { status: 'error', logEntry };
      } else if (logEntry.status === 'loading') {
        return { status: 'loading', logEntry };
      }
    }

    // Check if we have data for this agent
    const hasData = analysisData[agentConfig.dataKey] && 
                    Object.keys(analysisData[agentConfig.dataKey]).length > 0;
    
    if (hasData) return { status: 'completed', logEntry: null };
    if (isLoading) return { status: 'loading', logEntry: null };
    return { status: 'pending', logEntry: null };
  };

  const currentAgentIndex = agentLog.length > 0 ? Math.min(agentLog.length, AGENT_CONFIG.length - 1) : -1;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center">
          <Info className="w-5 h-5 mr-2 text-blue-600" />
          AI Agent Pipeline
        </h3>
        <p className="text-sm text-gray-600">
          7 specialized agents working together to analyze your vehicle
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
          <span>Overall Progress</span>
          <span className="font-semibold">
            {agentLog.filter(log => log.status === 'success' || log.success).length} / {AGENT_CONFIG.length}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-500"
            style={{ 
              width: `${(agentLog.filter(log => log.status === 'success' || log.success).length / AGENT_CONFIG.length) * 100}%` 
            }}
          />
        </div>
      </div>

      {/* Agent Steps */}
      <div className="space-y-3">
        {AGENT_CONFIG.map((agent, index) => {
          const { status, logEntry } = getAgentStatus(agent);
          const isExpanded = expandedAgents.has(agent.id);
          const Icon = agent.icon;
          const hasData = analysisData[agent.dataKey];

          return (
            <AgentStep
              key={agent.id}
              agent={agent}
              status={status}
              logEntry={logEntry}
              isExpanded={isExpanded}
              onToggle={() => toggleAgent(agent.id)}
              data={hasData}
              Icon={Icon}
              isActive={currentAgentIndex === index && status === 'loading'}
            />
          );
        })}
      </div>
    </div>
  );
}

function AgentStep({ agent, status, logEntry, isExpanded, onToggle, data, Icon, isActive }) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    orange: 'bg-orange-50 text-orange-600 border-orange-200',
    cyan: 'bg-cyan-50 text-cyan-600 border-cyan-200',
    red: 'bg-red-50 text-red-600 border-red-200',
    yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200'
  };

  const statusIcons = {
    pending: <div className="w-6 h-6 rounded-full border-2 border-gray-300 bg-white" />,
    loading: <Loader className="w-6 h-6 text-blue-600 animate-spin" />,
    completed: <CheckCircle className="w-6 h-6 text-green-600" />,
    error: <XCircle className="w-6 h-6 text-red-600" />
  };

  const statusText = {
    pending: 'Waiting',
    loading: 'Processing...',
    completed: 'Complete',
    error: 'Failed'
  };

  // Calculate task progress if agent is running
  const taskProgress = logEntry?.tasks?.length || 0;
  const totalTasks = logEntry?.currentTaskIndex >= 0 ? Math.max(5, taskProgress + 1) : 5;
  const taskProgressPercent = status === 'loading' && logEntry?.currentTaskIndex >= 0
    ? ((logEntry.currentTaskIndex + 1) / totalTasks) * 100
    : status === 'completed' ? 100 : 0;

  return (
    <div 
      className={`rounded-lg border-2 transition-all duration-300 ${
        isActive ? 'ring-4 ring-blue-300 ring-opacity-50 shadow-lg scale-[1.02]' : ''
      } ${
        status === 'completed' ? 'border-green-300 bg-green-50' :
        status === 'error' ? 'border-red-300 bg-red-50' :
        status === 'loading' ? 'border-blue-300 bg-blue-50 shadow-md' :
        'border-gray-200 bg-gray-50'
      }`}
    >
      {/* Header */}
      <div 
        className="p-4 cursor-pointer hover:bg-opacity-80 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1">
            {/* Status Icon */}
            <div className="flex-shrink-0">
              {statusIcons[status]}
            </div>

            {/* Agent Icon & Info */}
            <div className={`p-2 rounded-lg ${colorClasses[agent.color]} ${isActive ? 'animate-pulse' : ''}`}>
              <Icon className="w-5 h-5" />
            </div>

            <div className="flex-1">
              <h4 className="font-semibold text-gray-900">{agent.name}</h4>
              <p className="text-sm text-gray-600">{agent.description}</p>
              
              {/* Show current task if loading */}
              {status === 'loading' && logEntry?.currentTask && (
                <p className="text-xs text-blue-600 mt-1 flex items-center animate-pulse">
                  <ChevronRight className="w-3 h-3 mr-1" />
                  {logEntry.currentTask}
                </p>
              )}
              
              {/* Show completion time if completed */}
              {status === 'completed' && logEntry?.timestamp && (
                <p className="text-xs text-green-600 mt-1">
                  ✓ Completed at {new Date(logEntry.timestamp).toLocaleTimeString()}
                </p>
              )}
            </div>

            {/* Status Badge */}
            <div className="flex items-center space-x-2">
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                status === 'completed' ? 'bg-green-100 text-green-800' :
                status === 'error' ? 'bg-red-100 text-red-800' :
                status === 'loading' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-600'
              }`}>
                {statusText[status]}
              </span>

              <button className="text-gray-400 hover:text-gray-600 transition-colors">
                {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
        
        {/* Task Progress Bar (only show when loading) */}
        {status === 'loading' && taskProgressPercent > 0 && (
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
              <span>Task Progress</span>
              <span>{Math.round(taskProgressPercent)}%</span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${taskProgressPercent}%` }}
              >
                <div className="h-full bg-white/30 animate-pulse" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="border-t border-gray-200 p-4 bg-white">
          {/* Show expected tasks for pending agents */}
          {status === 'pending' && (
            <div className="mb-4">
              <h5 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                <Info className="w-4 h-4 mr-2 text-gray-500" />
                Planned Tasks
              </h5>
              <ul className="space-y-2">
                {agent.expectedTasks.map((task, idx) => (
                  <li key={idx} className="text-sm text-gray-500 flex items-start pl-2">
                    <div className="w-4 h-4 rounded-full border-2 border-gray-300 bg-white mr-3 mt-0.5 flex-shrink-0" />
                    {task}
                  </li>
                ))}
              </ul>
              <p className="text-xs text-gray-400 mt-3 italic">
                This agent will execute these tasks when the pipeline starts
              </p>
            </div>
          )}
          
          {/* Show task progress if loading */}
          {status === 'loading' && (
            <div className="mb-4">
              <h5 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                <Activity className="w-4 h-4 mr-2 text-blue-500 animate-pulse" />
                Tasks in Progress
              </h5>
              <ul className="space-y-2">
                {agent.expectedTasks.map((task, idx) => {
                  const isCompleted = logEntry?.tasks && idx < logEntry.currentTaskIndex;
                  const isCurrent = idx === logEntry?.currentTaskIndex;
                  const isPending = idx > (logEntry?.currentTaskIndex ?? -1);
                  
                  return (
                    <li key={idx} className={`text-sm flex items-start pl-2 ${
                      isCompleted ? 'text-green-600' :
                      isCurrent ? 'text-blue-600 font-medium' :
                      'text-gray-400'
                    }`}>
                      {isCompleted && (
                        <CheckCircle className="w-4 h-4 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      )}
                      {isCurrent && (
                        <Loader className="w-4 h-4 text-blue-500 mr-3 mt-0.5 flex-shrink-0 animate-spin" />
                      )}
                      {isPending && (
                        <div className="w-4 h-4 rounded-full border-2 border-gray-300 bg-white mr-3 mt-0.5 flex-shrink-0" />
                      )}
                      {task}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
          
          {/* Show completed tasks if finished */}
          {status === 'completed' && !data && (
            <div className="mb-4">
              <h5 className="text-sm font-semibold text-green-700 mb-3 flex items-center">
                <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                Completed Tasks
              </h5>
              <ul className="space-y-2">
                {agent.expectedTasks.map((task, idx) => (
                  <li key={idx} className="text-sm text-green-600 flex items-start pl-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    {task}
                  </li>
                ))}
              </ul>
              <p className="text-xs text-green-600 mt-3 flex items-center">
                <CheckCircle className="w-3 h-3 mr-1" />
                All tasks completed successfully
              </p>
            </div>
          )}
          
          {/* Show data if available */}
          {data && (
            <>
              <div className="mb-4">
                <h5 className="text-sm font-semibold text-green-700 mb-3 flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                  Completed Tasks
                </h5>
                <ul className="space-y-2">
                  {agent.expectedTasks.map((task, idx) => (
                    <li key={idx} className="text-sm text-green-600 flex items-start pl-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      {task}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="border-t border-gray-200 pt-4 mt-4">
                <h5 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <Info className="w-4 h-4 mr-2 text-blue-500" />
                  Analysis Results
                </h5>
                <AgentDetails agentId={agent.id} data={data} />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function AgentDetails({ agentId, data }) {
  const renderData = () => {
    switch (agentId) {
      case 'vision':
        return (
          <div className="space-y-2">
            <DetailRow label="Vehicle Detected" value={data.detected ? 'Yes' : 'No'} />
            <DetailRow label="Vehicle Type" value={data.type} />
            <DetailRow label="Confidence" value={data.confidence ? `${(data.confidence * 100).toFixed(0)}%` : 'N/A'} />
            {data.visual_detections && data.visual_detections.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Detected Items:</p>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                  {data.visual_detections.map((item, idx) => (
                    <li key={idx}>{item.item || item} {item.confidence && `(${(item.confidence * 100).toFixed(0)}%)`}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );

      case 'measurement':
        return (
          <div className="space-y-2">
            <DetailRow label="Base Height" value={data.base_height_inches ? `${data.base_height_inches}" (${Math.floor(data.base_height_inches/12)}'${data.base_height_inches%12}")` : 'N/A'} />
            <DetailRow label="Total Height" value={data.total_height_inches ? `${data.total_height_inches}" (${Math.floor(data.total_height_inches/12)}'${data.total_height_inches%12}")` : 'N/A'} />
            <DetailRow label="Uncertainty" value={data.uncertainty_inches ? `±${data.uncertainty_inches}"` : 'N/A'} />
            {data.roof_equipment && data.roof_equipment.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Roof Equipment:</p>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                  {data.roof_equipment.map((item, idx) => (
                    <li key={idx}>{item.item || item} {item.height_added_inches && `(+${item.height_added_inches}")`}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );

      case 'location':
        return (
          <div className="space-y-2">
            <DetailRow 
              label="Coordinates" 
              value={data.coordinates ? `${data.coordinates.lat?.toFixed(4)}, ${data.coordinates.lon?.toFixed(4)}` : 'N/A'} 
            />
            <DetailRow label="Location" value={data.geocoding_result?.place_name || 'N/A'} />
          </div>
        );

      case 'bridge':
        return (
          <div className="space-y-2">
            <DetailRow label="Bridges Found" value={data.count || data.nearby_bridges?.length || 0} />
            {data.nearby_bridges && data.nearby_bridges.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Nearby Bridges:</p>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                  {data.nearby_bridges.slice(0, 3).map((bridge, idx) => (
                    <li key={idx}>
                      {bridge.name || 'Bridge'} - Clearance: {bridge.maxheight || 'Unknown'}
                    </li>
                  ))}
                  {data.nearby_bridges.length > 3 && (
                    <li className="text-gray-500">...and {data.nearby_bridges.length - 3} more</li>
                  )}
                </ul>
              </div>
            )}
          </div>
        );

      case 'weather':
        return (
          <div className="space-y-2">
            <DetailRow label="Condition" value={data.conditions?.condition || 'N/A'} />
            <DetailRow label="Temperature" value={data.conditions?.temperature ? `${data.conditions.temperature}°F` : 'N/A'} />
            <DetailRow label="Clearance Impact" value={data.clearance_adjustment ? `${data.clearance_adjustment}"` : '0"'} />
            {data.warnings && data.warnings.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Warnings:</p>
                <ul className="list-disc list-inside text-sm text-orange-600 space-y-1">
                  {data.warnings.map((warning, idx) => (
                    <li key={idx}>{warning}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );

      case 'risk':
        return (
          <div className="space-y-2">
            <DetailRow 
              label="Risk Level" 
              value={data.risk_level} 
              valueClass={
                data.risk_level === 'CRITICAL' ? 'text-red-600 font-bold' :
                data.risk_level === 'HIGH' ? 'text-orange-600 font-semibold' :
                data.risk_level === 'MEDIUM' ? 'text-yellow-600' :
                'text-green-600'
              }
            />
            <DetailRow 
              label="Strike Probability" 
              value={data.strike_probability ? `${(data.strike_probability * 100).toFixed(0)}%` : 'N/A'} 
            />
            <DetailRow label="Dangerous Bridges" value={data.dangerous_bridges?.length || 0} />
            {data.dangerous_bridges && data.dangerous_bridges.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">⚠️ Critical Bridges:</p>
                <ul className="list-disc list-inside text-sm text-red-600 space-y-1">
                  {data.dangerous_bridges.map((bridge, idx) => (
                    <li key={idx}>
                      {bridge.bridge_name} - {bridge.clearance} ({bridge.risk_level})
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );

      case 'recommendation':
        return (
          <div className="space-y-2">
            {data.recommendations && data.recommendations.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">📋 Recommendations:</p>
                <ul className="space-y-2">
                  {data.recommendations.map((rec, idx) => (
                    <li key={idx} className="text-sm bg-blue-50 p-2 rounded border-l-4 border-blue-500">
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {data.safe_routes && data.safe_routes.length > 0 && (
              <div className="mt-3">
                <p className="text-sm font-medium text-green-700 mb-1">✅ Safe Routes:</p>
                <ul className="list-disc list-inside text-sm text-green-600 space-y-1">
                  {data.safe_routes.map((route, idx) => (
                    <li key={idx}>{route}</li>
                  ))}
                </ul>
              </div>
            )}
            {data.avoid_routes && data.avoid_routes.length > 0 && (
              <div className="mt-3">
                <p className="text-sm font-medium text-red-700 mb-1">🚫 Avoid:</p>
                <ul className="list-disc list-inside text-sm text-red-600 space-y-1">
                  {data.avoid_routes.map((route, idx) => (
                    <li key={idx}>{route}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );

      default:
        return <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">{JSON.stringify(data, null, 2)}</pre>;
    }
  };

  return (
    <div className="text-sm">
      {renderData()}
    </div>
  );
}

function DetailRow({ label, value, valueClass = 'text-gray-900' }) {
  return (
    <div className="flex justify-between items-start">
      <span className="text-gray-600 font-medium">{label}:</span>
      <span className={`ml-2 text-right ${valueClass}`}>{value || 'N/A'}</span>
    </div>
  );
}
