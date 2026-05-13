/**
 * Sends each interaction as an email via Web3Forms (no custom server).
 *
 * Setup: https://web3forms.com — create a form, copy the access key, then set:
 *   VITE_WEB3FORMS_ACCESS_KEY=your_key_here
 *
 * Uses multipart FormData (same as Web3Forms’ official React example).
 */

const WEB3FORMS_URL = 'https://api.web3forms.com/submit';

function formatVisitorEventBody(payload) {
  const lines = [
    `action: ${payload.action}`,
    `visitorId: ${payload.visitorId}`,
    `deviceType: ${payload.deviceType}`,
    `timezone: ${payload.location?.timezone ?? ''}`,
    `utcOffsetMinutes: ${payload.location?.utcOffsetMinutes ?? ''}`,
    `locale: ${payload.location?.locale ?? ''}`,
    `page: ${payload.pageHref ?? ''}`,
    `capturedAt: ${payload.capturedAt ?? ''}`,
    '',
    'metadata (JSON):',
    JSON.stringify(payload.metadata ?? {}, null, 2),
  ];
  return lines.join('\n');
}

/**
 * @param {object} payload
 * @param {string} payload.action
 * @param {string} payload.visitorId
 * @param {'mobile'|'tablet'|'desktop'} payload.deviceType
 * @param {{ timezone?: string, utcOffsetMinutes?: number, locale?: string }} [payload.location]
 * @param {string} [payload.pageHref]
 * @param {string} [payload.capturedAt]
 * @param {Record<string, unknown>} [payload.metadata]
 * @returns {Promise<{ ok: boolean, skipped?: boolean }>}
 */
export async function sendVisitorEventEmail(payload) {
  const accessKey = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY;
  if (!accessKey) {
    if (import.meta.env.DEV) {
      console.warn(
        '[visitorAnalytics] VITE_WEB3FORMS_ACCESS_KEY is unset; email not sent:',
        payload.action,
      );
    }
    return { ok: false, skipped: true };
  }

  const message = formatVisitorEventBody(payload);

  const formData = new FormData();
  formData.append('access_key', accessKey);
  formData.append('subject', `[notaresume] ${payload.action}`);
  formData.append('from_name', 'Portfolio visitor');
  formData.append('message', message);

  const res = await fetch(WEB3FORMS_URL, {
    method: 'POST',
    body: formData,
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.success === false) {
    console.warn('[visitorAnalytics] Web3Forms error', res.status, json);
    return { ok: false };
  }
  return { ok: true };
}
