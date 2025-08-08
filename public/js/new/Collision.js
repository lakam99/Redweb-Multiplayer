// Collision.js
export function rectsOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

export function resolveAABBAgainstWalls(aabb, walls) {
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

export function clampToBounds(pos, width=800, height=600, half=14) {
  return {
    x: Math.min(width - half, Math.max(half, pos.x)),
    y: Math.min(height - half, Math.max(half, pos.y)),
  };
}
