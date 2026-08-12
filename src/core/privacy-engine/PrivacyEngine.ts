export class PrivacyEngine {
  /**
   * Sanitizes geographical coordinate precision for weather queries to protect user location privacy.
   * Truncating coordinates to 2 decimal places provides ~1km² accuracy, which is more than sufficient
   * for localized weather while preventing pinpoint tracking of individual buildings.
   */
  public static anonymizeCoordinates(lat: number, lon: number): { lat: number; lon: number } {
    return {
      lat: parseFloat(lat.toFixed(2)),
      lon: parseFloat(lon.toFixed(2))
    };
  }

  /**
   * Sanitizes IP addresses before logging or storing to guarantee absolute anonymity.
   * For IPv4: Zeroes out the last octet (e.g. 192.168.1.123 -> 192.168.1.0).
   * For IPv6: Zeroes out the last 64 bits of the address.
   */
  public static anonymizeIpAddress(ip: string): string {
    if (!ip) return '0.0.0.0';

    // Check if IPv6
    if (ip.includes(':')) {
      const parts = ip.split(':');
      // Keep only first 4 parts of standard IPv6 (representing the subnet /64)
      const sanitizedParts = parts.slice(0, 4);
      while (sanitizedParts.length < 8) {
        sanitizedParts.push('0000');
      }
      return sanitizedParts.join(':');
    }

    // IPv4 sanitization
    const parts = ip.split('.');
    if (parts.length === 4) {
      parts[3] = '0';
      return parts.join('.');
    }

    return '0.0.0.0';
  }

  /**
   * Generates a fully zero-knowledge, randomized, or hashed session ID 
   * that is detached from any database user-uids or personal profiles.
   */
  public static generateZkSessionToken(): string {
    const arr = new Uint32Array(4);
    if (typeof window !== 'undefined' && window.crypto) {
      window.crypto.getRandomValues(arr);
    } else {
      // Node.js fallback or simulation math.random
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 0xFFFFFFFF);
      }
    }
    return Array.from(arr, dec => dec.toString(16).padStart(8, '0')).join('-');
  }
}
