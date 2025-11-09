import React, { useState, useEffect } from 'react';
import { MapPin, ArrowRight, Loader, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { planRoute } from '../services/api';
import { mockRoutes } from '../data/mockRoutes';

// Available cities for dropdown
const CITIES = [
  { value: 'Boston, MA', label: 'Boston, MA' },
  { value: 'New York, NY', label: 'New York, NY' },
  { value: 'Chicago, IL', label: 'Chicago, IL' },
  { value: 'Detroit, MI', label: 'Detroit, MI' },
  { value: 'Los Angeles, CA', label: 'Los Angeles, CA' },
  { value: 'San Francisco, CA', label: 'San Francisco, CA' },
  { value: 'Miami, FL', label: 'Miami, FL' },
  { value: 'Orlando, FL', label: 'Orlando, FL' },
  { value: 'Dallas, TX', label: 'Dallas, TX' },
  { value: 'Houston, TX', label: 'Houston, TX' },
  { value: 'Seattle, WA', label: 'Seattle, WA' },
  { value: 'Portland, OR', label: 'Portland, OR' }
];

/**
 * Select exactly 3 routes with grades A (safe), C (moderate), F (dangerous)
 * This ensures consistent risk stratification for all city pairs
 * Randomizes selection of A-grade routes for variety
 */
function selectThreeRoutes(routes, originCity, destCity) {
  // Find ALL routes of each target grade
  const allGradeA = routes.filter(r => r.safetyGrade === 'A');
  const allGradeC = routes.filter(r => r.safetyGrade === 'C');
  const allGradeF = routes.filter(r => r.safetyGrade === 'F');
  
  // Randomly select one from each grade if available
  const gradeA = allGradeA.length > 0 
    ? allGradeA[Math.floor(Math.random() * allGradeA.length)] 
    : null;
  const gradeC = allGradeC.length > 0 
    ? allGradeC[Math.floor(Math.random() * allGradeC.length)] 
    : null;
  const gradeF = allGradeF.length > 0 
    ? allGradeF[Math.floor(Math.random() * allGradeF.length)] 
    : null;
  
  // If we have perfect A/C/F combination, use it
  if (gradeA && gradeC && gradeF) {
    return [gradeA, gradeC, gradeF];
  }
  
  // Otherwise, create fallback routes to ensure we always have 3 options
  const result = [];
  
  // Route A (Safe) - use randomly selected A grade or best available
  if (gradeA) {
    result.push(gradeA);
  } else {
    const safest = routes.find(r => r.safetyGrade === 'B') || routes[0];
    result.push({
      ...safest,
      id: 'route_safe_fallback',
      name: safest.name + ' (Safest Available)',
      safetyGrade: 'A',
      riskLevel: 'SAFE',
      strikeProbability: Math.min(safest.strikeProbability, 0.05),
      recommended: true,
      icon: '✅'
    });
  }
  
  // Route C (Moderate) - use randomly selected C grade or middle route
  if (gradeC) {
    result.push(gradeC);
  } else {
    const moderate = routes.find(r => ['B', 'C', 'D'].includes(r.safetyGrade)) || routes[1] || routes[0];
    result.push({
      ...moderate,
      id: 'route_moderate_fallback',
      name: moderate.name.replace(/\(.*?\)/, '(Moderate Risk)'),
      safetyGrade: 'C',
      riskLevel: 'MEDIUM',
      strikeProbability: Math.min(Math.max(moderate.strikeProbability, 0.25), 0.45),
      recommended: false,
      icon: '⚠️'
    });
  }
  
  // Route F (Dangerous) - use randomly selected F grade or create dangerous route
  if (gradeF) {
    result.push(gradeF);
  } else {
    const worst = routes.find(r => ['D', 'F'].includes(r.safetyGrade)) || routes[routes.length - 1] || routes[0];
    result.push({
      ...worst,
      id: 'route_dangerous_fallback',
      name: worst.name.replace(/\(.*?\)/, '(DANGEROUS)'),
      safetyGrade: 'F',
      riskLevel: 'CRITICAL',
      strikeProbability: Math.max(worst.strikeProbability, 0.85),
      recommended: false,
      blocked: true,
      icon: '🚫',
      description: worst.description.includes('DANGEROUS') 
        ? worst.description 
        : `DANGEROUS: ${worst.description} High risk of bridge strikes.`
    });
  }
  
  return result;
}

export default function RoutePlannerPage() {
  const navigate = useNavigate();
  const [heightFeet, setHeightFeet] = useState(13);
  const [heightInches, setHeightInches] = useState(6);
  const [origin, setOrigin] = useState('Boston, MA');
  const [destination, setDestination] = useState('New York, NY');
  const [loading, setLoading] = useState(false);
  const [routes, setRoutes] = useState(null);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [useDemo, setUseDemo] = useState(true); // Toggle for demo/real data
  const [error, setError] = useState(null);
  
  // Calculate total height in inches
  const vehicleHeight = (heightFeet * 12) + heightInches;

  const handleStartRoute = (route) => {
    // Navigate to live monitoring with route data
    navigate('/monitor', { 
      state: { 
        route,
        vehicleHeight,
        origin,
        destination 
      } 
    });
  };

  const handlePlanRoute = async () => {
    setError(null); // Clear previous errors
    
    if (useDemo) {
      // Use mock data - normalize city names for matching
      setLoading(true);
      setTimeout(() => {
        const originCity = origin.split(',')[0].toLowerCase().trim();
        const destCity = destination.split(',')[0].toLowerCase().trim();
        
        // Try exact match first
        let key = `${originCity}-${destCity}`;
        let demoRoutes = mockRoutes[key];
        
        // If no match, try reverse direction
        if (!demoRoutes) {
          key = `${destCity}-${originCity}`;
          demoRoutes = mockRoutes[key];
        }
        
        // If still no match, fallback to default
        if (!demoRoutes) {
          demoRoutes = mockRoutes['boston-nyc'];
        }
        
        // ALWAYS return exactly 3 routes: A (safe), C (moderate), F (dangerous)
        const selectedRoutes = selectThreeRoutes(demoRoutes, originCity, destCity);
        
        setRoutes(selectedRoutes);
        setLoading(false);
      }, 1500);
    } else {
      // Real AI analysis
      setLoading(true);
      try {
        console.log('Calling AI with:', {
          vehicle_height_inches: vehicleHeight,
          origin,
          destination,
          vehicle_description: `${heightFeet}'${heightInches}" tall vehicle`
        });
        
        const response = await planRoute({
          vehicle_height_inches: vehicleHeight,
          origin,
          destination,
          vehicle_description: `${heightFeet}'${heightInches}" tall vehicle`
        });
        
        console.log('AI Response:', response);
        
        // Parse the AI response
        let parsed;
        if (typeof response.analysis === 'string') {
          // Remove markdown code blocks if present
          let cleanJson = response.analysis;
          if (cleanJson.includes('```json')) {
            cleanJson = cleanJson.split('```json')[1].split('```')[0].trim();
          } else if (cleanJson.includes('```')) {
            cleanJson = cleanJson.split('```')[1].split('```')[0].trim();
          }
          parsed = JSON.parse(cleanJson);
        } else {
          parsed = response.analysis;
        }
        
        console.log('Parsed routes:', parsed);
        
        // Map AI response to frontend format
        const aiRoutes = parsed.routes.map((route, idx) => ({
          id: `ai_route_${idx}`,
          name: route.name,
          type: route.type || 'mixed',
          distance: route.distance_miles || 0,
          duration: Math.round((route.duration_hours || 0) * 60), // Convert hours to minutes
          safetyGrade: route.safety_grade || 'C',
          riskLevel: route.risk_assessment?.overall_risk || 'MEDIUM',
          strikeProbability: route.risk_assessment?.strike_probability || 0.5,
          bridges: (route.key_bridges || []).map(bridge => ({
            id: bridge.name || 'Bridge',
            clearance: bridge.clearance_inches || 168,
            margin: bridge.margin_inches >= 0 ? 'comfortable' : 'tight'
          })),
          description: route.clearance_summary || route.recommendation?.reasoning || 'AI-generated route',
          recommended: route.recommendation?.recommended || false,
          blocked: route.risk_assessment?.overall_risk === 'CRITICAL',
          icon: route.safety_grade === 'A' ? '✅' : route.safety_grade === 'F' ? '🚫' : '⚠️'
        }));
        
        console.log('Formatted routes:', aiRoutes);
        setRoutes(aiRoutes);
      } catch (err) {
        console.error('Route planning error:', err);
        setError(err.response?.data?.detail || err.message || 'Failed to plan route. Make sure the backend server is running.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Plan Safe Route
        </h1>
        <p className="text-lg text-gray-600">
          Enter your trip details. We'll analyze all bridges and recommend the safest route.
        </p>
      </div>

      {/* Input Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Vehicle Height */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vehicle Height
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <input
                  type="number"
                  value={heightFeet}
                  onChange={(e) => setHeightFeet(parseInt(e.target.value) || 0)}
                  min="0"
                  max="20"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="13"
                />
                <p className="text-xs text-gray-500 mt-1 text-center">Feet</p>
              </div>
              <div>
                <input
                  type="number"
                  value={heightInches}
                  onChange={(e) => setHeightInches(parseInt(e.target.value) || 0)}
                  min="0"
                  max="11"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="6"
                />
                <p className="text-xs text-gray-500 mt-1 text-center">Inches</p>
              </div>
            </div>
            <p className="text-xs text-gray-600 mt-2 text-center">
              Total: {heightFeet}'{heightInches}" ({vehicleHeight} inches)
            </p>
          </div>

          {/* Origin */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="w-4 h-4 inline mr-1" />
              From
            </label>
            <select
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              {CITIES.map(city => (
                <option key={city.value} value={city.value}>
                  {city.label}
                </option>
              ))}
            </select>
          </div>

          {/* Destination */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="w-4 h-4 inline mr-1" />
              To
            </label>
            <select
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              {CITIES.map(city => (
                <option key={city.value} value={city.value}>
                  {city.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Validation Message */}
        {origin === destination && (
          <div className="mt-4 bg-yellow-50 border border-yellow-300 rounded-lg p-3 flex items-start">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-yellow-800">
              <span className="font-semibold">Same origin and destination.</span> Please select different cities to plan a route.
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mt-4 bg-red-50 border border-red-300 rounded-lg p-3 flex items-start">
            <XCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-red-800">
                <span className="font-semibold">Error:</span> {error}
              </p>
              {error.includes('backend server') && (
                <p className="text-xs text-red-700 mt-1">
                  Make sure to run: <code className="bg-red-100 px-1 rounded">cd backend && python main.py</code>
                </p>
              )}
            </div>
          </div>
        )}

        {/* Plan Button */}
        <button
          onClick={handlePlanRoute}
          disabled={loading || origin === destination}
          className="mt-6 w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {loading ? (
            <>
              <Loader className="w-5 h-5 mr-2 animate-spin" />
              Analyzing Routes...
            </>
          ) : (
            <>
              <ArrowRight className="w-5 h-5 mr-2" />
              {origin === destination ? 'Select Different Cities' : 'Find Safe Routes'}
            </>
          )}
        </button>

        {/* Demo Toggle */}
        <div className="mt-4 flex items-center justify-center">
          <label className="flex items-center space-x-2 text-sm text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              checked={useDemo}
              onChange={(e) => setUseDemo(e.target.checked)}
              className="rounded"
            />
            <span>Use demo data (faster)</span>
          </label>
        </div>
      </div>

      {/* Results */}
      {loading && <LoadingState />}
      {routes && !loading && (
        <RouteResults
          routes={routes}
          vehicleHeight={vehicleHeight}
          selectedRoute={selectedRoute}
          onSelectRoute={setSelectedRoute}
          onStartRoute={handleStartRoute}
        />
      )}
    </div>
  );
}

// Loading State
function LoadingState() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
      <Loader className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-4" />
      <h3 className="text-xl font-bold text-gray-900 mb-2">Analyzing Routes...</h3>
      <p className="text-gray-600 mb-6">
        AI is checking all bridges along possible routes
      </p>
      <div className="max-w-md mx-auto space-y-2 text-sm text-gray-500 text-left">
        <p className="flex items-center">
          <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
          Finding all possible routes
        </p>
        <p className="flex items-center">
          <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
          Identifying bridges along each route
        </p>
        <p className="flex items-center">
          <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
          Calculating clearance margins
        </p>
        <p className="flex items-center">
          <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
          Assessing risk levels
        </p>
      </div>
    </div>
  );
}

// Route Results Component
function RouteResults({ routes, vehicleHeight, selectedRoute, onSelectRoute, onStartRoute }) {
  const sortedRoutes = [...routes].sort((a, b) => {
    const gradeOrder = { 'A': 1, 'B': 2, 'C': 3, 'D': 4, 'F': 5 };
    return gradeOrder[a.safetyGrade] - gradeOrder[b.safetyGrade];
  });

  return (
    <div>
      {/* Summary */}
      <div className="bg-blue-50 rounded-xl p-6 mb-8 border border-blue-200">
        <h2 className="text-xl font-bold text-blue-900 mb-2">
          3 Route Options Analyzed
        </h2>
        <p className="text-blue-800 mb-3">
          Your vehicle: <span className="font-bold">{Math.floor(vehicleHeight / 12)}'{vehicleHeight % 12}"</span>
          {' '}({vehicleHeight} inches)
        </p>
        <div className="flex items-center space-x-6 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-green-500 text-white font-bold rounded-full flex items-center justify-center">A</div>
            <span className="text-gray-700">Safe - No dangerous bridges</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-yellow-500 text-white font-bold rounded-full flex items-center justify-center">C</div>
            <span className="text-gray-700">Moderate - Tight clearances</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-red-500 text-white font-bold rounded-full flex items-center justify-center">F</div>
            <span className="text-gray-700">Dangerous - AVOID</span>
          </div>
        </div>
      </div>

      {/* Route Cards */}
      <div className="space-y-6">
        {sortedRoutes.map((route, idx) => (
          <RouteCard
            key={route.id || idx}
            route={route}
            vehicleHeight={vehicleHeight}
            isSelected={selectedRoute?.id === route.id}
            onSelect={() => onSelectRoute(route)}
            onStartRoute={() => onStartRoute(route)}
            rank={idx + 1}
          />
        ))}
      </div>
    </div>
  );
}

// Route Card Component
function RouteCard({ route, vehicleHeight, isSelected, onSelect, onStartRoute, rank }) {
  const gradeColors = {
    'A': 'bg-green-50 border-green-300 text-green-800',
    'B': 'bg-blue-50 border-blue-300 text-blue-800',
    'C': 'bg-yellow-50 border-yellow-300 text-yellow-800',
    'D': 'bg-orange-50 border-orange-300 text-orange-800',
    'F': 'bg-red-50 border-red-300 text-red-800'
  };

  const gradeBadgeColors = {
    'A': 'bg-green-500',
    'B': 'bg-blue-500',
    'C': 'bg-yellow-500',
    'D': 'bg-orange-500',
    'F': 'bg-red-500'
  };

  const riskIcons = {
    'SAFE': <CheckCircle className="w-6 h-6 text-green-600" />,
    'LOW': <CheckCircle className="w-6 h-6 text-blue-600" />,
    'MEDIUM': <AlertTriangle className="w-6 h-6 text-yellow-600" />,
    'HIGH': <AlertTriangle className="w-6 h-6 text-orange-600" />,
    'CRITICAL': <XCircle className="w-6 h-6 text-red-600" />
  };

  return (
    <div
      onClick={onSelect}
      className={`bg-white rounded-xl shadow-md border-2 transition-all cursor-pointer ${
        isSelected ? 'border-blue-500 shadow-lg' : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      {/* Header */}
      <div className={`p-6 border-b border-gray-200 ${gradeColors[route.safetyGrade]}`}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2 flex-wrap">
              {/* Grade-specific badges */}
              {route.safetyGrade === 'A' && route.recommended && (
                <span className="bg-green-500 text-white text-xs font-bold px-3 py-1.5 rounded-full">
                  ✓ RECOMMENDED
                </span>
              )}
              {route.safetyGrade === 'C' && (
                <span className="bg-yellow-600 text-white text-xs font-bold px-3 py-1.5 rounded-full">
                  ⚠️ CAUTION REQUIRED
                </span>
              )}
              {route.safetyGrade === 'F' && (
                <span className="bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-full animate-pulse">
                  🚫 AVOID - DANGEROUS
                </span>
              )}
              {route.blocked && (
                <span className="bg-red-700 text-white text-xs font-bold px-3 py-1.5 rounded-full">
                  ⛔ BLOCKED
                </span>
              )}
              
              {/* Safety Grade Circle */}
              <div className={`${gradeBadgeColors[route.safetyGrade]} text-white text-2xl font-bold w-12 h-12 rounded-full flex items-center justify-center shadow-lg`}>
                {route.safetyGrade}
              </div>
            </div>

            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {route.icon} {route.name}
            </h3>
            <p className="text-gray-700">{route.description}</p>
          </div>

          {/* Risk Icon */}
          <div className="ml-4">
            {riskIcons[route.riskLevel]}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 divide-x divide-gray-200 border-b border-gray-200">
        <div className="p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{route.distance} mi</p>
          <p className="text-xs text-gray-600 mt-1">Distance</p>
        </div>
        <div className="p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">
            {Math.floor(route.duration / 60)}h {route.duration % 60}m
          </p>
          <p className="text-xs text-gray-600 mt-1">Duration</p>
        </div>
        <div className="p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">
            {(route.strikeProbability * 100).toFixed(0)}%
          </p>
          <p className="text-xs text-gray-600 mt-1">Strike Risk</p>
        </div>
      </div>

      {/* Bridge Details */}
      <div className="p-6">
        <h4 className="font-bold text-gray-900 mb-3">
          Bridges on Route ({route.bridges?.length || 0})
        </h4>
        
        <div className="space-y-2">
          {route.bridges?.slice(0, 3).map((bridge, idx) => (
            <BridgeDetailRow
              key={idx}
              bridge={bridge}
              vehicleHeight={vehicleHeight}
            />
          ))}
          
          {route.bridges?.length > 3 && (
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              Show all {route.bridges.length} bridges →
            </button>
          )}
        </div>

        {/* Action Button - Show for all routes with different styling */}
        {!route.blocked && (
          <button 
            onClick={(e) => {
              e.stopPropagation(); // Prevent card selection
              onStartRoute();
            }}
            className={`mt-6 w-full font-semibold py-3 px-6 rounded-lg transition-colors ${
              route.safetyGrade === 'A' 
                ? 'bg-green-600 hover:bg-green-700 text-white' 
                : route.safetyGrade === 'C'
                ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                : 'bg-orange-600 hover:bg-orange-700 text-white'
            }`}
          >
            {route.safetyGrade === 'A' && '✓ Start Safe Route'}
            {route.safetyGrade === 'C' && '⚠️ Start This Route (Caution)'}
            {route.safetyGrade === 'F' && '⚠️ Start This Route (High Risk)'}
          </button>
        )}
        
        {route.blocked && (
          <>
            <div className="mt-6 bg-red-50 border-2 border-red-300 rounded-lg p-4 text-center">
              <p className="font-bold text-red-900">DO NOT USE THIS ROUTE</p>
              <p className="text-sm text-red-800 mt-1">
                You will not fit under bridges on this route
              </p>
            </div>
            <button 
              onClick={(e) => {
                e.stopPropagation(); // Prevent card selection
                onStartRoute();
              }}
              className="mt-4 w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              🚫 View Dangerous Route (Demo Only)
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// Bridge Detail Row
function BridgeDetailRow({ bridge, vehicleHeight }) {
  const clearanceInches = bridge.clearance;
  const margin = clearanceInches - vehicleHeight;
  
  let statusColor = 'bg-gray-100 text-gray-800';
  let statusText = bridge.margin || 'Unknown';
  
  if (margin < 0) {
    statusColor = 'bg-red-100 text-red-800';
    statusText = 'WILL NOT FIT';
  } else if (margin < 4) {
    statusColor = 'bg-orange-100 text-orange-800';
    statusText = 'Very Tight';
  } else if (margin < 6) {
    statusColor = 'bg-yellow-100 text-yellow-800';
    statusText = 'Tight';
  } else {
    statusColor = 'bg-green-100 text-green-800';
    statusText = 'Comfortable';
  }

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div className="flex-1">
        <p className="font-medium text-gray-900 text-sm">{bridge.id || 'Bridge'}</p>
        <p className="text-xs text-gray-600">
          Clearance: {Math.floor(clearanceInches / 12)}'{clearanceInches % 12}" 
          {margin >= 0 && ` (${margin}" margin)`}
        </p>
      </div>
      <span className={`text-xs font-bold px-3 py-1 rounded-full ${statusColor}`}>
        {statusText}
      </span>
    </div>
  );
}