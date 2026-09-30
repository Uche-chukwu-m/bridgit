// Formatting for US drivers. Heights are inches; distances metres; durations seconds.

const METRES_PER_MILE = 1609.344;
const FEET_PER_METRE = 3.28084;

export function splitHeight(inches) {
  const whole = Math.floor(inches);
  return { feet: Math.floor(whole / 12), inches: whole % 12 };
}

/** 148 -> 12′ 4″ */
export function formatHeight(inches) {
  const { feet, inches: rest } = splitHeight(inches);
  return `${feet}′ ${rest}″`;
}

/** 148 -> "12 feet 4 inches", for speech. */
export function speakHeight(inches) {
  const { feet, inches: rest } = splitHeight(inches);
  return rest ? `${feet} feet ${rest} inches` : `${feet} feet`;
}

/** Spare room: 10 -> 10″, 14 -> 1′ 2″ */
export function formatSpare(inches) {
  return inches >= 12 ? formatHeight(inches) : `${Math.max(0, Math.floor(inches))}″`;
}

export function formatDistance(metres) {
  const miles = metres / METRES_PER_MILE;
  if (miles >= 10) return `${Math.round(miles)} mi`;
  if (miles >= 0.1) return `${miles.toFixed(1)} mi`;
  return `${Math.max(0, Math.round((metres * FEET_PER_METRE) / 50) * 50)} ft`;
}

export function formatDuration(seconds) {
  const minutes = Math.max(1, Math.round(seconds / 60));
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours} h ${rest} min` : `${hours} h`;
}

export const MILE = METRES_PER_MILE;
