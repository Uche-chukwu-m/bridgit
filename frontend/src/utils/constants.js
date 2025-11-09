/**
 * Shared constants for BridgeGuardian application
 */

/**
 * Clearance margin thresholds (in inches)
 * Used to determine safety status of bridge clearances
 */
export const CLEARANCE_THRESHOLDS = {
  CRITICAL: 0,    // Vehicle won't fit (margin < 0)
  DANGER: 4,      // Very tight clearance (margin < 4 inches)
  WARNING: 6,     // Tight clearance (margin < 6 inches)
  SAFE: Infinity  // Comfortable clearance (margin >= 6 inches)
};

/**
 * Alert level configurations for route monitoring
 */
export const ALERT_CONFIGS = {
  none: {
    bg: 'bg-gray-100',
    border: 'border-gray-300',
    text: 'text-gray-800',
    icon: '📍'
  },
  info: {
    bg: 'bg-blue-500',
    border: 'border-blue-600',
    text: 'text-white',
    icon: '📍'
  },
  warning: {
    bg: 'bg-yellow-500',
    border: 'border-yellow-600',
    text: 'text-white',
    icon: '⚠️'
  },
  critical: {
    bg: 'bg-red-500 animate-pulse',
    border: 'border-red-700',
    text: 'text-white',
    icon: '🚨'
  },
  emergency: {
    bg: 'bg-red-700 animate-pulse',
    border: 'border-red-900',
    text: 'text-white',
    icon: '🛑'
  }
};

/**
 * Common vehicle heights (in inches)
 * Reference values for vehicle analysis
 */
export const VEHICLE_HEIGHTS = {
  'U-Haul 10\'': 83,
  'U-Haul 15\'': 150,
  'U-Haul 20\'': 162,
  'Penske 16\'': 152,
  'Class A RV': 156,  // Average
  'Class C RV': 135,  // Average
  'Box Truck': 155,   // Average
  'Pickup': 75        // Average
};

/**
 * Famous low-clearance bridges
 */
export const NOTORIOUS_BRIDGES = {
  STORROW_DRIVE: {
    name: 'Storrow Drive',
    clearance: 126, // 10'6"
    location: 'Boston, MA'
  },
  ELEVEN_FOOT_EIGHT: {
    name: '11 Foot 8 Bridge',
    clearance: 148, // 12'4" (now 12'8" after raising)
    location: 'Durham, NC'
  }
};
