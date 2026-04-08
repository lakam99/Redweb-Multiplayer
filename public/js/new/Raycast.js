// Raycast.js (client)
// Same math as server, for immediate visuals.

export function raycastRect(origin, dir, rect) {
  const invX = 1 / (dir.x || 1e-12);
  const invY = 1 / (dir.y || 1e-12);

  const t1 = (rect.x - origin.x) * invX;
  const t2 = ((rect.x + rect.w) - origin.x) * invX;
  const t3 = (rect.y - origin.y) * invY;
  const t4 = ((rect.y + rect.h) - origin.y) * invY;

  const tmin = Math.max(Math.min(t1, t2), Math.min(t3, t4));
  const tmax = Math.min(Math.max(t1, t2), Math.max(t3, t4));

  if (tmax < 0) return null;
  if (tmin > tmax) return null;

  const hitT = tmin >= 0 ? tmin : tmax;
  if (hitT < 0) return null;
  return hitT;
}

export function raycastAgainstRects(origin, dir, rects, maxDist = Infinity) {
  let bestT = maxDist;
  let best = null;
  for (const r of rects) {
    const t = raycastRect(origin, dir, r);
    if (t != null && t < bestT && t >= 0) {
      bestT = t;
      best = r;
    }
  }
  if (best == null) return null;
  return { t: bestT, point: { x: origin.x + dir.x * bestT, y: origin.y + dir.y * bestT }, rect: best };
}
