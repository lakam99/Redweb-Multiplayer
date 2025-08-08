// world/World.js
const { WALL_RECTS, BOUNDS, HALF } = require('./WallMap');
const { rectsOverlap } = require('./Geometry');

function resolveAABBAgainstWalls(aabb, walls = WALL_RECTS) {
  // minimal push-out: test against all rects (wall rects are already merged)
  let corrected = { ...aabb };
  for (const w of walls) {
    if (!rectsOverlap(corrected, w)) continue;

    const left   = (corrected.x + corrected.w) - w.x;
    const right  = (w.x + w.w) - corrected.x;
    const top    = (corrected.y + corrected.h) - w.y;
    const bottom = (w.y + w.h) - corrected.y;

    const minPen = Math.min(left, right, top, bottom);
    if (minPen === left)   corrected.x -= left;
    else if (minPen === right)  corrected.x += right;
    else if (minPen === top)    corrected.y -= top;
    else if (minPen === bottom) corrected.y += bottom;
  }
  return corrected;
}

function clampToBounds(pos, width = BOUNDS.width, height = BOUNDS.height, half = HALF) {
  return {
    x: Math.min(width - half, Math.max(half, pos.x)),
    y: Math.min(height - half, Math.max(half, pos.y)),
  };
}

module.exports = { resolveAABBAgainstWalls, clampToBounds };
