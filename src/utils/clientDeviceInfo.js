/**
 * Portable client / device hints for analytics or backend heuristics.
 *
 * - Same GPU often reports similar WebGL vendor/renderer strings in Chrome vs Firefox;
 *   combined with screen size, timezone, and hardwareConcurrency this can suggest
 *   “same machine” — expect false positives (cafés, identical laptops) and misses
 *   (virtual machines, privacy tweaks). Not a substitute for login.
 */

function readWebGLStrings() {
  if (typeof document === 'undefined') return null;
  try {
    const canvas = document.createElement('canvas');
    const gl =
      canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl');
    if (!gl) return null;

    const dbg = gl.getExtension('WEBGL_debug_renderer_info');
    if (dbg) {
      return {
        vendor: gl.getParameter(dbg.UNMASKED_VENDOR_WEBGL) ?? '',
        renderer: gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) ?? '',
      };
    }
    return {
      vendor: gl.getParameter(gl.VENDOR) ?? '',
      renderer: gl.getParameter(gl.RENDERER) ?? '',
    };
  } catch {
    return null;
  }
}

/**
 * @returns {Record<string, unknown>} JSON-serializable snapshot (sync).
 */
export function getClientDeviceInfo() {
  const nav = typeof navigator !== 'undefined' ? navigator : {};
  const scr = typeof screen !== 'undefined' ? screen : {};
  const win = typeof window !== 'undefined' ? window : {};

  let prefersReducedMotion = null;
  try {
    prefersReducedMotion = win.matchMedia?.('(prefers-reduced-motion: reduce)')
      ?.matches;
  } catch {
    prefersReducedMotion = null;
  }

  return {
    userAgent: typeof nav.userAgent === 'string' ? nav.userAgent : '',
    platform: typeof nav.platform === 'string' ? nav.platform : '',
    hardwareConcurrency:
      typeof nav.hardwareConcurrency === 'number'
        ? nav.hardwareConcurrency
        : null,
    /** Chromium only; `undefined` in Firefox/Safari */
    deviceMemory:
      typeof nav.deviceMemory === 'number' ? nav.deviceMemory : null,
    language: typeof nav.language === 'string' ? nav.language : '',
    languages: Array.isArray(nav.languages) ? [...nav.languages] : [],
    timezone: (() => {
      try {
        return Intl.DateTimeFormat().resolvedOptions().timeZone ?? '';
      } catch {
        return '';
      }
    })(),
    screen: {
      width: scr.width ?? null,
      height: scr.height ?? null,
      availWidth: scr.availWidth ?? null,
      availHeight: scr.availHeight ?? null,
      colorDepth: scr.colorDepth ?? null,
      pixelRatio:
        typeof win.devicePixelRatio === 'number' ? win.devicePixelRatio : null,
    },
    touch: {
      maxTouchPoints:
        typeof nav.maxTouchPoints === 'number' ? nav.maxTouchPoints : 0,
    },
    prefersReducedMotion,
    webgl: readWebGLStrings(),
  };
}

/**
 * Merges User-Agent Client Hints when the browser supports them (mainly Chromium).
 * @param {ReturnType<typeof getClientDeviceInfo>} base
 * @returns {Promise<Record<string, unknown>>}
 */
export async function enrichDeviceInfoWithUserAgentData(base) {
  const ua = typeof navigator !== 'undefined' ? navigator.userAgentData : null;
  if (!ua || typeof ua.getHighEntropyValues !== 'function') {
    return base;
  }
  try {
    const high = await ua.getHighEntropyValues([
      'architecture',
      'bitness',
      'model',
      'platform',
      'platformVersion',
      'fullVersionList',
    ]);
    return {
      ...base,
      userAgentData: {
        brands: ua.brands ?? null,
        mobile: !!ua.mobile,
        platform: ua.platform ?? '',
        ...high,
      },
    };
  } catch {
    return base;
  }
}
