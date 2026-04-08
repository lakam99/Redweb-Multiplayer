// VFXConfig.js
// Centralized visual FX toggles & per-weapon styles.

export const VFX = {
  enabled: true,
  performanceMode: false, // if true, disable costly VFX (tracers / sparks)
  defaultWeapon: "rifle",
  perWeapon: {
    rifle: {
      tracerWidth: 2,
      tracerLife: 0.10,
      tracerColor: [255, 255, 255],
      sparkLife: 0.10,
      sparkColor: [255, 240, 180],
      sparkRadius: 6,
    },
    pistol: {
      tracerWidth: 2,
      tracerLife: 0.06,
      tracerColor: [200, 220, 255],
      sparkLife: 0.06,
      sparkColor: [255, 220, 160],
      sparkRadius: 5,
    },
    smg: {
      tracerWidth: 1,
      tracerLife: 0.05,
      tracerColor: [200, 255, 200],
      sparkLife: 0.05,
      sparkColor: [255, 235, 180],
      sparkRadius: 4,
    },
  },
};
