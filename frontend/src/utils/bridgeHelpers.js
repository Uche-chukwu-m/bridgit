/**
 * Bridge clearance and safety utilities for BridgeGuardian
 */

import { CLEARANCE_THRESHOLDS } from './constants';

/**
 * Calculate clearance margin status for a bridge
 * @param {number} bridgeClearance - Bridge clearance in inches
 * @param {number} vehicleHeight - Vehicle height in inches
 * @returns {Object} Status object with class, text, and icon
 */
export function getClearanceStatus(bridgeClearance, vehicleHeight) {
  const margin = bridgeClearance - vehicleHeight;

  if (margin < CLEARANCE_THRESHOLDS.CRITICAL) {
    return {
      statusClass: 'bg-red-100 text-red-900 border-red-300',
      statusText: 'WILL NOT FIT',
      statusIcon: '🚫',
      margin,
      severity: 'critical'
    };
  } else if (margin < CLEARANCE_THRESHOLDS.DANGER) {
    return {
      statusClass: 'bg-orange-100 text-orange-900 border-orange-300',
      statusText: 'VERY TIGHT',
      statusIcon: '⚠️',
      margin,
      severity: 'danger'
    };
  } else if (margin < CLEARANCE_THRESHOLDS.WARNING) {
    return {
      statusClass: 'bg-yellow-100 text-yellow-900 border-yellow-300',
      statusText: 'TIGHT',
      statusIcon: '⚠️',
      margin,
      severity: 'warning'
    };
  } else {
    return {
      statusClass: 'bg-green-100 text-green-900 border-green-300',
      statusText: 'SAFE',
      statusIcon: '✅',
      margin,
      severity: 'safe'
    };
  }
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {number} lat1 - Latitude of point 1
 * @param {number} lon1 - Longitude of point 1
 * @param {number} lat2 - Latitude of point 2
 * @param {number} lon2 - Longitude of point 2
 * @returns {number} Distance in miles
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 3959; // Earth's radius in miles
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon/2) * Math.sin(dLon/2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

/**
 * Convert degrees to radians
 * @param {number} degrees
 * @returns {number} Radians
 */
function toRad(degrees) {
  return degrees * (Math.PI / 180);
}
