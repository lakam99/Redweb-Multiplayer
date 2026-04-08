// WallMap.js (client)
// Fetches /world/walls.json and builds merged rects for drawing & collision.

export async function loadWallRects() {
  const res = await fetch("/world/walls.json");
  const tilemap = await res.json();
  const rects = buildRectsFromTilemap(tilemap);
  const bounds = { width: tilemap.width * tilemap.cellSize, height: tilemap.height * tilemap.cellSize };
  return { rects, bounds };
}

export function buildRectsFromTilemap(tilemap) {
  const { width, height, cellSize, data } = tilemap;
  const idx = (x, y) => y * width + x;

  // Horizontal runs per row
  const runsPerRow = [];
  for (let y = 0; y < height; y++) {
    const runs = [];
    let x = 0;
    while (x < width) {
      while (x < width && data[idx(x, y)] === 0) x++;
      if (x >= width) break;
      const start = x;
      while (x < width && data[idx(x, y)] === 1) x++;
      runs.push({ x1: start, x2: x });
    }
    runsPerRow.push(runs);
  }

  // Merge vertically aligned runs
  const rects = [];
  let y = 0;
  while (y < height) {
    const rowRuns = runsPerRow[y];
    for (const run of rowRuns) {
      let y2 = y + 1;
      while (y2 < height) {
        const nextRow = runsPerRow[y2];
        const matchIdx = nextRow.findIndex(r => r.x1 === run.x1 && r.x2 === run.x2);
        if (matchIdx === -1) break;
        nextRow.splice(matchIdx, 1);
        y2++;
      }
      rects.push({ x: run.x1*cellSize, y: y*cellSize, w: (run.x2-run.x1)*cellSize, h: (y2-y)*cellSize });
    }
    y++;
  }
  return rects;
}
