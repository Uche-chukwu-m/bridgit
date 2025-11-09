/**
 * Fetch real road route from Mapbox Directions API
 * @param {Array} coordinates - Array of [lon, lat] waypoints
 * @param {string} profile - 'driving-traffic', 'driving', 'walking', 'cycling'
 * @returns {Promise} Route geometry and metadata
 */
export async function getMapboxRoute(coordinates, profile = 'driving') {
  const token = import.meta.env.VITE_MAPBOX_TOKEN;
  
  if (!token) {
    console.error('Mapbox token not found');
    return null;
  }

  // Format coordinates for API: lon,lat;lon,lat;...
  const coordsString = coordinates
    .map(coord => `${coord[0]},${coord[1]}`)
    .join(';');

  const url = `https://api.mapbox.com/directions/v5/mapbox/${profile}/${coordsString}?geometries=geojson&overview=full&steps=true&access_token=${token}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.routes && data.routes.length > 0) {
      const route = data.routes[0];
      
      return {
        coordinates: route.geometry.coordinates, // Array of [lon, lat] following roads
        distance: route.distance, // meters
        duration: route.duration, // seconds
        distanceMiles: (route.distance * 0.000621371).toFixed(2),
        durationMinutes: (route.duration / 60).toFixed(0),
        legs: route.legs,
        steps: route.legs.flatMap(leg => leg.steps)
      };
    }

    return null;
  } catch (error) {
    console.error('Error fetching Mapbox route:', error);
    return null;
  }
}

/**
 * Get route between two cities with waypoints for bridges
 * @param {string} origin - Start city
 * @param {string} destination - End city
 * @param {Array} bridgeCoordinates - Optional bridge waypoints to ensure route passes through
 */
export async function getRouteWithBridges(origin, destination, bridgeCoordinates = []) {
  // City coordinates (you can expand this)
  const cityCoords = {
    'boston': [-71.0589, 42.3601],
    'new york': [-74.0060, 40.7128],
    'nyc': [-74.0060, 40.7128],
    'chicago': [-87.6298, 41.8781],
    'detroit': [-83.0458, 42.3314],
    'los angeles': [-118.2437, 34.0522],
    'la': [-118.2437, 34.0522],
    'san francisco': [-122.4194, 37.7749],
    'sf': [-122.4194, 37.7749],
    'miami': [-80.1918, 25.7617],
    'orlando': [-81.3792, 28.5383],
    'dallas': [-96.7970, 32.7767],
    'houston': [-95.3698, 29.7604],
    'seattle': [-122.3321, 47.6062],
    'portland': [-122.6765, 45.5152]
  };

  const start = cityCoords[origin.toLowerCase()] || origin;
  const end = cityCoords[destination.toLowerCase()] || destination;

  // Build waypoints array: start -> bridges -> end
  const waypoints = [start, ...bridgeCoordinates, end];

  return await getMapboxRoute(waypoints, 'driving');
}

/**
 * Get dangerous route that deliberately goes through low bridges
 * (for demo purposes - showing what NOT to do)
 */
export async function getDangerousRoute(origin, destination) {
  // For Boston to NYC, force route through Storrow Drive
  if (origin.toLowerCase() === 'boston' && destination.toLowerCase().includes('new york')) {
    const waypoints = [
      [-71.0589, 42.3601],  // Boston start
      [-71.0942, 42.3601],  // Force through Storrow Drive area
      [-71.0875, 42.3615],  // Another Storrow point
      [-74.0060, 40.7128]   // NYC end
    ];
    
    return await getMapboxRoute(waypoints, 'driving');
  }

  // Default to regular route
  return await getRouteWithBridges(origin, destination);
}

/**
 * Get safe route (Grade A) - uses major interstates only
 */
export async function getSafeRoute(origin, destination) {
  // For Boston to NYC, use I-95 corridor (safest)
  if (origin.toLowerCase() === 'boston' && destination.toLowerCase().includes('new york')) {
    const waypoints = [
      [-71.0589, 42.3601],  // Boston start
      [-71.4128, 41.8240],  // Providence, RI (I-95)
      [-72.3395, 41.3153],  // Old Lyme, CT (I-95 Connecticut River)
      [-74.0060, 40.7128]   // NYC end
    ];
    
    return await getMapboxRoute(waypoints, 'driving');
  }

  // Default to direct route
  return await getRouteWithBridges(origin, destination);
}

/**
 * Get moderate risk route (Grade C) - shorter but tighter clearances
 */
export async function getModerateRoute(origin, destination) {
  // For Boston to NYC, use I-93/I-95 hybrid (shorter but some tight spots)
  if (origin.toLowerCase() === 'boston' && destination.toLowerCase().includes('new york')) {
    const waypoints = [
      [-71.0589, 42.3601],  // Boston start
      [-71.1097, 42.3875],  // I-93 South
      [-72.6734, 41.7658],  // Hartford, CT area
      [-74.0060, 40.7128]   // NYC end
    ];
    
    return await getMapboxRoute(waypoints, 'driving');
  }

  // Default to regular route
  return await getRouteWithBridges(origin, destination);
}
