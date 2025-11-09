import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Play, Pause, RotateCcw, Navigation, AlertTriangle, Clock, Gauge } from 'lucide-react';
import RouteMap from '../components/RouteMap';
import { useGPSSimulation } from '../hooks/useGPSSimulation';
import { useAlertLevel } from '../hooks/useAlertLevel';
import { mockBridges } from '../data/mockBridges';
import { getDangerousRoute, getSafeRoute, getModerateRoute } from '../utils/mapboxDirections';

export default function LiveMonitoringPage() {
  const location = useLocation();
  const routeFromPlanner = location.state?.route; // Route selected from planner
  const vehicleHeightFromPlanner = location.state?.vehicleHeight || 162; // Default 13'6"
  
  // Demo route will be fetched from Mapbox
  const [demoRoute, setDemoRoute] = useState(null);
  const [isLoadingRoute, setIsLoadingRoute] = useState(true);

  // Fetch real road route on mount
  useEffect(() => {
    async function fetchRoute() {
      setIsLoadingRoute(true);
      console.log('Fetching route from Mapbox...');
      console.log('Route from planner:', routeFromPlanner);
      
      // Choose route fetching function based on safety grade
      let route;
      if (routeFromPlanner?.safetyGrade === 'A') {
        console.log('Fetching SAFE route (Grade A)');
        route = await getSafeRoute('boston', 'new york');
      } else if (routeFromPlanner?.safetyGrade === 'C') {
        console.log('Fetching MODERATE route (Grade C)');
        route = await getModerateRoute('boston', 'new york');
      } else if (routeFromPlanner?.safetyGrade === 'F') {
        console.log('Fetching DANGEROUS route (Grade F)');
        route = await getDangerousRoute('boston', 'new york');
      } else {
        // Default to dangerous route for demo
        console.log('Fetching default dangerous route');
        route = await getDangerousRoute('boston', 'new york');
      }
      
      console.log('Mapbox route received:', route);
      
      if (route) {
        const routeData = {
          name: routeFromPlanner?.name || 'Boston to NYC (Demo)',
          coordinates: route.coordinates, // Real road coordinates from Mapbox!
          distance: route.distanceMiles,
          duration: route.durationMinutes
        };
        console.log('Setting route with', route.coordinates.length, 'coordinates');
        setDemoRoute(routeData);
      } else {
        // Fallback to straight line if API fails
        console.warn('Mapbox API failed, using fallback route');
        setDemoRoute({
          name: routeFromPlanner?.name || 'Boston to NYC (Demo)',
          coordinates: [
            [-71.0589, 42.3601], // Boston
            [-74.0060, 40.7128]  // NYC
          ]
        });
      }
      setIsLoadingRoute(false);
    }
    
    fetchRoute();
  }, [routeFromPlanner]);

  const vehicleHeight = vehicleHeightFromPlanner;
  
  const [isSimulating, setIsSimulating] = useState(false);
  const [speed, setSpeed] = useState(60); // mph
  const [showSettings, setShowSettings] = useState(false);

  // GPS Simulation
  const { currentPosition, distanceTraveled, elapsedTime, reset } = useGPSSimulation(
    demoRoute,
    isSimulating,
    speed
  );

  // Get bridges from the selected route, or use dangerous ones for demo
  const routeBridges = routeFromPlanner?.bridges 
    ? routeFromPlanner.bridges.map(bridge => {
        // Find matching bridge in mockBridges for full details
        const fullBridge = mockBridges.find(b => b.id === bridge.id);
        if (fullBridge) {
          return {
            ...fullBridge,
            lat: fullBridge.latitude,
            lon: fullBridge.longitude,
            clearance: fullBridge.clearanceInches || fullBridge.clearance,
            clearanceFeet: fullBridge.clearanceFeet,
            riskLevel: (fullBridge.clearanceInches || fullBridge.clearance) - vehicleHeight < 0 ? 'CRITICAL' :
                       (fullBridge.clearanceInches || fullBridge.clearance) - vehicleHeight < 6 ? 'DANGER' : 'SAFE'
          };
        }
        // If not found in mockBridges, create a safe placeholder
        return {
          id: bridge.id,
          name: bridge.name || bridge.id,
          latitude: 42.0 + Math.random(), // Approximate position
          longitude: -72.0 + Math.random(),
          lat: 42.0 + Math.random(),
          lon: -72.0 + Math.random(),
          clearance: bridge.clearance,
          clearanceFeet: `${Math.floor(bridge.clearance / 12)}'${bridge.clearance % 12}"`,
          riskLevel: bridge.clearance - vehicleHeight < 0 ? 'CRITICAL' :
                     bridge.clearance - vehicleHeight < 6 ? 'DANGER' : 'SAFE'
        };
      })
    : // Fallback to dangerous bridges for demo
      mockBridges
        .filter(b => 
          b.id.startsWith('bridge_002') || // Storrow and Memorial Drive (near start)
          b.id.startsWith('bridge_003') || // BQE (near end)
          b.id.startsWith('bridge_004')    // Tobin (safe option)
        )
        .map(bridge => ({
          ...bridge,
          lat: bridge.latitude,
          lon: bridge.longitude,
          clearance: bridge.clearanceInches || bridge.clearance,
          clearanceFeet: bridge.clearanceFeet,
          riskLevel: (bridge.clearanceInches || bridge.clearance) - vehicleHeight < 0 ? 'CRITICAL' :
                     (bridge.clearanceInches || bridge.clearance) - vehicleHeight < 6 ? 'DANGER' : 'SAFE'
        }));

  // Calculate alert level
  const alertState = useAlertLevel(currentPosition, routeBridges, vehicleHeight);

  // Debug logging
  useEffect(() => {
    if (currentPosition && routeBridges.length > 0) {
      console.log('Alert State:', alertState.level, alertState.message);
      if (alertState.closestBridge) {
        console.log('Closest dangerous bridge:', alertState.closestBridge.name, 
                    'Distance:', alertState.distanceToClosest?.toFixed(3), 'miles');
      }
    }
  }, [alertState, currentPosition]);

  // Sound alert on critical/emergency
  useEffect(() => {
    if (alertState.level === 'critical' || alertState.level === 'emergency') {
      playAlertSound(alertState.level);
    }
  }, [alertState.level]);

  const handleStartStop = () => {
    setIsSimulating(!isSimulating);
  };

  const handleReset = () => {
    setIsSimulating(false);
    reset();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Live Route Monitoring
        </h1>
        <p className="text-lg text-gray-600">
          Real-time GPS tracking with escalating bridge warnings
        </p>
      </div>

      {/* Loading State */}
      {isLoadingRoute ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading route from Mapbox Directions API...</p>
        </div>
      ) : (
        <>
          {/* Alert Banner (Full Width) */}
          {alertState.level !== 'none' && (
            <AlertBannerLarge alertState={alertState} vehicleHeight={vehicleHeight} />
          )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Map (2/3 width) */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Map Container */}
            <div style={{ height: '600px' }}>
              <RouteMap
                route={demoRoute}
                currentPosition={currentPosition}
                upcomingBridges={routeBridges}
                alertLevel={alertState.level}
              />
            </div>

            {/* Controls */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                {/* Playback Controls */}
                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleStartStop}
                    className={`p-3 rounded-lg font-medium transition-colors ${
                      isSimulating
                        ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    {isSimulating ? (
                      <><Pause className="w-5 h-5 inline mr-2" />Pause</>
                    ) : (
                      <><Play className="w-5 h-5 inline mr-2" />Start Simulation</>
                    )}
                  </button>

                  <button
                    onClick={handleReset}
                    className="p-3 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
                  >
                    <RotateCcw className="w-5 h-5" />
                  </button>
                </div>

                {/* Speed Control */}
                <div className="flex items-center space-x-3">
                  <Gauge className="w-5 h-5 text-gray-600" />
                  <select
                    value={speed}
                    onChange={(e) => setSpeed(parseInt(e.target.value))}
                    className="px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value={30}>30 mph (Slow)</option>
                    <option value={45}>45 mph (Medium)</option>
                    <option value={60}>60 mph (Normal)</option>
                    <option value={120}>120 mph (Fast Demo)</option>
                    <option value={600}>600 mph (Ludicrous Speed! 🚀)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Stats & Bridges (1/3 width) */}
        <div className="space-y-6">
          {/* Trip Stats */}
          <TripStats
            distanceTraveled={distanceTraveled}
            elapsedTime={elapsedTime}
            speed={speed}
            isActive={isSimulating}
          />

          {/* Vehicle Info */}
          <VehicleInfoCard vehicleHeight={vehicleHeight} />

          {/* Upcoming Bridges */}
          <UpcomingBridgesCard
            bridges={routeBridges}
            currentPosition={currentPosition}
            vehicleHeight={vehicleHeight}
          />
        </div>
      </div>

      {/* Demo Instructions */}
      <DemoInstructions />
        </>
      )}
    </div>
  );
}

// Alert Banner Component (Full Width, Dramatic)
function AlertBannerLarge({ alertState, vehicleHeight }) {
  const configs = {
    info: {
      bg: 'bg-blue-500',
      border: 'border-blue-600',
      icon: '📍'
    },
    warning: {
      bg: 'bg-yellow-500',
      border: 'border-yellow-600',
      icon: '⚠️'
    },
    critical: {
      bg: 'bg-red-500 animate-pulse',
      border: 'border-red-700',
      icon: '🚨'
    },
    emergency: {
      bg: 'bg-red-700 animate-pulse',
      border: 'border-red-900',
      icon: '🛑'
    }
  };

  const config = configs[alertState.level];
  const bridge = alertState.closestBridge;

  return (
    <div className={`${config.bg} border-4 ${config.border} rounded-xl p-6 mb-6 text-white shadow-2xl`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <span className="text-4xl">{config.icon}</span>
            <h2 className="text-2xl font-bold">{alertState.message}</h2>
          </div>
          
          {bridge && (
            <div className="mt-4 space-y-2">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="opacity-90">Bridge:</div>
                  <div className="font-bold text-lg">{bridge.name}</div>
                </div>
                <div>
                  <div className="opacity-90">Clearance:</div>
                  <div className="font-bold text-lg">{bridge.clearanceFeet}</div>
                </div>
                <div>
                  <div className="opacity-90">Your Vehicle:</div>
                  <div className="font-bold text-lg">{Math.floor(vehicleHeight/12)}'{vehicleHeight%12}"</div>
                </div>
                <div>
                  <div className="opacity-90">Margin:</div>
                  <div className="font-bold text-lg">
                    {bridge.clearance - vehicleHeight > 0 
                      ? `${bridge.clearance - vehicleHeight}"`
                      : `${Math.abs(bridge.clearance - vehicleHeight)}" TOO TALL!`
                    }
                  </div>
                </div>
              </div>

              {bridge.clearance - vehicleHeight < 0 && (
                <div className="bg-white text-red-900 p-4 rounded-lg font-bold text-center mt-4">
                  ⛔ YOU WILL NOT FIT UNDER THIS BRIDGE! STOP NOW!
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Trip Stats Card
function TripStats({ distanceTraveled, elapsedTime, speed, isActive }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="font-bold text-gray-900 mb-4 flex items-center">
        <Navigation className="w-5 h-5 mr-2 text-blue-600" />
        Trip Statistics
      </h3>

      <div className="space-y-4">
        <StatRow
          label="Distance Traveled"
          value={`${distanceTraveled.toFixed(2)} mi`}
          icon="🛣️"
        />
        <StatRow
          label="Time Elapsed"
          value={formatTime(elapsedTime)}
          icon="⏱️"
        />
        <StatRow
          label="Current Speed"
          value={isActive ? `${speed} mph` : '0 mph'}
          icon="🚗"
        />
      </div>

      {/* Progress Bar */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Progress</span>
          <span>{((distanceTraveled / 215) * 100).toFixed(0)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${Math.min((distanceTraveled / 215) * 100, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function StatRow({ label, value, icon }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-gray-600 text-sm flex items-center">
        <span className="mr-2">{icon}</span>
        {label}
      </span>
      <span className="font-bold text-gray-900">{value}</span>
    </div>
  );
}

// Vehicle Info Card
function VehicleInfoCard({ vehicleHeight }) {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border-2 border-blue-300 p-6">
      <h3 className="font-bold text-blue-900 mb-3">Your Vehicle</h3>
      <div className="text-center">
        <div className="text-center">
          <div className="text-5xl font-bold text-blue-900 mb-2">
            {Math.floor(vehicleHeight/12)}'{vehicleHeight%12}"
          </div>
          <div className="text-sm text-blue-700 mb-4">
            Total Height: {vehicleHeight} inches
          </div>
          <div className="bg-white rounded-lg p-3 text-sm text-left space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-600">Base Height:</span>
              <span className="font-bold">12'6"</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Roof AC:</span>
              <span className="font-bold text-orange-600">+8"</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Antenna:</span>
              <span className="font-bold text-orange-600">+4"</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Upcoming Bridges Card
function UpcomingBridgesCard({ bridges, currentPosition, vehicleHeight }) {
  if (!currentPosition) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="font-bold text-gray-900 mb-4">Upcoming Bridges</h3>
        <p className="text-gray-500 text-sm">Start simulation to see bridges</p>
      </div>
    );
  }

  // Calculate distances and sort by closest
  const bridgesWithDistance = bridges.map(bridge => {
    const distance = calculateDistance(
      currentPosition.lat,
      currentPosition.lon,
      bridge.lat,
      bridge.lon
    );
    return { ...bridge, distanceMiles: distance };
  }).sort((a, b) => a.distanceMiles - b.distanceMiles);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="font-bold text-gray-900 mb-4 flex items-center">
        <AlertTriangle className="w-5 h-5 mr-2 text-orange-600" />
        Upcoming Bridges
      </h3>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {bridgesWithDistance.slice(0, 5).map((bridge, idx) => (
          <BridgeListItem
            key={bridge.id}
            bridge={bridge}
            vehicleHeight={vehicleHeight}
            rank={idx + 1}
          />
        ))}
      </div>
    </div>
  );
}

function BridgeListItem({ bridge, vehicleHeight, rank }) {
  const margin = bridge.clearance - vehicleHeight;
  
  let statusClass = 'bg-gray-100 text-gray-800 border-gray-300';
  let statusText = 'Unknown';
  let statusIcon = '📍';

  if (margin < 0) {
    statusClass = 'bg-red-100 text-red-900 border-red-300';
    statusText = 'WILL NOT FIT';
    statusIcon = '🚫';
  } else if (margin < 4) {
    statusClass = 'bg-orange-100 text-orange-900 border-orange-300';
    statusText = 'VERY TIGHT';
    statusIcon = '⚠️';
  } else if (margin < 6) {
    statusClass = 'bg-yellow-100 text-yellow-900 border-yellow-300';
    statusText = 'TIGHT';
    statusIcon = '⚠️';
  } else {
    statusClass = 'bg-green-100 text-green-900 border-green-300';
    statusText = 'SAFE';
    statusIcon = '✅';
  }

  return (
    <div className={`${statusClass} border-2 rounded-lg p-3`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-lg">{statusIcon}</span>
            <span className="text-xs font-bold bg-white px-2 py-0.5 rounded">
              #{rank}
            </span>
          </div>
          <h4 className="font-bold text-sm">{bridge.name}</h4>
        </div>
        <div className="text-right">
          <div className="text-xs opacity-75">Distance</div>
          <div className="font-bold">{bridge.distanceMiles.toFixed(2)} mi</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <span className="opacity-75">Clearance:</span>
          <span className="font-bold ml-1">{bridge.clearanceFeet}</span>
        </div>
        <div>
          <span className="opacity-75">Margin:</span>
          <span className="font-bold ml-1">
            {margin > 0 ? `${margin}"` : `${Math.abs(margin)}" TOO TALL`}
          </span>
        </div>
      </div>

      <div className="mt-2 text-xs font-bold text-center px-2 py-1 bg-white rounded">
        {statusText}
      </div>
    </div>
  );
}

// Demo Instructions
function DemoInstructions() {
  return (
    <div className="mt-8 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200 p-6">
      <h3 className="text-lg font-bold text-purple-900 mb-3">
        🎬 Demo Instructions
      </h3>
      <div className="space-y-2 text-sm text-purple-800">
        <p>
          <strong>1. Click "Start Simulation"</strong> to begin GPS tracking from Boston
        </p>
        <p>
          <strong>2. Watch the blue vehicle marker</strong> move along the real road route
        </p>
        <p>
          <strong>3. Observe escalating alerts</strong> as you approach dangerous bridges:
        </p>
        <ul className="ml-6 space-y-1">
          <li>• 📍 <strong>Memorial Drive Underpass (11'0")</strong> - Just 3 miles from start!</li>
          <li>• 🚨 <strong>Storrow Drive (10'6")</strong> - The infamous can opener</li>
          <li>• ⚠️ <strong>BQE Brooklyn (11'6")</strong> - Near destination</li>
        </ul>
        <p className="mt-3">
          <strong>Alert Escalation:</strong>
        </p>
        <ul className="ml-6 space-y-1">
          <li>• 📍 <strong>2 miles:</strong> Info banner (blue)</li>
          <li>• ⚠️ <strong>1 mile:</strong> Warning banner (yellow)</li>
          <li>• 🚨 <strong>0.25 miles:</strong> Critical alert (red, pulsing)</li>
          <li>• 🛑 <strong>0.1 miles:</strong> Emergency stop (red, loud alarm)</li>
        </ul>
        <p className="mt-3">
          <strong>4. Speed up simulation</strong> using speed dropdown (try 600 mph for instant demo!)
        </p>
        <p>
          <strong>5. Click bridge markers</strong> on the map for details
        </p>
        <p className="mt-3 text-xs text-purple-700">
          💡 Your vehicle is 13'6" tall - you will NOT FIT under Memorial Drive (11'0") or Storrow (10'6")!
        </p>
      </div>
    </div>
  );
}

// Utility Functions
function formatTime(seconds) {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hrs > 0) {
    return `${hrs}h ${mins}m ${secs}s`;
  } else if (mins > 0) {
    return `${mins}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
}

function calculateDistance(lat1, lon1, lat2, lon2) {
  // Haversine formula
  const R = 3959; // Earth's radius in miles
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function toRad(degrees) {
  return degrees * (Math.PI / 180);
}

function playAlertSound(level) {
  // Browser alert sound (can be enhanced with actual audio files)
  if (level === 'emergency') {
    // Play multiple beeps for emergency
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        const beep = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHmm98OScTgwOUKzn77BnHwU7k9n0yXcsBS16zPLaizsIHGS57OihUBELTKXh8bllHgU2jdT0zo80ByJ0yO/aiDcIF2K55u2kUhEMTKjh8bllHgU2jdX0zow1ByF0yO/aiDcIF2O55u2kUhEMTKjh8rpmIAU4jtX00I42ByJ0x+/aiDgIF2O45O2lUxINTKjh8rpmIAU4jtX00Y42BiBuy/LaiDgIF2S45O2lUxINTKjh8rpmIAU4jtb00Y42BiBuy/LaiDgIF2S45O2lUxINTKjh8rpmIAU4jtb00I42BiBuxe7aiDgIF2W55O2mUxINTKjh8bhlHwU5j9f0z482BiFvxu/ZiDcIF2a55u2mUhEMTKrh8rllHgY5j9f0zY01BiB2xO/ZhzcIG2e76OykUBEMTKvh8rdlHgY5j9f0zY01BiB2w+/YhzcIG2i76OylTxAMTKzh8rVmHwU6kNj0zI41BiB2we/YhjcIG2m86OykTxAMTq3h8LRmHwU6kNn0y4w0BiFzxO7Yhjc');
        beep.play().catch(() => {});
      }, i * 200);
    }
  } else if (level === 'critical') {
    const beep = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHmm98OScTgwOUKzn77BnHwU7k9n0yXcsBS16zPLaizsIHGS57OihUBELTKXh8bllHgU2jdT0zo80ByJ0yO/aiDcIF2K55u2kUhEMTKjh8bllHgU2jdX0zow1ByF0yO/aiDcIF2O55u2kUhEMTKjh8rpmIAU4jtX00I42ByJ0x+/aiDgIF2O45O2lUxINTKjh8rpmIAU4jtX00Y42BiBuy/LaiDgIF2S45O2lUxINTKjh8rpmIAU4jtb00Y42BiBuy/LaiDgIF2S45O2lUxINTKjh8rpmIAU4jtb00I42BiBuxe7aiDgIF2W55O2mUxINTKjh8bhlHwU5j9f0z482BiFvxu/ZiDcIF2a55u2mUhEMTKrh8rllHgY5j9f0zY01BiB2xO/ZhzcIG2e76OykUBEMTKvh8rdlHgY5j9f0zY01BiB2w+/YhzcIG2i76OylTxAMTKzh8rVmHwU6kNj0zI41BiB2we/YhjcIG2m86OykTxAMTq3h8LRmHwU6kNn0y4w0BiFzxO7Yhjc');
    beep.play().catch(() => {});
  }
}