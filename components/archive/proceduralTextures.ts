import * as THREE from "three";
import { seededRandom } from "./shelfLayout";

const BUMP_SIZE = 256;

function bumpTextureFrom(height: (x: number, y: number) => number, repeatX: number, repeatY: number) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = BUMP_SIZE;
  const context = canvas.getContext("2d")!;
  const image = context.createImageData(BUMP_SIZE, BUMP_SIZE);

  for (let y = 0; y < BUMP_SIZE; y++) {
    for (let x = 0; x < BUMP_SIZE; x++) {
      const value = Math.round(THREE.MathUtils.clamp(height(x, y), 0, 1) * 255);
      const offset = (y * BUMP_SIZE + x) * 4;
      image.data[offset] = image.data[offset + 1] = image.data[offset + 2] = value;
      image.data[offset + 3] = 255;
    }
  }
  context.putImageData(image, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(repeatX, repeatY);
  return texture;
}

// Pebbled grain: distance to the nearest of a jittered, wrapping grid of points
function createLeatherBump() {
  const random = seededRandom(7741);
  const cells = 40;
  const cellSize = BUMP_SIZE / cells;
  const points = Array.from({ length: cells * cells }, () => [random(), random()]);

  return bumpTextureFrom((x, y) => {
    const cellX = Math.floor(x / cellSize);
    const cellY = Math.floor(y / cellSize);
    let nearest = Infinity;
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const px = cellX + dx;
        const py = cellY + dy;
        const [jitterX, jitterY] = points[((py + cells) % cells) * cells + ((px + cells) % cells)];
        const distance = Math.hypot((px + jitterX) * cellSize - x, (py + jitterY) * cellSize - y);
        nearest = Math.min(nearest, distance);
      }
    }
    return 1 - nearest / cellSize;
  }, 4, 4);
}

// Soft brushed unevenness for the painted wall: smooth noise on a wrapping lattice
function createPaintBump() {
  const random = seededRandom(3301);
  const lattice = 32;
  const values = Array.from({ length: lattice * lattice }, () => random());
  const smooth = (t: number) => t * t * (3 - 2 * t);

  return bumpTextureFrom((x, y) => {
    const gx = (x / BUMP_SIZE) * lattice;
    const gy = (y / BUMP_SIZE) * lattice;
    const x0 = Math.floor(gx);
    const y0 = Math.floor(gy);
    const at = (ix: number, iy: number) => values[(iy % lattice) * lattice + (ix % lattice)];
    const tx = smooth(gx - x0);
    const ty = smooth(gy - y0);
    const top = THREE.MathUtils.lerp(at(x0, y0), at(x0 + 1, y0), tx);
    const bottom = THREE.MathUtils.lerp(at(x0, y0 + 1), at(x0 + 1, y0 + 1), tx);
    return THREE.MathUtils.lerp(top, bottom, ty);
  }, 6, 3);
}

function drawDiamond(context: CanvasRenderingContext2D, x: number, y: number, halfWidth: number, halfHeight: number, color: string) {
  context.fillStyle = color;
  context.beginPath();
  context.moveTo(x, y - halfHeight);
  context.lineTo(x + halfWidth, y);
  context.lineTo(x, y + halfHeight);
  context.lineTo(x - halfWidth, y);
  context.closePath();
  context.fill();
}

// A woven rug with a border, a repeating field, and a central medallion
function createRugTexture() {
  const width = 1024;
  const height = 512;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d")!;

  const OXBLOOD = "#5e2a2b";
  const DEEP_RED = "#431b1e";
  const NAVY = "#1f2a44";
  const GOLD = "#a88a58";
  const IVORY = "#c9b68f";

  context.fillStyle = DEEP_RED;
  context.fillRect(0, 0, width, height);

  const inset = (amount: number, color: string) => {
    context.fillStyle = color;
    context.fillRect(amount, amount, width - amount * 2, height - amount * 2);
  };
  inset(10, GOLD);
  inset(14, NAVY);
  inset(50, GOLD);
  inset(54, OXBLOOD);

  // Border motif along the navy band
  for (let x = 32; x < width; x += 36) {
    drawDiamond(context, x, 32, 12, 12, IVORY);
    drawDiamond(context, x, height - 32, 12, 12, IVORY);
    drawDiamond(context, x, 32, 6, 6, DEEP_RED);
    drawDiamond(context, x, height - 32, 6, 6, DEEP_RED);
  }
  for (let y = 68; y < height - 50; y += 36) {
    drawDiamond(context, 32, y, 12, 12, IVORY);
    drawDiamond(context, width - 32, y, 12, 12, IVORY);
    drawDiamond(context, 32, y, 6, 6, DEEP_RED);
    drawDiamond(context, width - 32, y, 6, 6, DEEP_RED);
  }

  // Repeating field of small diamonds
  for (let row = 0, y = 78; y < height - 60; row++, y += 28) {
    for (let x = 78 + (row % 2) * 24; x < width - 60; x += 48) {
      drawDiamond(context, x, y, 7, 7, row % 2 ? DEEP_RED : "#7a3d38");
    }
  }

  // Central medallion, stepped in from the outside
  const cx = width / 2;
  const cy = height / 2;
  drawDiamond(context, cx, cy, 210, 150, GOLD);
  drawDiamond(context, cx, cy, 202, 142, NAVY);
  drawDiamond(context, cx, cy, 150, 104, IVORY);
  drawDiamond(context, cx, cy, 144, 98, OXBLOOD);
  drawDiamond(context, cx, cy, 80, 56, GOLD);
  drawDiamond(context, cx, cy, 72, 48, DEEP_RED);
  drawDiamond(context, cx, cy, 26, 18, IVORY);

  // Woven flecks so the flat color reads as wool
  const random = seededRandom(9127);
  for (let i = 0; i < 26000; i++) {
    context.fillStyle = random() < 0.5 ? "rgba(255,240,215,0.05)" : "rgba(0,0,0,0.09)";
    context.fillRect(random() * width, random() * height, 1 + random() * 3, 1);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

function once<T>(create: () => T) {
  let value: T | undefined;
  return () => (value ??= create());
}

// Built once and shared, since they are costly to draw and every book uses the leather
export const getLeatherBump = once(createLeatherBump);
export const getPaintBump = once(createPaintBump);
export const getRugTexture = once(createRugTexture);
