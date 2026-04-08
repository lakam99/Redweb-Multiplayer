// world/Geometry.js
// Basic ray-vs-rect and rect overlap helpers.

function rectsOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

// Ray vs AABB using slabs (returns tMin if hit, else null)
function raycastRect(origin, dir, rect) {
  const invX = 1 / (dir.x || 1e-12);
  const invY = 1 / (dir.y || 1e-12);

  const t1 = (rect.x - origin.x) * invX;
  const t2 = ((rect.x + rect.w) - origin.x) * invX;
  const t3 = (rect.y - origin.y) * invY;
  const t4 = ((rect.y + rect.h) - origin.y) * invY;

  const tmin = Math.max(Math.min(t1, t2), Math.min(t3, t4));
  const tmax = Math.min(Math.max(t1, t2), Math.max(t3, t4));

  if (tmax < 0) return null;      // behind origin
  if (tmin > tmax) return null;   // no overlap

  const hitT = tmin >= 0 ? tmin : tmax; // if inside, exit at tmax
  if (hitT < 0) return null;
  return hitT;
}

function raycastAgainstRects(origin, dir, rects, maxDist = Infinity) {
  let bestT = maxDist;
  let best = null;
  for (const r of rects) {
    const t = raycastRect(origin, dir, r);
    if (t != null && t < bestT && t >= 0) {
      bestT = t;
      best = { rect: r, t };
    }
  }
  if (!best) return null;
  return { t: bestT, point: { x: origin.x + dir.x * bestT, y: origin.y + dir.y * bestT }, rect: best.rect };
}

module.exports = { rectsOverlap, raycastRect, raycastAgainstRects };
