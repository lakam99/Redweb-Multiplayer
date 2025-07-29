// input.js
import { PLAYER_SPEED } from "./config.js";

/**
 * @param {GameObj}   localPlayer
 * @param {Function}  getAngle          () => rad
 * @param {Function}  sendBroadcast     (vec2, rad) => void
 */
export function setupInput(localPlayer, getAngle, sendBroadcast) {
  function currentMoveVector() {
    return vec2(
      isKeyDown("d") - isKeyDown("a"),
      isKeyDown("s") - isKeyDown("w")
    ).unit().scale(PLAYER_SPEED);
  }

  /* Mouse rotation */
  onMouseMove(() => {
    const rad = getAngle();
    const dir = currentMoveVector();
    sendBroadcast(dir, rad);
  });

  /* Keyboard movement */
  const keys = ["w", "a", "s", "d"];

  onKeyPress(keys, () => {
    const rad = getAngle();
    sendBroadcast(currentMoveVector(), rad);
  });

  onKeyRelease(keys, () => {
    sendBroadcast(vec2(0, 0), getAngle());
  });
}
