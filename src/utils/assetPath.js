/**
 * Universal static asset path resolver.
 * Ensures relative path resolution for GitHub Pages repository subpaths (e.g. /retro-player/)
 * as well as root domain / localhost environments.
 * 
 * @param {string} path - Absolute or relative asset URL
 * @returns {string} - Subpath-aware asset URL
 */
export function resolveAssetPath(path) {
  if (!path) return '';
  
  // Return early for external URLs, Blob URLs, and Data URIs
  if (
    path.startsWith('http://') ||
    path.startsWith('https://') ||
    path.startsWith('blob:') ||
    path.startsWith('data:')
  ) {
    return path;
  }

  // Strip leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  const baseUrl = import.meta.env.BASE_URL || './';
  
  // Normalize double slashes
  const normalizedBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  return `${normalizedBase}${cleanPath}`;
}
