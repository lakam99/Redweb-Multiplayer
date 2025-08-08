// utils.js

export function radToDeg(r) { return r * 180 / Math.PI; }
export function degToRad(d) { return d * Math.PI / 180; }
export function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
export function lerp(a, b, t) { return a + (b - a) * t; }

// Shortest-path angle interpolation (radians)
export function lerpAngle(a, b, t) {
  const TAU = Math.PI * 2;
  let diff = (b - a) % TAU;
  if (diff > Math.PI) diff -= TAU;
  if (diff < -Math.PI) diff += TAU;
  return a + diff * t;
}

export function randId(len = 8) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let out = '';
  for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}
