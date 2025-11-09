import React, { useRef, useEffect, useState } from 'react';
import Map, { Marker, Source, Layer, Popup } from 'react-map-gl';
import { Navigation, AlertTriangle, CheckCircle } from 'lucide-react';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

export default function RouteMap({ 
  route, 
  currentPosition, 
  upcomingBridges = [],
  alertLevel = 'none' 
}) {
  const mapRef = useRef();
  const [viewState, setViewState] = useState({
    longitude: -71.0589,
    latitude: 42.3601,
    zoom: 11
  });
  const [selectedBridge, setSelectedBridge] = useState(null);

  // Fit map to route on initial load
  useEffect(() => {
    if (route?.coordinates && mapRef.current && route.coordinates.length > 0) {
      // Calculate bounds from route coordinates
      const lons = route.coordinates.map(c => c[0]);
      const lats = route.coordinates.map(c => c[1]);
      
      const bounds = [
        [Math.min(...lons), Math.min(...lats)], // Southwest
        [Math.max(...lons), Math.max(...lats)]  // Northeast
      ];
      
      mapRef.current.fitBounds(bounds, {
        padding: 50,
        duration: 1000
      });
    }
  }, [route]);

  // Update map center when position changes
  useEffect(() => {
    if (currentPosition && mapRef.current) {
      // Smoothly fly to new position
      mapRef.current.flyTo({
        center: [currentPosition.lon, currentPosition.lat],
        duration: 1000,
        essential: true
      });
    }
  }, [currentPosition]);

  // Route line data
  const routeLineData = route ? {
    type: 'Feature',
    geometry: {
      type: 'LineString',
      coordinates: route.coordinates || []
    }
  } : null;

  // Route line style
  const routeLineLayer = {
    id: 'route',
    type: 'line',
    paint: {
      'line-color': '#3b82f6',
      'line-width': 4,
      'line-opacity': 0.8
    }
  };

  // Alert border style (pulsing effect)
  const alertColors = {
    none: 'transparent',
    info: '#3b82f6',
    warning: '#f59e0b',
    critical: '#ef4444',
    emergency: '#dc2626'
  };

  return (
    <div className={`relative w-full h-full rounded-xl overflow-hidden ${
      alertLevel !== 'none' ? 'ring-4 ring-offset-2 animate-pulse' : ''
    }`} style={{ 
      borderColor: alertColors[alertLevel],
      borderWidth: alertLevel !== 'none' ? '4px' : '0px'
    }}>
      <Map
        ref={mapRef}
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        mapboxAccessToken={MAPBOX_TOKEN}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/streets-v12"
      >
        {/* Route Line */}
        {routeLineData && (
          <Source id="route" type="geojson" data={routeLineData}>
            <Layer {...routeLineLayer} />
          </Source>
        )}

        {/* Current Vehicle Position */}
        {currentPosition && (
          <Marker
            longitude={currentPosition.lon}
            latitude={currentPosition.lat}
            anchor="center"
          >
            <div className="relative">
              {/* Pulsing circle for current position */}
              <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-75" 
                   style={{ width: '40px', height: '40px', left: '-20px', top: '-20px' }} />
              
              {/* Vehicle icon */}
              <div className="relative bg-blue-600 text-white p-3 rounded-full shadow-lg border-4 border-white">
                <Navigation className="w-6 h-6" style={{ 
                  transform: `rotate(${currentPosition.heading || 0}deg)` 
                }} />
              </div>
              
              {/* Speed indicator */}
              {currentPosition.speed && (
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-white px-2 py-1 rounded shadow-md text-xs font-bold whitespace-nowrap">
                  {currentPosition.speed} mph
                </div>
              )}
            </div>
          </Marker>
        )}

        {/* Bridge Markers */}
        {upcomingBridges.map((bridge, idx) => (
          <Marker
            key={bridge.id || idx}
            longitude={bridge.lon}
            latitude={bridge.lat}
            anchor="bottom"
            onClick={e => {
              e.originalEvent.stopPropagation();
              setSelectedBridge(bridge);
            }}
          >
            <div className="cursor-pointer">
              <BridgeMarker bridge={bridge} />
            </div>
          </Marker>
        ))}

        {/* Bridge Info Popup */}
        {selectedBridge && (
          <Popup
            longitude={selectedBridge.lon}
            latitude={selectedBridge.lat}
            anchor="top"
            onClose={() => setSelectedBridge(null)}
            closeOnClick={false}
          >
            <div className="p-2 min-w-[200px]">
              <h3 className="font-bold text-sm mb-1">{selectedBridge.name}</h3>
              <div className="text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-600">Clearance:</span>
                  <span className="font-bold">{selectedBridge.clearanceFeet}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Distance:</span>
                  <span className="font-bold">{selectedBridge.distanceMiles?.toFixed(1)} mi</span>
                </div>
                {selectedBridge.riskLevel && (
                  <div className={`text-xs font-bold px-2 py-1 rounded mt-2 text-center ${
                    selectedBridge.riskLevel === 'SAFE' ? 'bg-green-100 text-green-800' :
                    selectedBridge.riskLevel === 'CAUTION' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {selectedBridge.riskLevel}
                  </div>
                )}
              </div>
            </div>
          </Popup>
        )}
      </Map>

      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 text-xs">
        <div className="font-bold mb-2">Map Legend</div>
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
            <span>Your Vehicle</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Safe Bridge</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>Danger Bridge</span>
          </div>
        </div>
      </div>

      {/* Alert Overlay */}
      {alertLevel !== 'none' && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
          <AlertBanner level={alertLevel} />
        </div>
      )}
    </div>
  );
}

// Bridge Marker Component
function BridgeMarker({ bridge }) {
  const getRiskColor = (risk) => {
    switch(risk) {
      case 'SAFE': return 'bg-green-500';
      case 'CAUTION': return 'bg-yellow-500';
      case 'DANGER': return 'bg-red-500';
      case 'CRITICAL': return 'bg-red-700';
      default: return 'bg-gray-500';
    }
  };

  const icon = bridge.riskLevel === 'SAFE' ? CheckCircle : AlertTriangle;
  const Icon = icon;

  return (
    <div className="relative">
      {/* Warning pulse for dangerous bridges */}
      {(bridge.riskLevel === 'DANGER' || bridge.riskLevel === 'CRITICAL') && (
        <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-75"
             style={{ width: '30px', height: '30px', left: '-15px', top: '-15px' }} />
      )}
      
      {/* Bridge marker */}
      <div className={`${getRiskColor(bridge.riskLevel)} text-white p-2 rounded-full shadow-lg border-2 border-white`}>
        <Icon className="w-4 h-4" />
      </div>
      
      {/* Distance label */}
      {bridge.distanceMiles !== undefined && (
        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-white px-2 py-0.5 rounded shadow-md text-xs font-bold whitespace-nowrap">
          {bridge.distanceMiles.toFixed(1)} mi
        </div>
      )}
    </div>
  );
}

// Alert Banner Component
function AlertBanner({ level }) {
  const configs = {
    info: {
      bg: 'bg-blue-500',
      text: 'Bridge Ahead',
      icon: '📍'
    },
    warning: {
      bg: 'bg-yellow-500',
      text: 'WARNING: Tight Clearance',
      icon: '⚠️'
    },
    critical: {
      bg: 'bg-red-500 animate-pulse',
      text: 'CRITICAL: Low Bridge Ahead',
      icon: '🚨'
    },
    emergency: {
      bg: 'bg-red-700 animate-pulse',
      text: '🛑 STOP! BRIDGE STRIKE IMMINENT!',
      icon: '🚨'
    }
  };

  const config = configs[level] || configs.info;

  return (
    <div className={`${config.bg} text-white px-6 py-3 rounded-lg shadow-2xl font-bold text-center`}>
      <div className="text-2xl mb-1">{config.icon}</div>
      <div className="text-lg">{config.text}</div>
    </div>
  );
}