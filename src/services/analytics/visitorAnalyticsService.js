import { getVisitorContext } from './visitorContext';
import { reportVisitorInteractionToBackend } from './backends/analyticsBackendClient';

/**
 * High-level visitor analytics. Today: email each interaction via {@link sendVisitorEventEmail}.
 *
 * Future backend (replace email adapter):
 * - Table `visitor_interactions`: visitor_id, device_type, timezone, locale, utc_offset_minutes,
 *   action (text), metadata (jsonb), page_href, created_at
 * - UNIQUE(visitor_id) or partial unique for `contact.like` only if you enforce one like server-side
 *
 * Contact form messages stay in `contact_messages` (already used); optional: also emit
 * `contact.message.sent` here for a unified event stream (email today, row tomorrow).
 *
 * @param {string} action Dot-separated id, e.g. `contact.click.github`
 * @param {Record<string, unknown>} [metadata]
 * @returns {Promise<void>}
 */
export async function trackVisitorInteraction(action, metadata = {}) {
  try {
    const ctx = await getVisitorContext();
    const payload = {
      action,
      visitorId: ctx.visitorId,
      deviceType: ctx.deviceType,
      location: ctx.location,
      pageHref: ctx.pageHref,
      capturedAt: new Date().toISOString(),
      metadata,
    };
    await reportVisitorInteractionToBackend(payload);
  } catch (err) {
    console.warn('[visitorAnalytics] trackVisitorInteraction failed', action, err);
  }
}
