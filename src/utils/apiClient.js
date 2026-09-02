/**
 * Subpath-Aware API Fetch Client.
 * Ensures API endpoints resolve reliably across Tri-Environment deployments:
 * 1. Local development (http://localhost:3000/api/...)
 * 2. Self-hosted Docker root (http://<server-ip>:3000/api/...)
 * 3. GitHub Pages subpath (https://<user>.github.io/retro-player/api/...)
 */

/**
 * Resolves an endpoint relative to the configured application base path.
 * 
 * @param {string} endpoint - API path (e.g. '/api/db/export' or 'api/db/export')
 * @returns {string} - Subpath-prefixed API URL
 */
export function getApiUrl(endpoint) {
  if (!endpoint) return '';
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    return endpoint;
  }
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  const baseUrl = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.BASE_URL) || './';
  const normalizedBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  return `${normalizedBase}${cleanEndpoint}`;
}

/**
 * Universal wrapper around native fetch that prefixes endpoints with the application base path.
 * 
 * @param {string} endpoint - API route path
 * @param {RequestInit} [options] - Standard fetch options
 * @returns {Promise<Response>} - Fetch response promise
 */
export async function apiFetch(endpoint, options = {}) {
  const url = getApiUrl(endpoint);
  return fetch(url, options);
}
