import { useState, useEffect, useRef } from 'react';
import * as turf from '@turf/turf';

export function useGPSSimulation(route, isActive, speed = 60) {
  // speed in mph, default 60mph
  
  const [currentPosition, setCurrentPosition] = useState(null);
  const [distanceTraveled, setDistanceTraveled] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const intervalRef = useRef(null);
  
  // Set initial position when route loads
  useEffect(() => {
    if (route?.coordinates && route.coordinates.length > 0) {
      const startPoint = route.coordinates[0];
      const initialPos = {
        lat: startPoint[1],
        lon: startPoint[0],
        speed: 0,
        heading: route.coordinates.length > 1 
          ? calculateHeading(route.coordinates[0], route.coordinates[1])
          : 0
      };
      console.log('Setting initial position:', initialPos);
      setCurrentPosition(initialPos);
      setDistanceTraveled(0);
      setElapsedTime(0);
    }
  }, [route]);
  
  useEffect(() => {
    if (!isActive || !route?.coordinates) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    console.log('Starting simulation with route:', route.coordinates.length, 'points');

    // Create a line from route coordinates
    const line = turf.lineString(route.coordinates);
    const totalDistance = turf.length(line, { units: 'miles' });
    
    console.log('Total route distance:', totalDistance, 'miles');
    
    // Calculate how often to update (every 100ms)
    const updateInterval = 100; // ms
    
    // Calculate distance per update
    // speed mph = speed miles per hour = speed/3600 miles per second
    const milesPerSecond = speed / 3600;
    const milesPerUpdate = milesPerSecond * (updateInterval / 1000);
    
    let currentDistance = 0;
    let currentTime = 0;
    
    // Start from beginning of route
    const startPoint = turf.point(route.coordinates[0]);
    setCurrentPosition({
      lat: startPoint.geometry.coordinates[1],
      lon: startPoint.geometry.coordinates[0],
      speed: speed,
      heading: calculateHeading(route.coordinates[0], route.coordinates[1])
    });

    intervalRef.current = setInterval(() => {
      currentDistance += milesPerUpdate;
      currentTime += updateInterval / 1000;
      
      // Check if we've reached the end
      if (currentDistance >= totalDistance) {
        clearInterval(intervalRef.current);
        setDistanceTraveled(totalDistance);
        setElapsedTime(currentTime);
        console.log('Simulation complete!');
        return;
      }
      
      // Get point along the line
      const alongLine = turf.along(line, currentDistance, { units: 'miles' });
      const coords = alongLine.geometry.coordinates;
      
      // Calculate heading for vehicle rotation
      const nextPoint = turf.along(line, currentDistance + 0.01, { units: 'miles' });
      const heading = calculateHeading(coords, nextPoint.geometry.coordinates);
      
      const newPosition = {
        lat: coords[1],
        lon: coords[0],
        speed: speed,
        heading: heading
      };
      
      console.log('Position update:', newPosition, 'Distance:', currentDistance.toFixed(2), 'mi');
      
      setCurrentPosition(newPosition);
      setDistanceTraveled(currentDistance);
      setElapsedTime(currentTime);
    }, updateInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, route, speed]);

  const reset = () => {
    setDistanceTraveled(0);
    setElapsedTime(0);
    if (route?.coordinates) {
      const startPoint = route.coordinates[0];
      setCurrentPosition({
        lat: startPoint[1],
        lon: startPoint[0],
        speed: speed,
        heading: 0
      });
    }
  };

  return {
    currentPosition,
    distanceTraveled,
    elapsedTime,
    reset
  };
}

// Calculate heading between two points
function calculateHeading(from, to) {
  const fromPoint = turf.point(from);
  const toPoint = turf.point(to);
  const bearing = turf.bearing(fromPoint, toPoint);
  return bearing;
}