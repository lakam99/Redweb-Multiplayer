// input.js
export function setupInput(k, localPlayer, faceRad, broadcastState, shootCallback) {
    const { onClick, onMouseMove, onKeyPress, onKeyRelease, isKeyDown, mousePos, vec2 } = k;
  
    function getMoveVec() {
      return vec2(isKeyDown("d") - isKeyDown("a"), isKeyDown("s") - isKeyDown("w")).unit().scale(k.PLAYER_SPEED);
    }
  
    onMouseMove(() => {
      const rad = Math.atan2(mousePos().y - localPlayer.pos.y, mousePos().x - localPlayer.pos.x);
      localPlayer.angle = rad * 180 / Math.PI;
      faceRad.value = rad;
  
      broadcastState(getMoveVec(), rad);
    });
  
    onKeyPress(["w", "a", "s", "d"], () => broadcastState(getMoveVec(), faceRad.value));
    onKeyRelease(["w", "a", "s", "d"], () => broadcastState(vec2(0, 0), faceRad.value));
  
    onClick(() => shootCallback?.());
  }
  