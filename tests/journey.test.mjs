import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

// Compile the actual pure world/navigation modules in memory, without a browser.
async function sourceModule(name) {
  const source = await readFile(new URL(`../components/gamified/pixel/${name}.ts`, import.meta.url), "utf8");
  const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 } });
  return import(`data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`);
}
const world = await sourceModule("world");
const { findPath, interactionGoals } = await sourceModule("pathfinding");
const { carriageTexture, connectorTexture } = await sourceModule("pixelAssets");
const train = world.createWorld("train");
const station = world.createWorld("station");

function validRoute(grid, start, path) {
  assert.notEqual(path, null, "a route must exist");
  let previous = start;
  for (const cell of path) {
    assert.equal(world.isWalkable(grid, cell), true, "routes cannot enter solids");
    assert.equal(Math.abs(previous.x - cell.x) + Math.abs(previous.y - cell.y), 1, "route steps must be cardinal and adjacent");
    previous = cell;
  }
  return previous;
}

test("all five carriages are connected in both directions", () => {
  for (const origin of world.CARRIAGES) for (const destination of world.CARRIAGES) {
    const start = world.toCell(...Object.values(world.carriageSpawn(origin.id)));
    const goal = world.toCell(...Object.values(world.carriageSpawn(destination.id)));
    assert.deepEqual(validRoute(train.grid, start, findPath(train.grid, start, [goal])), goal);
  }
});
test("every interactive object is reachable from its world's spawn", () => {
  for (const map of [station, train]) for (const target of map.interactions) {
    const start = world.toCell(map.spawn.x, map.spawn.y);
    const end = validRoute(map.grid, start, findPath(map.grid, start, interactionGoals(map.grid, target)));
    assert.equal(world.inRange(world.cellCenter(end), target), true, target.id);
  }
});
test("all props occupy solid tiles and each carriage spawn is clear", () => {
  for (const map of [station, train]) for (const prop of map.props) {
    const x = prop.x / world.TILE - prop.width / 2;
    const y = prop.y / world.TILE - prop.height / 2;
    for (let yy = y; yy < y + prop.height; yy++) for (let xx = x; xx < x + prop.width; xx++) assert.equal(map.grid[yy][xx], 1);
  }
  for (const carriage of world.CARRIAGES) { const spawn = world.carriageSpawn(carriage.id); assert.equal(world.isWalkable(train.grid, world.toCell(spawn.x, spawn.y)), true); }
});
test("a route goes around obstacles, never through them", () => {
  const grid = [[0, 1, 0], [0, 1, 0], [0, 0, 0]];
  const start = { x: 0, y: 0 }; const goal = { x: 2, y: 0 };
  const route = findPath(grid, start, [goal]);
  assert.equal(route.length, 6);
  assert.deepEqual(validRoute(grid, start, route), goal);
});
test("diagonally touching floor cells do not permit corner cutting", () => {
  assert.equal(findPath([[0, 1], [1, 0]], { x: 0, y: 0 }, [{ x: 1, y: 1 }]), null);
});
test("blocked, outside, and disconnected destinations fail gracefully", () => {
  const grid = [[0, 1, 0], [0, 1, 0]];
  for (const goal of [{ x: 1, y: 0 }, { x: 2, y: 0 }, { x: -1, y: 0 }]) assert.equal(findPath(grid, { x: 0, y: 0 }, [goal]), null);
  assert.equal(findPath(grid, { x: 0, y: 0 }, []), null);
});
test("multiple approach cells select a reachable destination", () => {
  const grid = [[0, 0, 1, 0], [0, 0, 1, 0]];
  const start = { x: 0, y: 0 };
  assert.deepEqual(validRoute(grid, start, findPath(grid, start, [{ x: 3, y: 0 }, { x: 1, y: 1 }])), { x: 1, y: 1 });
});
test("interactions honor their exact configured range", () => {
  const target = train.interactions[0];
  assert.equal(world.inRange({ x: target.x + target.range, y: target.y }, target), true);
  assert.equal(world.inRange({ x: target.x + target.range + 0.01, y: target.y }, target), false);
  assert.equal(world.inRange({ x: target.x + target.range, y: target.y + target.range }, target), false);
});
test("interaction approach cells are walkable and in range", () => {
  for (const target of train.interactions) for (const goal of interactionGoals(train.grid, target)) {
    assert.equal(world.isWalkable(train.grid, goal), true);
    assert.equal(world.inRange(world.cellCenter(goal), target), true);
  }
});
test("each of the six projects has its own terminal and payload", () => {
  assert.deepEqual(train.interactions.filter((item) => item.type === "terminal").map((item) => item.payloadId), Array.from({ length: 6 }, (_, i) => `project:${i}`));
});
test("map walls outside doorways remain solid", () => {
  for (let i = 0; i < 5; i++) {
    const start = world.CAR_START + i * world.CAR_STEP;
    for (let y = 10; y < 24; y++) if (y < 17 || y > 19) assert.equal(train.grid[y][start], 1);
  }
});
test("diagonal keyboard and touch movement keep the same maximum speed", () => {
  for (const [x, y] of [[1, 0], [0, -1], [1, 1], [-1, 1], [2, 2]]) {
    const velocity = world.walkVelocity(x, y);
    assert.ok(Math.abs(Math.hypot(velocity.x, velocity.y) - 95) < 0.0001);
  }
  assert.deepEqual(world.walkVelocity(0, 0), { x: 0, y: 0 });
  assert.equal(world.walkVelocity(0.5, 0).x, 47.5);
});
test("tapping the edge of a large board selects its interaction", () => {
  const timeline = train.interactions.find((item) => item.id === "timeline");
  assert.equal(world.interactionAt(train, { x: timeline.x + 45, y: timeline.y - 18 }).id, "timeline");
  assert.equal(world.interactionAt(train, { x: 0, y: 0 }), null);
});
test("desktop framing fits the whole carriage below the location panel", () => {
  const bodyHeight = (world.CAR_BOTTOM - world.CAR_TOP + 1) * world.TILE + 8;
  for (const height of [360, 430, 505, 620, 760, 1000]) {
    const layout = world.cameraLayout("train", 1440, height);
    assert.equal(layout.desktopInterior, true);
    assert.ok(bodyHeight * layout.zoom <= height - 76);
    assert.ok(layout.zoom <= 2);
    const top = height / 2 + (world.CAR_TOP * world.TILE - layout.centerY) * layout.zoom;
    assert.ok(top >= 54);
    assert.ok(top + bodyHeight * layout.zoom <= height - 22);
  }
});
test("phone and station cameras preserve the close exploration view", () => {
  assert.equal(world.cameraLayout("train", 390, 500).desktopInterior, false);
  assert.equal(world.cameraLayout("train", 390, 500).zoom, 2);
  assert.equal(world.cameraLayout("station", 1440, 500).desktopInterior, false);
});

// An alpha-only rasterizer exercises the real texture painters without a DOM or GPU.
function textureScene(withScenery) {
  const textures = new Map();
  function createCanvas(key, width, height) {
    const alpha = new Uint8Array(width * height);
    const context = {
      fillStyle: "#000000",
      fillRect(x, y, w, h) {
        const opacity = this.fillStyle.length === 9 ? parseInt(this.fillStyle.slice(7, 9), 16) / 255 : 1;
        for (let yy = Math.max(0, y); yy < Math.min(height, y + h); yy++) for (let xx = Math.max(0, x); xx < Math.min(width, x + w); xx++) {
          const index = yy * width + xx;
          alpha[index] = Math.round(255 * opacity + alpha[index] * (1 - opacity));
        }
      },
      drawImage(source, x, y, w = source.width, h = source.height) {
        const oldStyle = this.fillStyle;
        this.fillStyle = "#000000";
        this.fillRect(x, y, w, h);
        this.fillStyle = oldStyle;
      },
    };
    const texture = { width, height, alpha, getContext: () => context, getSourceImage: () => ({ width, height }), refresh() {} };
    textures.set(key, texture);
    return texture;
  }
  createCanvas("wood-floor", 32, 32);
  if (withScenery) createCanvas("countryside", 720, 240);
  return { textures: { createCanvas, exists: (key) => textures.has(key), get: (key) => textures.get(key) }, cache: textures };
}

test("carriage walls and floor remain opaque with or without the scenery asset", () => {
  for (const withScenery of [true, false]) {
    const scene = textureScene(withScenery);
    for (const carriage of world.CARRIAGES) {
      const key = carriageTexture(scene, carriage.id, carriage.color, 384, 280);
      assert.ok(scene.cache.get(key).alpha.every((value) => value === 255), `opaque ${carriage.id}`);
    }
    assert.ok(scene.cache.get(connectorTexture(scene)).alpha.every((value) => value === 255));
  }
});
test("interior detail textures are cached and fit a small fixed memory budget", () => {
  const scene = textureScene(true);
  for (let visit = 0; visit < 10; visit++) for (const carriage of world.CARRIAGES) carriageTexture(scene, carriage.id, carriage.color, 384, 280);
  for (let visit = 0; visit < 10; visit++) connectorTexture(scene);
  const interiors = [...scene.cache.entries()].filter(([key]) => key.startsWith("carriage-"));
  assert.equal(interiors.length, 6, "five themes and one shared connector, independent of visits");
  const rgbaBytes = interiors.reduce((sum, [, texture]) => sum + texture.width * texture.height * 4, 0);
  assert.ok(rgbaBytes < 2.5 * 1024 * 1024);
});
