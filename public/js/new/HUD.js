// HUD.js
// Minimal, modular HUD for weapon/VFX status

import { VFX } from "./VFXConfig.js";

export class HUD {
  constructor() {
    // weapon label
    this.weaponRef = add([
      text({ text: "Weapon: " + (VFX.defaultWeapon || "rifle") }),
      pos(10, 10),
      anchor("topleft"),
      color(255,255,255),
      z(1000),
    ]);

    // vfx label
    this.vfxRef = add([
      text({ text: "VFX: " + (VFX.performanceMode ? "Perf" : "On") }),
      pos(10, 32),
      anchor("topleft"),
      color(200,200,200),
      z(1000),
    ]);
  }

  setWeapon(weapon) {
    if (!this.weaponRef) return;
    this.weaponRef.text = "Weapon: " + weapon;
  }

  setVFX(perfMode) {
    if (!this.vfxRef) return;
    this.vfxRef.text = "VFX: " + (perfMode ? "Perf" : "On");
  }
}
