/**
 * Session-scoped “already liked” for the current FingerprintJS visitorId.
 * Uses sessionStorage + a first-party session cookie (no Max-Age = browser session;
 * no consent banners for strictly necessary first-party session cookies in typical setups).
 *
 * Server-side UNIQUE(visitor_id) will enforce one like per browser when you add the backend.
 */

const SS_KEY = 'notaresume_contact_simple_like_visitor_id';
const COOKIE_NAME = 'notaresume_sl_sess';

function readCookie(name) {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  if (!match) return null;
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return match[1];
  }
}

/** Session cookie: omit Max-Age so it clears when the browser session ends. */
function writeSessionCookie(name, value) {
  if (typeof document === 'undefined') return;
  const encoded = encodeURIComponent(value);
  const secure =
    typeof location !== 'undefined' && location.protocol === 'https:';
  document.cookie = `${name}=${encoded};path=/;SameSite=Lax${secure ? ';Secure' : ''}`;
}

export function hasSessionLikeForFingerprint(fp) {
  if (!fp) return false;
  try {
    if (sessionStorage.getItem(SS_KEY) === fp) return true;
  } catch {
    /* blocked */
  }
  return readCookie(COOKIE_NAME) === fp;
}

export function setSessionLikeForFingerprint(fp) {
  if (!fp) return;
  try {
    sessionStorage.setItem(SS_KEY, fp);
  } catch {
    /* blocked */
  }
  try {
    writeSessionCookie(COOKIE_NAME, fp);
  } catch {
    /* blocked */
  }
}
