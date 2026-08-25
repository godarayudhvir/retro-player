/**
 * Universal In-Browser Image Converter
 * Converts remote URLs, Blobs, and Files to optimized WebP format via HTML5 Canvas.
 * 100% compatible with GitHub Pages, Mobile Safari, Android, and Desktop browsers.
 */

/**
 * Converts a remote image URL to an optimized WebP Base64 Data URL.
 * Falls back gracefully to the original URL if canvas conversion is blocked (e.g. strict CORS).
 *
 * @param {string} url - Remote image URL (e.g. Libretro CDN, ScreenScraper, TheGamesDB, Wikipedia)
 * @param {number} maxWidth - Max width in pixels (aspect ratio preserved)
 * @param {number} quality - WebP compression quality (0.0 to 1.0, default 0.85)
 * @returns {Promise<string>} WebP Data URL or fallback URL
 */
export async function convertRemoteImageToWebpDataUrl(url, maxWidth = 600, quality = 0.85) {
  if (!url || typeof url !== 'string') return url;

  // Already a WebP data URL
  if (url.startsWith('data:image/webp')) {
    return url;
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(url);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Export as WebP
        const webpDataUrl = canvas.toDataURL('image/webp', quality);
        
        // If browser does not support WebP export in canvas, it falls back to PNG/JPEG data URL
        if (webpDataUrl.startsWith('data:image/webp') || webpDataUrl.startsWith('data:image/')) {
          resolve(webpDataUrl);
        } else {
          resolve(url);
        }
      } catch (err) {
        console.warn('⚠️ [WEBP CANVAS CONVERT] Fallback to direct URL due to CORS/Canvas error:', err);
        resolve(url);
      }
    };

    img.onerror = () => {
      resolve(url);
    };

    // If it's a relative URL or remote URL
    img.src = url;
  });
}

/**
 * Converts a browser File or Blob (e.g. from file input upload) to an optimized WebP Base64 Data URL.
 *
 * @param {File|Blob} file - Uploaded image File or Blob
 * @param {number} maxWidth - Max width in pixels
 * @param {number} quality - WebP compression quality (0.0 to 1.0, default 0.85)
 * @returns {Promise<string>} WebP Data URL
 */
export async function convertFileToWebpDataUrl(file, maxWidth = 600, quality = 0.85) {
  if (!file) return null;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      const img = new Image();
      img.onload = () => {
        try {
          let width = img.naturalWidth || img.width;
          let height = img.naturalHeight || img.height;

          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(dataUrl);
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          const webpDataUrl = canvas.toDataURL('image/webp', quality);
          resolve(webpDataUrl);
        } catch (err) {
          console.warn('⚠️ [FILE WEBP CONVERT] Fallback to raw dataUrl:', err);
          resolve(dataUrl);
        }
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}
