import { useMemo } from 'react';
import * as turf from '@turf/turf';

export function useAlertLevel(currentPosition, bridges, vehicleHeight) {
  const alertState = useMemo(() => {
    if (!currentPosition || !bridges || bridges.length === 0) {
      return {
        level: 'none',
        closestBridge: null,
        distanceToClosest: null,
        message: null
      };
    }

    const currentPoint = turf.point([currentPosition.lon, currentPosition.lat]);
    
    // Find dangerous bridges ahead
    const dangerousBridges = bridges.filter(bridge => {
      const margin = bridge.clearance - vehicleHeight;
      return margin < 6; // Less than 6 inches margin = dangerous
    });

    if (dangerousBridges.length === 0) {
      return {
        level: 'none',
        closestBridge: null,
        distanceToClosest: null,
        message: 'All clear - no dangerous bridges ahead'
      };
    }

    // Calculate distances to all dangerous bridges
    const bridgesWithDistance = dangerousBridges.map(bridge => {
      const bridgePoint = turf.point([bridge.lon, bridge.lat]);
      const distance = turf.distance(currentPoint, bridgePoint, { units: 'miles' });
      return { ...bridge, distanceMiles: distance };
    });

    // Find closest dangerous bridge
    const closest = bridgesWithDistance.reduce((min, bridge) => 
      bridge.distanceMiles < min.distanceMiles ? bridge : min
    );

    // Determine alert level based on distance
    let level, message;
    
    if (closest.distanceMiles <= 0.1) {
      level = 'emergency';
      message = `STOP! ${closest.name} in ${(closest.distanceMiles * 5280).toFixed(0)} feet!`;
    } else if (closest.distanceMiles <= 0.25) {
      level = 'critical';
      message = `CRITICAL: ${closest.name} ahead - ${closest.clearanceFeet} clearance`;
    } else if (closest.distanceMiles <= 1.0) {
      level = 'warning';
      message = `WARNING: Low bridge in ${closest.distanceMiles.toFixed(1)} miles`;
    } else if (closest.distanceMiles <= 2.0) {
      level = 'info';
      message = `Bridge ahead in ${closest.distanceMiles.toFixed(1)} miles - stay alert`;
    } else {
      level = 'none';
      message = 'All clear';
    }

    return {
      level,
      closestBridge: closest,
      distanceToClosest: closest.distanceMiles,
      message,
      allDangerousBridges: bridgesWithDistance
    };

  }, [currentPosition, bridges, vehicleHeight]);

  return alertState;
}