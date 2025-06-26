import FingerprintJS from '@fingerprintjs/fingerprintjs';

let fpPromise = null;

/**
 * Get a reliable browser fingerprint using FingerprintJS
 * @returns {Promise<string>} A unique fingerprint string
 */
export const getFingerprint = async () => {
  try {
    if (!fpPromise) {
      fpPromise = FingerprintJS.load();
    }
    
    const fp = await fpPromise;
    const result = await fp.get();
    return result.visitorId;
  } catch (error) {
    console.error('Error generating fingerprint:', error);
    // Fallback to a simple hash if fingerprinting fails
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
  }
};

/**
 * Get a cached fingerprint (returns the same fingerprint for the session)
 * @returns {Promise<string>} A unique fingerprint string
 */
export const getCachedFingerprint = (() => {
  let cachedFingerprint = null;
  
  return async () => {
    if (cachedFingerprint) {
      return cachedFingerprint;
    }
    
    cachedFingerprint = await getFingerprint();
    return cachedFingerprint;
  };
})(); 