import { getCachedFingerprint } from '../../utils/fingerprintUtils';

/**
 * Coarse device class (no permission dialogs).
 * @returns {'mobile' | 'tablet' | 'desktop'}
 */
export function getDeviceType() {
  if (typeof navigator === 'undefined') return 'desktop';
  const ua = navigator.userAgent || '';
  const uaData = navigator.userAgentData;
  if (uaData && typeof uaData.mobile === 'boolean' && uaData.mobile) {
    return 'mobile';
  }
  const isIPad =
    navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
  if (/tablet|ipad|playbook|silk/i.test(ua) || isIPad) return 'tablet';
  if (
    /mobile|iphone|ipod|android.*mobile|blackberry|opera mini|iemobile/i.test(
      ua,
    )
  ) {
    return 'mobile';
  }
  return 'desktop';
}

/**
 * Location hints without GPS (no permission). IP-based geo stays server-side later.
 * @returns {{ timezone: string, utcOffsetMinutes: number, locale: string }}
 */
export function getLocationHints() {
  let timezone = '';
  try {
    timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
  } catch {
    timezone = '';
  }
  const locale =
    (typeof navigator !== 'undefined' && navigator.language) || '';
  const utcOffsetMinutes = -new Date().getTimezoneOffset();
  return { timezone, utcOffsetMinutes, locale };
}

/**
 * Snapshot used as keys for analytics / future DB rows.
 * @returns {Promise<{
 *   visitorId: string,
 *   deviceType: ReturnType<typeof getDeviceType>,
 *   location: ReturnType<typeof getLocationHints>,
 *   pageHref: string,
 *   capturedAt: string
 * }>}
 */
export async function getVisitorContext() {
  const visitorId = await getCachedFingerprint();
  return {
    visitorId,
    deviceType: getDeviceType(),
    location: getLocationHints(),
    pageHref: typeof window !== 'undefined' ? window.location.href : '',
    capturedAt: new Date().toISOString(),
  };
}
