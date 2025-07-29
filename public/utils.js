// utils.js

export function radToDeg(r) {
    return r * 180 / Math.PI;
  }
  
  export function degToRad(d) {
    return d * Math.PI / 180;
  }
  
  export function lerp(a, b, t) {
    return a + (b - a) * t;
  }
  
  export function lerpVec2(a, b, t) {
    return vec2(
      lerp(a.x, b.x, t),
      lerp(a.y, b.y, t)
    );
  }
  
  export function lerpAngle(a, b, t) {
    const delta = (((b - a) % (Math.PI * 2)) + Math.PI * 3) % (Math.PI * 2) - Math.PI;
    return a + delta * t;
  }
  