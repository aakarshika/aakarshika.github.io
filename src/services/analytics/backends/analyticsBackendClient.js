import { sendVisitorEventEmail } from './emailAnalyticsBackend';

/**
 * Single choke-point for persistence of visitor interactions.
 * Swap implementation here when Supabase `visitor_interactions` exists (or dual-write).
 *
 * @param {object} payload Visitor interaction payload (action, visitorId, deviceType, …).
 */
export async function reportVisitorInteractionToBackend(payload) {
  return sendVisitorEventEmail(payload);
}
