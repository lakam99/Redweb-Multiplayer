// PlayerInputManager.js

import Net from "./Net.js";

export function setupPlayerInput(k, localPlayer, getFaceRad, onShoot) {
  const { onMouseMove, onKeyPress, onKeyRelease, isKeyDown, mousePos, vec2, onUpdate } = k;

  function getMoveVec() {
    return vec2(
      (isKeyDown("d") ? 1 : 0) - (isKeyDown("a") ? 1 : 0),
      (isKeyDown("s") ? 1 : 0) - (isKeyDown("w") ? 1 : 0)
    ).unit();
  }

  onMouseMove(() => {
    const rad = Math.atan2(mousePos().y - localPlayer.position.y, mousePos().x - localPlayer.position.x);
    localPlayer.setAngle(rad);
    Net.send("move", { angle: rad });
  });

  function updateVector() {
    const mv = getMoveVec();
    localPlayer.setVector(mv);
    Net.send("move", { vector: { x: mv.x, y: mv.y } });
  }

  onKeyPress(["w","a","s","d"], updateVector);
  onKeyRelease(["w","a","s","d"], updateVector);

  onUpdate(() => {
    localPlayer.update(0); // sync sprite angle etc
  });

  k.onClick(() => onShoot?.());
}
