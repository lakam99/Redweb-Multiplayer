// world/WallMap.js
// Loads walls.json (tile map) and converts to merged rectangles for efficient collision.

const fs = require("fs");
const path = require("path");

function loadTileMap() {
  const p = path.join(__dirname, "..", "public", "world", "walls.json");
  const json = JSON.parse(fs.readFileSync(p, "utf-8"));
  return json;
}

function buildRectsFromTilemap(tilemap) {
  const { width, height, cellSize, data } = tilemap;
  const idx = (x, y) => y * width + x;

  // First, merge horizontal runs per row
  const runsPerRow = [];
  for (let y = 0; y < height; y++) {
    const runs = [];
    let x = 0;
    while (x < width) {
      while (x < width && data[idx(x, y)] === 0) x++;
      if (x >= width) break;
      const start = x;
      while (x < width && data[idx(x, y)] === 1) x++;
      const end = x; // exclusive
      runs.push({ x1: start, x2: end });
    }
    runsPerRow.push(runs);
  }

  // Then merge vertically aligned runs into rectangles
  const rects = [];
  let y = 0;
  while (y < height) {
    const rowRuns = runsPerRow[y];
    // For each run in this row, try to extend downward
    for (const run of rowRuns) {
      let y2 = y + 1;
      while (y2 < height) {
        const nextRow = runsPerRow[y2];
        const match = nextRow.find(r => r.x1 === run.x1 && r.x2 === run.x2);
        if (!match) break;
        // mark used to avoid duplicate processing
        nextRow.splice(nextRow.indexOf(match), 1);
        y2++;
      }
      const rect = {
        x: run.x1 * cellSize,
        y: y * cellSize,
        w: (run.x2 - run.x1) * cellSize,
        h: (y2 - y) * cellSize,
      };
      rects.push(rect);
    }
    y++;
  }
  return rects;
}

const tilemap = loadTileMap();
const WALL_RECTS = buildRectsFromTilemap(tilemap);
const BOUNDS = { width: tilemap.width * tilemap.cellSize, height: tilemap.height * tilemap.cellSize };
const HALF = 14; // half player size, keep sync with client

module.exports = { WALL_RECTS, BOUNDS, HALF, buildRectsFromTilemap, loadTileMap };
