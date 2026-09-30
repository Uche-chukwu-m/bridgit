import { MILE, speakHeight } from './units';

export const OFF_ROUTE_M = 75;
const NEAR_M = 400; // about a quarter mile

/** How loudly to warn about a clearance this far ahead: null, 'mile' or 'near'. */
export function alertStage(distance) {
  if (distance <= NEAR_M) return 'near';
  if (distance <= MILE) return 'mile';
  return null;
}

/** What to say out loud. */
export function announcement(clearance, stage) {
  const height = speakHeight(clearance.clearance_in);
  if (clearance.status === 'blocked') {
    return `Warning. Clearance ${stage === 'near' ? 'ahead' : 'in one mile'} is ${height}. Your vehicle will not fit. Stop and find another way.`;
  }
  const spare = Math.max(0, clearance.spare_in);
  const room = spare === 1 ? '1 inch' : `${spare} inches`;
  if (stage === 'near') return `Low clearance ahead. ${height}. ${room} to spare.`;
  return `Low clearance in one mile. ${height}. You have ${room} to spare.`;
}
