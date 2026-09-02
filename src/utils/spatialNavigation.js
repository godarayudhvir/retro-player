/**
 * 2D Geometric Spatial Navigation Engine for Retro Player.
 * Uses Bounding Client Rect vector projection and cross-axis alignment scoring.
 */

/**
 * Calculates geometric distance and overlap score between currentRect and candRect in a given direction.
 * Lower score = better candidate. Returns Infinity if candidate is not in the directional cone.
 *
 * @param {DOMRect} currRect - Bounding rect of current focused element
 * @param {DOMRect} candRect - Bounding rect of candidate element
 * @param {'UP'|'DOWN'|'LEFT'|'RIGHT'} direction - Navigation direction
 * @returns {number} Score (Infinity if invalid)
 */
export function calculateSpatialScore(currRect, candRect, direction) {
  const TOLERANCE = 4; // Subpixel tolerance
  const currCenterX = (currRect.left + currRect.right) / 2;
  const currCenterY = (currRect.top + currRect.bottom) / 2;
  const candCenterX = (candRect.left + candRect.right) / 2;
  const candCenterY = (candRect.top + candRect.bottom) / 2;

  let primaryDist = 0;
  let crossDist = 0;
  let overlap = 0;

  switch (direction) {
    case 'RIGHT': {
      if (candRect.left < currRect.left + TOLERANCE || candCenterX <= currCenterX) {
        return Infinity;
      }
      primaryDist = Math.max(0, candRect.left - currRect.right);
      crossDist = Math.abs(candCenterY - currCenterY);
      const top = Math.max(currRect.top, candRect.top);
      const bottom = Math.min(currRect.bottom, candRect.bottom);
      overlap = Math.max(0, bottom - top);
      break;
    }
    case 'LEFT': {
      if (candRect.right > currRect.right - TOLERANCE || candCenterX >= currCenterX) {
        return Infinity;
      }
      primaryDist = Math.max(0, currRect.left - candRect.right);
      crossDist = Math.abs(candCenterY - currCenterY);
      const top = Math.max(currRect.top, candRect.top);
      const bottom = Math.min(currRect.bottom, candRect.bottom);
      overlap = Math.max(0, bottom - top);
      break;
    }
    case 'DOWN': {
      if (candRect.top < currRect.top + TOLERANCE || candCenterY <= currCenterY) {
        return Infinity;
      }
      primaryDist = Math.max(0, candRect.top - currRect.bottom);
      crossDist = Math.abs(candCenterX - currCenterX);
      const left = Math.max(currRect.left, candRect.left);
      const right = Math.min(currRect.right, candRect.right);
      overlap = Math.max(0, right - left);
      break;
    }
    case 'UP': {
      if (candRect.bottom > currRect.bottom - TOLERANCE || candCenterY >= currCenterY) {
        return Infinity;
      }
      primaryDist = Math.max(0, currRect.top - candRect.bottom);
      crossDist = Math.abs(candCenterX - currCenterX);
      const left = Math.max(currRect.left, candRect.left);
      const right = Math.min(currRect.right, candRect.right);
      overlap = Math.max(0, right - left);
      break;
    }
    default:
      return Infinity;
  }

  // Candidates with direct line-of-sight cross-axis overlap receive priority
  if (overlap > 0) {
    const minCrossSpan = Math.min(
      direction === 'LEFT' || direction === 'RIGHT' ? currRect.height : currRect.width,
      direction === 'LEFT' || direction === 'RIGHT' ? candRect.height : candRect.width
    );
    const overlapRatio = minCrossSpan > 0 ? overlap / minCrossSpan : 0;
    return primaryDist + crossDist * 0.4 - (overlapRatio * 15);
  }

  // Off-axis candidates receive angular penalty
  return primaryDist + (crossDist * 2.2) + 60;
}

/**
 * Finds the best next navigable DOM element in a direction from currentEl within container.
 *
 * @param {Object} options
 * @param {HTMLElement} options.container - Container to search within (modal, view, etc.)
 * @param {HTMLElement} options.currentEl - Currently focused element
 * @param {'UP'|'DOWN'|'LEFT'|'RIGHT'} options.direction - Direction to move
 * @param {string} [options.selector='[data-nav]'] - CSS selector for navigable candidates
 * @returns {HTMLElement|null} Best candidate element or null
 */
export function findNextSpatialElement({ container, currentEl, direction, selector = '[data-nav]' }) {
  if (!container) return null;
  const currRect = currentEl ? currentEl.getBoundingClientRect() : null;
  if (!currRect) return null;

  const candidates = Array.from(container.querySelectorAll(selector)).filter((el) => {
    if (el === currentEl || el.disabled || el.getAttribute('aria-disabled') === 'true') {
      return false;
    }
    const style = window.getComputedStyle(el);
    if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
      return false;
    }
    const rect = el.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  });

  let bestEl = null;
  let minScore = Infinity;

  for (const candEl of candidates) {
    const candRect = candEl.getBoundingClientRect();
    const score = calculateSpatialScore(currRect, candRect, direction);
    if (score < minScore) {
      minScore = score;
      bestEl = candEl;
    }
  }

  return bestEl;
}
