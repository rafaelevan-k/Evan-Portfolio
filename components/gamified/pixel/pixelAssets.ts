import type Phaser from "phaser";
import type { Prop } from "./world";

export const palette = { ink: "#302b42", shadow: "#221f30", wall: "#ead7aa", wood: "#b77c54", darkWood: "#70482f", gold: "#edbe74", teal: "#5d9291", green: "#748764", rose: "#bd7c78", paper: "#fbebc7" };
const OUT = "#2a2238";
type Paint = (color: string, x: number, y: number, w: number, h: number) => void;

function canvasTexture(scene: Phaser.Scene, key: string, w: number, h: number, draw: (p: Paint, context: CanvasRenderingContext2D) => void) {
  const texture = scene.textures.createCanvas(key, w, h)!;
  const context = texture.getContext();
  context.imageSmoothingEnabled = false;
  draw((color, x, y, width, height) => { context.fillStyle = color; context.fillRect(Math.round(x), Math.round(y), Math.round(width), Math.round(height)); }, context);
  texture.refresh();
}

function sheetTexture(scene: Phaser.Scene, key: string, frameWidth: number, frameHeight: number, frames: number, draw: (p: Paint, frame: number) => void) {
  const canvas = document.createElement("canvas");
  canvas.width = frameWidth * frames; canvas.height = frameHeight;
  const c = canvas.getContext("2d")!;
  for (let frame = 0; frame < frames; frame++) draw((color, x, y, w, h) => { c.fillStyle = color; c.fillRect(frame * frameWidth + x, y, w, h); }, frame);
  const source = scene.textures.addCanvas(key, canvas)!;
  scene.textures.addSpriteSheet(key, source as unknown as HTMLImageElement, { frameWidth, frameHeight });
}

function mix(a: string, b: string, amount: number) {
  const channels = [1, 3, 5].map((offset) => Math.round(parseInt(a.slice(offset, offset + 2), 16) * (1 - amount) + parseInt(b.slice(offset, offset + 2), 16) * amount));
  return `#${channels.map((channel) => channel.toString(16).padStart(2, "0")).join("")}`;
}

/** Stable pseudo-random value, so baked planks and books never change between visits. */
const hash = (a: number, b = 0) => { const value = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return value - Math.floor(value); };

const framed = (p: Paint, x: number, y: number, w: number, h: number, fill: string) => { p(OUT, x, y, w, h); p(fill, x + 1, y + 1, w - 2, h - 2); };
const disc = (p: Paint, cx: number, cy: number, r: number, color: string) => { for (let dy = -r; dy <= r; dy++) { const half = Math.floor(Math.sqrt(r * r - dy * dy)); p(color, cx - half, cy + dy, half * 2 + 1, 1); } };

// A 5 × 7 bitmap font keeps every in-world word as crisp as the art around it.
const GLYPHS: Record<string, string> = {
  A: "0E11111F111111", B: "1E11111E11111E", C: "0E11101010110E", D: "1E11111111111E", E: "1F10101E10101F", F: "1F10101E101010", G: "0E11101711110F", H: "1111111F111111", I: "0E04040404040E", J: "0702020202120C",
  K: "11121418141211", L: "1010101010101F", M: "111B1515111111", N: "11111915131111", O: "0E11111111110E", P: "1E11111E101010", Q: "0E11111115120D", R: "1E11111E141211", S: "0F10100E01011E", T: "1F040404040404",
  U: "1111111111110E", V: "11111111110A04", W: "1111111515150A", X: "11110A040A1111", Y: "1111110A040404", Z: "1F01020408101F",
  "0": "0E11131519110E", "1": "040C040404040E", "2": "0E11010204081F", "3": "1F02040201110E", "4": "02060A121F0202", "5": "1F101E0101110E", "6": "0608101E11110E", "7": "1F010204080808", "8": "0E11110E11110E", "9": "0E11110F01020C",
  " ": "00000000000000", ".": "00000000000C0C", ",": "000000000C0408", "'": "0C040800000000", "-": "0000001F000000", "&": "0C12140815120D", "!": "04040404000004", "?": "0E110102040004", ":": "000C0C000C0C00", "/": "01010204081010",
};

export const textWidth = (text: string) => text.length * 6 - 1;

function paintText(p: Paint, text: string, x: number, y: number, color: string) {
  [...text.toUpperCase()].forEach((char, index) => {
    const glyph = GLYPHS[char] ?? GLYPHS[" "];
    for (let row = 0; row < 7; row++) {
      const bits = parseInt(glyph.slice(row * 2, row * 2 + 2), 16);
      for (let col = 0; col < 5; col++) if (bits & (16 >> col)) p(color, x + index * 6 + col, y + row, 1, 1);
    }
  });
}

function wrap(text: string, limit: number) {
  const lines: string[] = [];
  for (const word of text.split(" ")) {
    const last = lines[lines.length - 1];
    if (last !== undefined && last.length + word.length + 1 <= limit) lines[lines.length - 1] = `${last} ${word}`;
    else lines.push(word);
  }
  return lines;
}

/** A paper speech bubble with a tail; cached per sentence. */
export function bubbleTexture(scene: Phaser.Scene, text: string, keycap = false): string {
  const key = `bubble-${keycap ? "k-" : ""}${text}`;
  if (scene.textures.exists(key)) return key;
  const lines = wrap(text, 30);
  const capWidth = keycap ? 13 : 0;
  const w = Math.max(...lines.map(textWidth)) + 10 + capWidth;
  const h = lines.length * 9 + 9;
  canvasTexture(scene, key, w, h + 4, (p) => {
    p(OUT, 1, 0, w - 2, h); p(OUT, 0, 1, w, h - 2);
    p(palette.paper, 1, 1, w - 2, h - 2); p("#e0c89c", 1, h - 3, w - 2, 2);
    p(OUT, w / 2 - 3, h - 1, 6, 2); p(OUT, w / 2 - 2, h + 1, 4, 2); p(OUT, w / 2 - 1, h + 3, 2, 1);
    p(palette.paper, w / 2 - 2, h - 2, 4, 2); p(palette.paper, w / 2 - 1, h, 2, 1);
    if (keycap) { framed(p, 3, 3, 10, 11, palette.gold); p("#b98a4b", 4, 12, 8, 1); paintText(p, "E", 6, 4, OUT); }
    lines.forEach((line, index) => paintText(p, line, 5 + capWidth, 4 + index * 9, OUT));
  });
  return key;
}

type Outfit = { hair: string; skin: string; coat: string; coatDark: string; trim: string; pants: string; shoes: string; cap?: string; capBand?: string; glasses?: boolean; pack?: string };
const SKIN = "#efc39a";
const OUTFITS: Record<string, Outfit> = {
  traveler: { hair: "#3a2c3f", skin: SKIN, coat: "#d9603f", coatDark: "#a8432f", trim: "#f6e3b4", pants: "#33405a", shoes: "#6b4630", pack: "#6d8f7c" },
  conductor: { hair: "#40303a", skin: SKIN, coat: "#3f5f80", coatDark: "#2d4661", trim: "#edbe74", pants: "#26344a", shoes: "#2a2238", cap: "#2d4661", capBand: "#edbe74" },
  teacher: { hair: "#6a4a3a", skin: "#e3b48c", coat: "#4d8583", coatDark: "#386665", trim: "#f6e3b4", pants: "#4a3f4f", shoes: "#6b4630", glasses: true },
  rafael: { hair: "#231d2b", skin: "#e0ae84", coat: "#2f3a52", coatDark: "#222a3e", trim: "#d94b35", pants: "#3b3f4d", shoes: "#e8dcc0", glasses: true },
  engineer: { hair: "#7a4a2f", skin: "#d9a57c", coat: "#c8913f", coatDark: "#9a6d2b", trim: "#f6e3b4", pants: "#3d4a55", shoes: "#3a2c2c", cap: "#d9603f", capBand: "#a8432f" },
  passenger: { hair: "#8c5a4a", skin: "#f0caa4", coat: "#8d6fa0", coatDark: "#6d5380", trim: "#f6e3b4", pants: "#3d3a55", shoes: "#6b4630" },
};

/** Frames per facing: 0 stand, 1 and 2 stride, 3 breathe out. Facing order: down, left, right, up. */
function paintCharacter(base: Paint, dir: number, frame: number, o: Outfit) {
  // Right is a mirrored left, so the two profiles can never drift apart.
  const p: Paint = dir === 2 ? (color, x, y, w, h) => base(color, 16 - x - w, y, w, h) : base;
  const lift = frame === 1 || frame === 2 ? 1 : 0;
  const hy = 5 + (frame === 3 ? 1 : 0) - lift;
  const side = dir === 1 || dir === 2;
  const legs = side ? [[frame === 1 ? 4 : frame === 2 ? 9 : 6, frame === 2 ? 1 : 0], [frame === 1 ? 9 : frame === 2 ? 5 : 8, frame === 1 ? 1 : 0]] : [[5, frame === 1 ? 2 : 0], [9, frame === 2 ? 2 : 0]];
  for (const [x, raised] of legs) {
    p(OUT, x - 1, 24 - lift, 4, 6 - raised + lift); p(o.pants, x, 24 - lift, 2, 4 - raised + lift);
    p(mix(o.pants, "#000000", 0.2), x + 1, 24 - lift, 1, 4 - raised + lift);
    p(OUT, x - 1, 27 - raised, 4, 3); p(o.shoes, x, 28 - raised, 2, 1);
  }
  const swing = frame === 1 ? 1 : frame === 2 ? -1 : 0;
  if (side) {
    p(OUT, 4, 17 - lift, 8, 8); p(o.coat, 5, 17 - lift, 6, 7); p(o.coatDark, 5, 22 - lift, 6, 2);
    if (o.pack) { p(OUT, 10, 17 - lift, 5, 8); p(o.pack, 11, 18 - lift, 3, 6); p(mix(o.pack, "#ffffff", 0.3), 11, 18 - lift, 3, 1); }
    p(OUT, 6 + swing, 18 - lift, 4, 7); p(o.coatDark, 7 + swing, 18 - lift, 2, 5); p(o.skin, 7 + swing, 23 - lift, 2, 1);
  } else {
    p(OUT, 2, 18 - lift + swing, 3, 7); p(OUT, 11, 18 - lift - swing, 3, 7);
    p(o.coatDark, 3, 18 - lift + swing, 1, 5); p(o.coatDark, 12, 18 - lift - swing, 1, 5);
    p(o.skin, 3, 23 - lift + swing, 1, 1); p(o.skin, 12, 23 - lift - swing, 1, 1);
    p(OUT, 3, 17 - lift, 10, 8); p(o.coat, 4, 17 - lift, 8, 7); p(o.coatDark, 4, 22 - lift, 8, 2);
    if (dir === 0) {
      p(o.trim, 6, 17 - lift, 4, 1);
      if (o.pack) { p(o.coatDark, 5, 18 - lift, 1, 4); p(o.coatDark, 10, 18 - lift, 1, 4); }
      else p(o.trim, 8, 19 - lift, 1, 3);
    } else if (o.pack) {
      p(OUT, 4, 17 - lift, 8, 7); p(o.pack, 5, 18 - lift, 6, 5); p(mix(o.pack, "#ffffff", 0.3), 5, 18 - lift, 6, 1); p(mix(o.pack, "#000000", 0.25), 6, 21 - lift, 4, 2);
    }
  }
  p(OUT, 4, hy, 8, 1); p(OUT, 3, hy + 1, 10, 1); p(OUT, 2, hy + 2, 12, 8); p(OUT, 3, hy + 10, 10, 1); p(OUT, 4, hy + 11, 8, 1);
  p(o.skin, 3, hy + 2, 10, 8); p(o.skin, 4, hy + 1, 8, 9); p(mix(o.skin, "#a0603f", 0.3), 4, hy + 10, 8, 1);
  const hairLight = mix(o.hair, "#ffffff", 0.22);
  p(o.hair, 4, hy + 1, 8, 1); p(o.hair, 3, hy + 2, 10, 3);
  if (dir === 0) {
    p(o.hair, 3, hy + 5, 1, 2); p(o.hair, 12, hy + 5, 1, 2); p(o.hair, 5, hy + 5, 2, 1); p(o.hair, 9, hy + 5, 2, 1); p(hairLight, 5, hy + 2, 3, 1);
    p(OUT, 5, hy + 6, 1, 2); p(OUT, 10, hy + 6, 1, 2); p("#e89b85", 4, hy + 8, 1, 1); p("#e89b85", 11, hy + 8, 1, 1);
    if (o.glasses) { p(OUT, 4, hy + 6, 3, 1); p(OUT, 9, hy + 6, 3, 1); p(OUT, 7, hy + 6, 2, 1); }
  } else if (side) {
    p(o.hair, 7, hy + 5, 6, 4); p(o.hair, 10, hy + 9, 3, 1); p(hairLight, 6, hy + 2, 3, 1); p(mix(o.skin, "#a0603f", 0.3), 8, hy + 6, 1, 2);
    p(OUT, 4, hy + 6, 1, 2); p("#e89b85", 5, hy + 8, 1, 1);
    if (o.glasses) p(OUT, 3, hy + 6, 4, 1);
  } else {
    p(o.hair, 3, hy + 5, 10, 5); p(o.hair, 4, hy + 10, 8, 1); p(hairLight, 5, hy + 2, 4, 1);
  }
  if (o.cap) {
    p(OUT, 2, hy, 12, 5); p(o.cap, 3, hy + 1, 10, 3); p(mix(o.cap, "#ffffff", 0.2), 4, hy + 1, 5, 1); p(o.capBand ?? o.cap, 3, hy + 4, 10, 1);
    if (dir === 0) { p(OUT, 3, hy + 5, 10, 1); p(o.capBand ?? o.cap, 7, hy + 2, 2, 2); }
    if (side) p(OUT, 1, hy + 4, 4, 1);
  }
}

export function createPixelAssets(scene: Phaser.Scene) {
  // Kept for the carriage painter's contract: the floor source is always available.
  canvasTexture(scene, "wood-floor", 32, 32, (p) => { p("#b98a60", 0, 0, 32, 32); });
  canvasTexture(scene, "solid", 16, 16, (p) => p(palette.ink, 0, 0, 16, 16));
  for (const [key, outfit] of Object.entries(OUTFITS)) sheetTexture(scene, key, 16, 32, 16, (p, frame) => paintCharacter(p, Math.floor(frame / 4), frame % 4, outfit));
  ["down", "left", "right", "up"].forEach((direction, index) => {
    const offset = index * 4;
    scene.anims.create({ key: `walk-${direction}`, frames: [1, 0, 2, 0].map((frame) => ({ key: "traveler", frame: offset + frame })), frameRate: 9, repeat: -1 });
  });
  sheetTexture(scene, "cat", 16, 16, 2, (p, frame) => {
    p(OUT, 3, 8, 10, 7); p("#d98f4a", 4, 9, 8, 5); p("#b56f34", 5, 10, 2, 3); p("#b56f34", 8, 10, 2, 3);
    p(OUT, 8, 4, 7, 7); p("#e8a35c", 9, 5, 5, 5); p(OUT, 8, 3, 2, 2); p(OUT, 13, 3, 2, 2); p(OUT, 10, 7, 1, 1); p(OUT, 12, 7, 1, 1); p("#f6e3b4", 10, 9, 3, 1);
    if (frame === 0) { p(OUT, 1, 6, 3, 7); p("#e8a35c", 2, 7, 1, 5); } else { p(OUT, 0, 10, 4, 3); p("#e8a35c", 1, 11, 3, 1); }
    p(OUT, 4, 14, 2, 1); p(OUT, 10, 14, 2, 1);
  });
  sheetTexture(scene, "marker", 9, 9, 2, (p, frame) => {
    if (frame === 0) { p(OUT, 0, 0, 9, 5); p(OUT, 1, 5, 7, 1); p(OUT, 2, 6, 5, 1); p(OUT, 3, 7, 3, 1); p(OUT, 4, 8, 1, 1); p(palette.gold, 1, 1, 7, 3); p("#fff1c9", 1, 1, 7, 1); p(palette.gold, 2, 4, 5, 1); p(palette.gold, 3, 5, 3, 1); p(palette.gold, 4, 6, 1, 1); }
    else { p(OUT, 1, 3, 3, 5); p(OUT, 3, 5, 3, 3); p(OUT, 5, 1, 4, 5); p("#a9d18e", 2, 4, 1, 2); p("#a9d18e", 3, 5, 1, 2); p("#a9d18e", 4, 6, 1, 1); p("#a9d18e", 5, 4, 1, 2); p("#a9d18e", 6, 3, 1, 2); p("#a9d18e", 7, 2, 1, 2); }
  });
  sheetTexture(scene, "screen", 18, 11, 3, (p, frame) => {
    p("#14202c", 0, 0, 18, 11);
    for (let row = 0; row < 4; row++) { const width = 4 + Math.floor(hash(row, frame) * 10); p("#ffffff", 2 + (row % 2) * 2, 2 + row * 2, width, 1); }
    p("#ffffff", 2 + Math.floor(hash(frame, 7) * 10), 8, 2, 1);
  });
  sheetTexture(scene, "wheel", 18, 18, 2, (p, frame) => {
    disc(p, 9, 9, 8, OUT); disc(p, 9, 9, 6, "#5a5365"); disc(p, 9, 9, 2, palette.gold);
    if (frame === 0) { p(OUT, 3, 8, 12, 1); p(OUT, 8, 3, 1, 12); } else for (let i = -3; i <= 3; i++) { p(OUT, 9 + i, 9 + i, 1, 1); p(OUT, 9 + i, 9 - i, 1, 1); }
  });
  sheetTexture(scene, "train-door", 32, 58, 2, (p, frame) => {
    p(OUT, 0, 0, 32, 58);
    if (frame === 0) { p("#34605c", 2, 2, 13, 54); p("#34605c", 17, 2, 13, 54); p("#ffd98c", 5, 8, 7, 14); p("#ffd98c", 20, 8, 7, 14); p(palette.gold, 13, 28, 1, 8); p(palette.gold, 18, 28, 1, 8); }
    else { p("#ffd98c", 2, 2, 28, 54); p("#f2b866", 2, 44, 28, 12); p("#8a5a3b", 2, 52, 28, 4); p("#34605c", 2, 2, 3, 54); p("#34605c", 27, 2, 3, 54); }
  });
  canvasTexture(scene, "dust", 2, 2, (p) => p("#ffffff", 0, 0, 2, 2));
  canvasTexture(scene, "puff", 12, 12, (p) => { disc(p, 6, 6, 5, "#f0e6d8"); disc(p, 5, 5, 3, "#ffffff"); });
  canvasTexture(scene, "firefly", 3, 3, (p) => { p("#fff0a0", 1, 0, 1, 3); p("#fff0a0", 0, 1, 3, 1); });
  canvasTexture(scene, "shadow", 16, 6, (p) => { p("#1c172a", 3, 0, 10, 6); p("#1c172a", 1, 1, 14, 4); p("#1c172a", 0, 2, 16, 2); });
  canvasTexture(scene, "bird", 7, 3, (p) => { p(OUT, 0, 0, 2, 1); p(OUT, 2, 1, 1, 1); p(OUT, 3, 2, 1, 1); p(OUT, 4, 1, 1, 1); p(OUT, 5, 0, 2, 1); });
  canvasTexture(scene, "cloud", 64, 18, (p) => { p("#e9a877", 8, 8, 48, 8); p("#f5c28f", 14, 4, 22, 8); p("#f5c28f", 32, 7, 20, 5); p("#ffe0ac", 18, 3, 12, 3); p("#b56f6a", 6, 15, 52, 3); });
  glowTexture(scene, "glow-warm", 96, "#ffb45e");
  glowTexture(scene, "glow-cool", 48, "#8fe3d2");
  canvasTexture(scene, "window-glass", 88, 32, (p) => {
    p(OUT, 43, 0, 2, 32); p("#b08a5c", 44, 0, 1, 32);
    for (let i = 0; i < 14; i++) { p("#ffffff1c", 8 + i, 18 - i, 3, 1); p("#ffffff14", 56 + i, 22 - i, 2, 1); }
    p("#1c172a40", 0, 0, 88, 2);
  });
  canvasTexture(scene, "platform", 64, 64, (p) => {
    p("#b9a184", 0, 0, 64, 64);
    for (let row = 0; row < 4; row++) for (let col = -1; col < 3; col++) {
      const x = col * 32 + (row % 2) * 16; const y = row * 16;
      const shade = ["#d4bd9b", "#cdb593", "#d9c3a2", "#c8b08e"][Math.floor(hash(col + 5, row) * 4)];
      p(shade, x + 1, y + 1, 31, 15); p(mix(shade, "#ffffff", 0.22), x + 1, y + 1, 31, 1); p(mix(shade, "#5b4436", 0.18), x + 1, y + 14, 31, 2);
      if (hash(col + 9, row) > 0.5) p(mix(shade, "#5b4436", 0.2), x + 6 + Math.floor(hash(col, row) * 18), y + 6, 2, 1);
    }
  });
  canvasTexture(scene, "platform-edge", 32, 16, (p) => {
    p("#8d7a68", 0, 0, 32, 3); p("#e9dcc0", 0, 3, 32, 2); p("#f0b93f", 0, 5, 32, 9); p("#2a2238", 0, 14, 32, 2);
    for (let x = 1; x < 32; x += 4) for (const y of [6, 9, 12]) p("#c9922c", x + (y === 9 ? 2 : 0), y, 2, 1);
  });
  canvasTexture(scene, "fence", 32, 28, (p) => {
    p("#7c5a42", 0, 0, 32, 3); p("#a07a56", 0, 0, 32, 1); p("#6d4c37", 0, 18, 32, 2);
    for (const x of [3, 19]) { p(OUT, x, 0, 5, 26); p("#a07a56", x + 1, 1, 3, 24); p("#c79f75", x + 1, 1, 1, 24); }
    p("#3c5a43", 0, 24, 32, 4);
  });
  canvasTexture(scene, "paddy", 64, 32, (p) => {
    p("#4f7a4a", 0, 0, 64, 32);
    for (let y = 0; y < 32; y += 4) for (let x = 0; x < 64; x += 2) if (hash(x, y) > 0.35) p(hash(y, x) > 0.5 ? "#6b9558" : "#3d6442", x, y, 1, 2 + Math.floor(hash(x, y + 1) * 2));
    p("#e8a95c", 0, 22, 64, 3); p("#f6c982", 8, 22, 22, 1); p("#f6c982", 40, 24, 16, 1); p("#6d5a3e", 0, 25, 64, 1);
    for (let x = 2; x < 64; x += 7) p("#3d6442", x, 19, 1, 6);
  });
  canvasTexture(scene, "track", 64, 48, (p) => {
    p("#4a4150", 0, 0, 64, 48);
    for (let i = 0; i < 90; i++) p(hash(i) > 0.5 ? "#5e5463" : "#3a3240", Math.floor(hash(i, 1) * 64), Math.floor(hash(i, 2) * 48), 2, 1);
    for (const x of [0, 32]) { p("#6b4630", x + 6, 17, 16, 13); p("#8a5f42", x + 6, 17, 16, 2); p("#4f3324", x + 6, 28, 16, 2); }
    p(OUT, 0, 16, 64, 4); p("#b7b2bd", 0, 16, 64, 1); p("#807a88", 0, 17, 64, 2);
    p("#2d4a33", 0, 40, 64, 8); for (let x = 1; x < 64; x += 5) p("#4f7a4a", x, 38 + Math.floor(hash(x, 3) * 3), 2, 4);
  });
  stationTrainTexture(scene);
  vignetteTexture(scene);
}

const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];

/** Ordered dither instead of a soft gradient, so light still reads as pixel art. */
function glowTexture(scene: Phaser.Scene, key: string, size: number, color: string) {
  canvasTexture(scene, key, size, size, (p) => {
    const center = (size - 1) / 2;
    for (let y = 0; y < size; y += 2) for (let x = 0; x < size; x += 2) {
      const falloff = 1 - Math.hypot(x - center, y - center) / center;
      if (falloff <= 0) continue;
      const threshold = BAYER[((y / 2) % 4) * 4 + ((x / 2) % 4)] / 16;
      if (falloff * 1.25 > threshold) p(`${color}${Math.round(30 + falloff * 90).toString(16).padStart(2, "0")}`, x, y, 2, 2);
    }
  });
}

function vignetteTexture(scene: Phaser.Scene) {
  canvasTexture(scene, "vignette", 480, 270, (p) => {
    for (let y = 0; y < 270; y++) for (let x = 0; x < 480; x++) {
      const dx = (x - 239.5) / 240; const dy = (y - 134.5) / 135;
      const edge = Math.pow(Math.hypot(dx, dy) / 1.42, 4) * 1.3;
      if (edge > BAYER[(y % 4) * 4 + (x % 4)] / 16 + 0.2) p("#1c1730", x, y, 1, 1);
    }
  });
}

/** Side-on train at the platform. Coordinates are world x + 224, so the door sits at x = 800. */
export const STATION_TRAIN = { x: -224, y: 96, door: 800, stack: 1550 };

function stationTrainTexture(scene: Phaser.Scene) {
  canvasTexture(scene, "station-train", 1600, 112, (p) => {
    const car = (x: number, w: number, title?: string) => {
      p(OUT, x, 6, w, 88); p("#4a3f58", x + 1, 7, w - 2, 7); p("#6a5c78", x + 4, 7, w - 8, 2);
      p("#efe0bd", x + 1, 14, w - 2, 40); p("#fff4d6", x + 1, 14, w - 2, 2);
      p("#3f6a66", x + 1, 54, w - 2, 36); p("#335854", x + 1, 82, w - 2, 8); p(palette.gold, x + 1, 54, w - 2, 3); p("#b98a4b", x + 1, 57, w - 2, 1);
      for (let wx = x + 14; wx < x + w - 44; wx += 46) {
        framed(p, wx, 22, 34, 26, "#ffd98c"); p("#f2b866", wx + 1, 39, 32, 8); p("#fff2c4", wx + 3, 24, 10, 2);
        p(OUT, wx + 16, 22, 2, 26);
        if (hash(wx) > 0.55) { p("#6b4f4a", wx + 6, 33, 7, 14); disc(p, wx + 9, 31, 3, "#6b4f4a"); }
      }
      if (title) paintText(p, title, x + w / 2 - textWidth(title) / 2, 66, "#fff4d6");
      for (const bx of [x + 42, x + w - 42]) {
        p(OUT, bx - 22, 90, 44, 5);
        for (const wx of [bx - 12, bx + 12]) { disc(p, wx, 98, 8, OUT); disc(p, wx, 98, 6, "#5a5365"); disc(p, wx, 98, 2, palette.gold); }
      }
    };
    p(OUT, 0, 104, 1600, 4);
    car(0, 196); car(208, 300); car(520, 200, "RAFAEL LINE");
    // The boarding car is centered on the door, with a lit name panel to each side.
    car(732, 136);
    car(880, 360);
    for (const x of [196, 508, 720, 868, 1240]) { p(OUT, x, 58, 12, 26); p("#5a5365", x + 1, 62, 10, 18); }
    paintText(p, "RAFAEL LINE", 952, 66, "#fff4d6");
    paintText(p, "REK", 800 - 8 - 44, 66, "#fff4d6");
    // Locomotive, facing right.
    const lx = 1252;
    p(OUT, lx, 8, 88, 86); p("#7c3a35", lx + 1, 9, 86, 84); p("#9a4c42", lx + 1, 9, 86, 3); p("#5e2b2b", lx + 1, 78, 86, 15);
    p("#4a3f58", lx - 3, 4, 94, 7); p("#6a5c78", lx, 4, 88, 2);
    framed(p, lx + 12, 20, 28, 30, "#ffd98c"); framed(p, lx + 48, 20, 28, 30, "#ffd98c"); p("#f2b866", lx + 13, 40, 26, 9); p("#f2b866", lx + 49, 40, 26, 9);
    p(palette.gold, lx + 1, 58, 86, 3);
    p(OUT, lx + 88, 26, 200, 68); p("#2f5a58", lx + 89, 27, 198, 66); p("#47807c", lx + 89, 29, 198, 5); p("#22433f", lx + 89, 78, 198, 15);
    for (const x of [lx + 118, lx + 168, lx + 218]) { p(palette.gold, x, 27, 4, 66); p("#b98a4b", x + 3, 27, 1, 66); }
    p(OUT, lx + 270, 22, 58, 72); p("#2a2238", lx + 271, 23, 56, 70); p("#474055", lx + 271, 25, 56, 3);
    disc(p, lx + 300, 58, 12, "#54505f"); disc(p, lx + 300, 58, 3, palette.gold);
    framed(p, lx + 170, 8, 24, 19, "#b98a4b"); p("#ffe0a0", lx + 173, 10, 9, 3);
    framed(p, lx + 292, 2, 14, 22, "#3a3346"); framed(p, lx + 288, 0, 22, 5, "#54505f");
    for (const wx of [lx + 112, lx + 160, lx + 208]) { disc(p, wx, 92, 15, OUT); disc(p, wx, 92, 12, "#7c3a35"); disc(p, wx, 92, 3, palette.gold); p(OUT, wx - 11, 91, 22, 2); p(OUT, wx - 1, 81, 2, 22); }
    p("#b7b2bd", lx + 104, 89, 112, 4); p(OUT, lx + 104, 93, 112, 1);
    for (const wx of [lx + 262, lx + 300]) { disc(p, wx, 98, 8, OUT); disc(p, wx, 98, 6, "#5a5365"); disc(p, wx, 98, 2, palette.gold); }
    for (let i = 0; i < 6; i++) p(OUT, lx + 328 + i * 3, 74 + i * 4, 20 - i * 3, 4);
  });
}

const PROP_EXTRA: Record<string, number> = { plant: 16, sofa: 10, bench: 18, shelf: 24, education: 18, timeline: 18, certificate: 18, sign: 26, mail: 12, exit: 22, desk: 14, terminal: 14, book: 8, document: 14, archive: 14, worktable: 10, lamp: 44, booth: 28, luggage: 10, "nameboard-yk": 28, "nameboard-rl": 28, planter: 12, rack: 24, trophy: 24, crate: 6, parcels: 10, cart: 10 };

export function propTexture(scene: Phaser.Scene, prop: Prop): string {
  const key = `prop-${prop.kind}-${prop.width}-${prop.height}`;
  if (scene.textures.exists(key)) return key;
  const w = prop.width * 16; const h = prop.height * 16 + (PROP_EXTRA[prop.kind] ?? 16);
  canvasTexture(scene, key, w, h, (p) => {
    const { darkWood, wood, paper, teal, gold } = palette;
    const shadow = () => p("#1c172a55", 1, h - 4, w - 2, 4);
    const leaves = (list: number[][], colors: string[]) => {
      for (const [x, y, lw, lh] of list) p(OUT, x - 1, y - 1, lw + 2, lh + 2);
      list.forEach(([x, y, lw, lh], index) => { p(colors[index % colors.length], x, y, lw, lh); p(mix(colors[index % colors.length], "#ffffff", 0.2), x, y, lw, 1); });
    };
    const table = (top: number) => {
      p(OUT, 4, top + 6, 4, h - top - 7); p(OUT, w - 8, top + 6, 4, h - top - 7); p(darkWood, 5, top + 6, 2, h - top - 8); p(darkWood, w - 7, top + 6, 2, h - top - 8);
      framed(p, 0, top, w, 8, wood); p("#dcae80", 1, top + 1, w - 2, 2); p("#8f5d3b", 1, top + 6, w - 2, 1);
      framed(p, 3, top + 7, w - 6, Math.min(12, h - top - 11), "#8f5d3b"); p("#a7714b", 4, top + 8, w - 8, 1);
    };
    shadow();
    if (prop.kind === "plant") {
      framed(p, 7, h - 19, 18, 5, "#cf7f52"); framed(p, 9, h - 15, 14, 13, "#b9673f"); p("#d98b5b", 10, h - 14, 2, 10); p("#8f4b30", 10, h - 5, 12, 2);
      leaves([[14, 4, 4, 26], [3, 13, 12, 7], [17, 8, 12, 7], [6, 22, 10, 6], [17, 19, 11, 7], [10, 3, 9, 5]], ["#3f6b4f", "#5a8a5c", "#6f9c62", "#4d7b55", "#86ad6b", "#5a8a5c"]);
    } else if (prop.kind === "planter") {
      framed(p, 1, h - 16, w - 2, 13, "#8a5f42"); p("#a7774f", 2, h - 15, w - 4, 2); p("#6d4c37", 2, h - 6, w - 4, 2);
      leaves([[3, h - 26, 16, 10], [18, h - 24, 14, 8], [31, h - 27, 14, 11]], ["#4d7b55", "#3f6b4f", "#5a8a5c"]);
      for (let i = 0; i < 9; i++) { const color = ["#f2a65a", "#e8606a", "#f6e3b4"][i % 3]; p(color, 4 + Math.floor(hash(i) * (w - 10)), h - 28 + Math.floor(hash(i, 2) * 10), 3, 3); }
    } else if (prop.kind === "sofa") {
      const cloth = "#5f8a84";
      framed(p, 2, 3, w - 4, 20, mix(cloth, OUT, 0.25)); p(mix(cloth, "#ffffff", 0.1), 3, 4, w - 6, 2);
      framed(p, 2, h - 23, w - 4, 16, cloth); p(mix(cloth, "#ffffff", 0.28), 3, h - 22, w - 6, 2); p(mix(cloth, OUT, 0.3), 3, h - 11, w - 6, 3);
      for (let x = 20; x < w - 8; x += 18) p(mix(cloth, OUT, 0.45), x, h - 22, 1, 11);
      framed(p, 0, 12, 7, h - 18, "#4a716b"); framed(p, w - 7, 12, 7, h - 18, "#4a716b");
      p(darkWood, 4, h - 6, 4, 3); p(darkWood, w - 8, h - 6, 4, 3);
      framed(p, 10, h - 30, 11, 9, "#e8a95c"); p("#f6c982", 11, h - 29, 9, 2);
    } else if (prop.kind === "bench") {
      p(OUT, 5, h - 12, 3, 10); p(OUT, w - 8, h - 12, 3, 10);
      for (const y of [4, 10, 16]) { framed(p, 1, y, w - 2, 5, "#b77c54"); p("#dcae80", 2, y + 1, w - 4, 1); }
      framed(p, 1, h - 14, w - 2, 5, "#c98d60"); p("#e3b789", 2, h - 13, w - 4, 1);
      p("#3f3a4d", 4, 2, 3, h - 5); p("#3f3a4d", w - 7, 2, 3, h - 5);
    } else if (prop.kind === "shelf") {
      framed(p, 0, 0, w, h - 3, darkWood); p("#8f5d3b", 1, 1, w - 2, 2); p("#3a2a2c", 3, 4, w - 6, h - 11);
      for (let row = 0; row < 3; row++) {
        const base = 18 + row * 15;
        p("#a7714b", 3, base, w - 6, 2);
        for (let x = 4; x < w - 5;) {
          const bw = 3 + Math.floor(hash(x, row + w) * 3); const bh = 8 + Math.floor(hash(row, x + w) * 4);
          const color = ["#d9603f", "#4d8583", "#edbe74", "#8fa86f", "#8d6fa0", "#efe0bd"][Math.floor(hash(x + row * 7, w) * 6)];
          p(color, x, base - bh, bw, bh); p(mix(color, "#ffffff", 0.3), x, base - bh, 1, bh); p(mix(color, OUT, 0.5), x, base - bh + 3, bw, 1);
          x += bw + (hash(x, 9) > 0.8 ? 2 : 0);
        }
      }
    } else if (["education", "timeline", "certificate"].includes(prop.kind)) {
      p(OUT, 6, h - 18, 4, 16); p(OUT, w - 10, h - 18, 4, 16); p(darkWood, 7, h - 18, 2, 15); p(darkWood, w - 9, h - 18, 2, 15);
      framed(p, 0, 1, w, h - 15, darkWood); p("#a7714b", 1, 2, w - 2, 2); framed(p, 3, 5, w - 6, h - 22, paper); p("#e6d3a8", 4, h - 19, w - 8, 2);
      if (prop.kind === "timeline") {
        p(teal, 8, 18, w - 16, 2);
        for (let x = 10; x < w - 12; x += 18) { framed(p, x, 15, 7, 8, ["#d9603f", gold, teal, "#8d6fa0", "#8fa86f"][Math.floor(x / 18) % 5]); p("#a88a69", x - 1, 11, 10, 1); p("#a88a69", x, 26, 8, 1); }
      } else if (prop.kind === "education") {
        p(OUT, w / 2 - 11, 10, 22, 4); p(OUT, w / 2 - 7, 8, 14, 8); p("#3f5f80", w / 2 - 6, 9, 12, 6); p(gold, w / 2 + 6, 11, 1, 7); p(gold, w / 2 + 5, 18, 3, 2);
        p("#a88a69", 9, 23, w - 18, 1); p("#a88a69", 12, 27, w - 24, 1);
      } else {
        for (const x of [8, 26, 44]) { framed(p, x, 9, 14, 17, "#fff8e4"); p(teal, x + 3, 12, 8, 2); p("#a88a69", x + 3, 16, 8, 1); disc(p, x + 7, 21, 2, "#d9603f"); }
      }
    } else if (prop.kind === "sign") {
      p(OUT, 6, h - 20, 4, 18); p(OUT, w - 10, h - 20, 4, 18); p("#3f3a4d", 7, h - 20, 2, 18); p("#3f3a4d", w - 9, h - 20, 2, 18);
      framed(p, 0, 0, w, h - 15, "#3f5f80"); framed(p, 3, 3, w - 6, h - 21, paper);
      paintText(p, "ROUTE", w / 2 - 14, 6, "#3f5f80");
      p(OUT, 7, 20, w - 14, 2);
      ["#df986b", "#88b9bb", "#dcb96c", "#acb88b", "#c3a0bb"].forEach((color, index) => { const x = 8 + index * ((w - 20) / 4); framed(p, x - 1, 18, 6, 6, color); });
    } else if (prop.kind.startsWith("nameboard")) {
      const title = prop.kind === "nameboard-yk" ? "YOGYAKARTA" : "RAFAEL LINE";
      p(OUT, 8, 20, 4, h - 22); p(OUT, w - 12, 20, 4, h - 22); p("#5a5365", 9, 20, 2, h - 22); p("#5a5365", w - 11, 20, 2, h - 22);
      framed(p, 0, 2, w, 22, "#2f5f8a"); p("#4a7fb0", 1, 3, w - 2, 2); p("#fff4d6", 2, 19, w - 4, 1);
      paintText(p, title, w / 2 - textWidth(title) / 2, 8, "#fff4d6");
    } else if (prop.kind === "mail") {
      p(OUT, 13, h - 14, 6, 12); p(darkWood, 14, h - 14, 4, 11);
      framed(p, 4, 6, w - 8, h - 19, "#d9603f"); p(OUT, 6, 3, w - 12, 4); p("#e8795a", 7, 4, w - 14, 3); p("#f08e6e", 5, 7, w - 10, 2); p("#a8432f", 5, h - 19, w - 10, 3);
      p(OUT, 9, 12, w - 18, 3); framed(p, 9, 19, w - 18, 10, paper); p("#c49a6c", 10, 20, 2, 1); p("#c49a6c", 12, 21, 8, 1); p("#c49a6c", 20, 20, 2, 1);
    } else if (prop.kind === "exit") {
      framed(p, 2, 0, w - 4, h - 3, "#3f3a4d"); framed(p, 6, 12, w - 12, h - 15, "#3f6a66"); p("#55877f", 7, 13, w - 14, 2); p("#2f5350", 7, h - 8, w - 14, 4);
      framed(p, 10, 17, w - 20, 14, "#ffd98c"); p(gold, w - 12, 34, 3, 4);
      framed(p, w / 2 - 15, 1, 30, 10, "#3f9b6e"); paintText(p, "EXIT", w / 2 - 11, 3, "#fff4d6");
    } else if (prop.kind === "lamp") {
      p(OUT, 6, 8, 4, h - 10); p("#4a4556", 7, 8, 2, h - 10); p("#6a6478", 7, 8, 1, h - 10); framed(p, 4, h - 6, 8, 4, "#3f3a4d");
      p(OUT, 2, 1, 12, 9); p("#ffe6a8", 3, 2, 10, 7); p("#fff8d8", 5, 3, 6, 3); p(OUT, 4, 0, 8, 1); p(OUT, 2, 9, 12, 1);
    } else if (prop.kind === "booth") {
      framed(p, 2, 16, w - 4, h - 19, "#efe0bd"); p("#3f6a66", 3, h - 22, w - 6, 18); p(gold, 3, h - 23, w - 6, 2);
      for (let i = 0; i < 8; i++) p(i % 2 ? "#fff4d6" : "#d9603f", i * (w / 8), 4, w / 8 + 1, 15);
      p(OUT, 0, 2, w, 2); p(OUT, 0, 19, w, 2); for (let i = 0; i < 8; i++) p(i % 2 ? "#e6d3a8" : "#a8432f", i * (w / 8), 21, w / 8 + 1, 2);
      framed(p, 14, 30, w - 28, 24, "#ffd98c"); p("#f2b866", 15, 44, w - 30, 9); p(OUT, 12, 52, w - 24, 3);
      disc(p, w / 2, 40, 4, "#6b4f4a"); p("#3f5f80", w / 2 - 6, 44, 12, 8);
      framed(p, w / 2 - 19, 7, 38, 11, "#2a2238"); paintText(p, "TIKET", w / 2 - 14, 9, palette.gold);
    } else if (prop.kind === "luggage") {
      framed(p, 2, h - 18, w - 6, 15, "#a8532f"); p("#c96f43", 3, h - 17, w - 8, 2); p("#7c3a24", 3, h - 6, w - 8, 2); p(gold, 8, h - 18, 3, 15); p(gold, w - 14, h - 18, 3, 15);
      framed(p, 8, h - 31, w - 18, 14, "#4d8583"); p("#6ba5a0", 9, h - 30, w - 20, 2); p(OUT, w / 2 - 6, h - 34, 8, 4);
      framed(p, 14, h - 40, 16, 10, "#d9b45e"); p("#efd287", 15, h - 39, 14, 2);
    } else if (prop.kind === "cart") {
      framed(p, 1, h - 20, w - 2, 12, "#6b4630"); p("#8f5d3b", 2, h - 19, w - 4, 2); for (const x of [8, w - 16]) { disc(p, x + 4, h - 6, 4, OUT); disc(p, x + 4, h - 6, 2, "#8a8494"); }
      framed(p, 6, h - 32, 24, 13, "#c96f43"); p(gold, 16, h - 32, 3, 13); framed(p, 30, h - 28, 18, 9, "#4d8583"); framed(p, 12, h - 38, 12, 7, "#d9b45e");
    } else if (prop.kind === "rack") {
      framed(p, 2, 0, w - 4, h - 3, "#3f3a4d"); p("#5a5365", 3, 1, w - 6, 2);
      for (let y = 5; y < h - 8; y += 7) { framed(p, 5, y, w - 10, 6, "#26222f"); for (let x = 8; x < w - 8; x += 4) p(["#8fe3d2", "#edbe74", "#e8606a"][Math.floor(hash(x, y) * 3)], x, y + 2, 2, 2); }
    } else if (prop.kind === "trophy") {
      framed(p, 0, 0, w, h - 3, darkWood); p("#a7714b", 1, 1, w - 2, 2); p("#3a2a2c", 3, 4, w - 6, h - 11); p("#a7714b", 3, 22, w - 6, 2);
      for (const x of [8, 22, 35]) { p(gold, x, 8, 7, 6); p("#fff1c9", x + 1, 9, 2, 2); p(gold, x + 2, 14, 3, 4); p("#b98a4b", x + 1, 18, 5, 3); }
      for (const x of [7, 21, 34]) { framed(p, x, 32, 10, 12, ["#d9603f", "#4d8583", paper][Math.floor(x / 14) % 3]); }
      p("#ffffff14", 4, 4, 6, h - 12);
    } else if (prop.kind === "crate") {
      framed(p, 2, h - 26, w - 4, 23, "#a7774f"); p("#c79f75", 3, h - 25, w - 6, 2); p("#7c5a42", 3, h - 6, w - 6, 2);
      for (let i = 0; i < 16; i++) p("#7c5a42", 4 + i, h - 22 + i, 2, 1);
      p(OUT, 2, h - 15, w - 4, 1);
    } else if (prop.kind === "parcels") {
      framed(p, 1, h - 20, 26, 17, "#c79f75"); p("#e3bf93", 2, h - 19, 24, 2); p("#d9603f", 13, h - 20, 3, 17);
      framed(p, 24, h - 16, 22, 13, "#b98a5e"); p("#d6ab7c", 25, h - 15, 20, 2); p("#f6e3b4", 34, h - 16, 3, 13);
      framed(p, 8, h - 33, 22, 14, "#d9b45e"); p("#efd287", 9, h - 32, 20, 2); p("#3f5f80", 18, h - 33, 2, 14);
    } else if (prop.kind === "archive") {
      framed(p, 2, 0, w - 4, h - 3, "#5a6a72"); p("#7b8c94", 3, 1, w - 6, 2);
      for (let y = 5; y < h - 10; y += 11) { framed(p, 5, y, w - 10, 10, "#70828b"); p("#8fa1aa", 6, y + 1, w - 12, 1); framed(p, w / 2 - 6, y + 3, 12, 4, paper); }
    } else if (prop.kind === "document") {
      p(OUT, w / 2 - 2, h - 15, 4, 13); p(darkWood, w / 2 - 1, h - 15, 2, 12); framed(p, w / 2 - 8, h - 5, 16, 3, darkWood);
      framed(p, 5, 3, w - 10, h - 17, darkWood); framed(p, 8, 7, w - 16, h - 24, "#fff8e4"); framed(p, w / 2 - 4, 1, 8, 5, "#8a8494");
      paintText(p, "CV", w / 2 - 5, 10, "#d9603f"); p("#a88a69", 10, 20, w - 20, 1); p("#a88a69", 10, 23, w - 20, 1);
    } else if (prop.kind === "book") {
      p(OUT, w / 2 - 3, h - 18, 6, 15); p(darkWood, w / 2 - 2, h - 18, 4, 14); framed(p, 6, h - 5, w - 12, 3, darkWood);
      framed(p, 2, 4, w - 4, 16, "#7c3a35"); framed(p, 4, 5, w / 2 - 4, 13, "#fff8e4"); framed(p, w / 2, 5, w / 2 - 4, 13, "#fff4d6");
      for (const y of [8, 11, 14]) { p("#a88a69", 6, y, w / 2 - 8, 1); p("#a88a69", w / 2 + 2, y, w / 2 - 8, 1); }
    } else {
      table(h - 26);
      if (prop.kind === "terminal") {
        p(OUT, w / 2 - 3, 18, 6, 3); framed(p, w / 2 - 12, 1, 24, 18, "#d8cfbe"); p("#f0e8d8", w / 2 - 11, 2, 22, 1); p("#14202c", w / 2 - 9, 4, 18, 11); p("#a89e8c", w / 2 - 11, 16, 22, 2); p("#8fe3d2", w / 2 + 8, 17, 2, 1);
        framed(p, w / 2 - 11, h - 26 + 1, 22, 5, "#efe6d4"); for (let x = w / 2 - 9; x < w / 2 + 9; x += 3) p("#a89e8c", x, h - 24, 2, 2);
        p(OUT, w - 10, h - 30, 6, 5); p("#d9603f", w - 9, h - 29, 4, 3);
      } else if (prop.kind === "desk") {
        framed(p, 5, h - 34, 14, 9, "#fff8e4"); p("#a88a69", 7, h - 31, 10, 1); p("#a88a69", 7, h - 28, 8, 1);
        framed(p, 24, h - 38, 9, 13, darkWood); framed(p, 26, h - 36, 5, 7, "#88b9bb");
        p(OUT, w - 11, h - 33, 7, 8); p("#fff4d6", w - 10, h - 32, 5, 6); p("#d9603f", w - 10, h - 30, 5, 2);
      } else {
        framed(p, 5, h - 34, 13, 9, teal); p("#88b9bb", 6, h - 33, 11, 2); framed(p, 22, h - 31, 18, 6, paper); p("#c98d60", 24, h - 29, 14, 1);
        framed(p, w - 18, h - 36, 8, 11, gold); p("#3f3a4d", w - 16, h - 33, 4, 2); framed(p, w - 8, h - 30, 6, 5, "#8a8494");
      }
    }
  });
  return key;
}

const CAR_ORDER = ["about", "projects", "experience", "skills", "contact"];
const WALL = 64;
const DOOR_TOP = 176;
const DOOR_BOTTOM = 224;
/** Glass rectangles over the baked panes, in carriage-local pixels. */
export const CAR_WINDOWS = [{ x: 36, y: 12, w: 88, h: 32 }, { x: 260, y: 12, w: 88, h: 32 }];
export const CAR_SCONCES = [130, 254];

const THEMES: Record<string, { wall: string; wainscot: string; floor: [string, string, string]; pattern: "plank" | "tile" | "parquet" }> = {
  about: { wall: "#ecd4a6", wainscot: "#8a5a3c", floor: ["#c08f62", "#b48257", "#c9996c"], pattern: "plank" },
  projects: { wall: "#46677a", wainscot: "#2c4453", floor: ["#6f7482", "#5f6472", "#7b808e"], pattern: "tile" },
  experience: { wall: "#efe2bf", wainscot: "#73624a", floor: ["#c9a06a", "#b48c58", "#d6ae79"], pattern: "parquet" },
  skills: { wall: "#90a67f", wainscot: "#4f6650", floor: ["#9a6f4c", "#8c6242", "#a67a55"], pattern: "plank" },
  contact: { wall: "#8d6f96", wainscot: "#4e3a5c", floor: ["#a87a64", "#996c58", "#b58770"], pattern: "plank" },
};

function paintFloor(p: Paint, pattern: string, colors: [string, string, string], x0: number, y0: number, x1: number, y1: number) {
  const [a, b, c] = colors;
  if (pattern === "tile") {
    for (let y = y0; y < y1; y += 16) for (let x = x0; x < x1; x += 16) {
      const color = ((x + y) / 16) % 2 ? a : b;
      p(color, x, y, Math.min(16, x1 - x), Math.min(16, y1 - y));
      p(mix(color, "#ffffff", 0.14), x, y, Math.min(16, x1 - x), 1); p(mix(color, OUT, 0.25), x, y, 1, Math.min(16, y1 - y));
    }
  } else if (pattern === "parquet") {
    for (let y = y0; y < y1; y += 16) for (let x = x0; x < x1; x += 16) {
      const across = ((x + y) / 16) % 2 === 0;
      for (let i = 0; i < 4; i++) {
        const color = [a, b, c, a][Math.floor(hash(x + i, y) * 4)];
        if (across) p(color, x, y + i * 4, Math.min(16, x1 - x), Math.min(4, y1 - y - i * 4));
        else p(color, x + i * 4, y, Math.min(4, x1 - x - i * 4), Math.min(16, y1 - y));
      }
      p(mix(a, OUT, 0.35), x, y, Math.min(16, x1 - x), 1); p(mix(a, OUT, 0.35), x, y, 1, Math.min(16, y1 - y));
    }
  } else {
    for (let y = y0, row = 0; y < y1; y += 12, row++) {
      const height = Math.min(12, y1 - y);
      p([a, b, c, b][row % 4], x0, y, x1 - x0, height);
      p(mix(c, "#ffffff", 0.22), x0, y, x1 - x0, 1); p(mix(a, OUT, 0.42), x0, y + height - 1, x1 - x0, 1);
      for (let x = x0 + Math.floor(hash(row) * 40); x < x1; x += 44 + Math.floor(hash(row, x) * 44)) {
        p(mix(a, OUT, 0.42), x, y, 1, height);
        if (hash(x, row) > 0.55 && x + 12 < x1) p(mix(a, OUT, 0.18), x + 5, y + 5, 7, 1);
      }
    }
  }
}

const darkFrame = "#6b4630";

function paintWallArt(p: Paint, id: string, accent: string, width: number) {
  const { paper } = palette;
  const center = width / 2;
  const number =String(CAR_ORDER.indexOf(id) + 1).padStart(2, "0");
  const title = `${number} ${id.toUpperCase()}`;
  const plate = textWidth(title) + 12;
  framed(p, center - plate / 2, 6, plate, 12, "#2a2238"); p(accent, center - plate / 2 + 1, 15, plate - 2, 2);
  paintText(p, title, center - textWidth(title) / 2, 8, palette.paper);
  if (id === "about") {
    framed(p, center - 42, 24, 26, 22, darkFrame); framed(p, center - 39, 27, 20, 16, "#88b9bb"); disc(p, center - 29, 33, 4, "#efc39a"); p("#231d2b", center - 33, 28, 8, 3); p("#2f3a52", center - 34, 38, 10, 5);
    framed(p, center - 10, 26, 20, 18, darkFrame); framed(p, center - 7, 29, 14, 12, "#e8a95c"); p("#4f7a4a", center - 6, 36, 12, 4); disc(p, center + 2, 33, 2, "#fff4d6");
    framed(p, center + 16, 24, 26, 22, darkFrame); framed(p, center + 19, 27, 20, 16, paper); paintText(p, "HI", center + 24, 31, "#d9603f");
  } else if (id === "projects") {
    framed(p, center - 46, 22, 92, 27, "#1f3f66"); for (let x = center - 42; x < center + 42; x += 8) p("#2f5a8a", x, 23, 1, 25); for (let y = 26; y < 48; y += 6) p("#2f5a8a", center - 45, y, 90, 1);
    p("#cfe6ff", center - 36, 30, 30, 1); p("#cfe6ff", center - 36, 30, 1, 12); p("#cfe6ff", center - 36, 42, 30, 1); p("#cfe6ff", center - 6, 30, 1, 12); p("#cfe6ff", center + 8, 34, 24, 1); p("#cfe6ff", center + 8, 40, 16, 1); p("#edbe74", center - 26, 35, 10, 3);
  } else if (id === "experience") {
    framed(p, center - 48, 22, 96, 27, darkFrame); framed(p, center - 45, 24, 90, 22, "#355a4c");
    paintText(p, "TEACH", center - 41, 26, "#f6f0dc"); paintText(p, "LEAD", center - 7, 36, "#edbe74"); p("#f6f0dc", center + 22, 30, 18, 1); p("#f6f0dc", center + 22, 34, 12, 1); p("#f6f0dc", center - 41, 40, 22, 1);
  } else if (id === "skills") {
    framed(p, center - 46, 22, 92, 27, "#b48a5e"); for (let y = 26; y < 48; y += 4) for (let x = center - 42; x < center + 44; x += 4) p("#8f6a44", x, y, 1, 1);
    p("#5a5365", center - 36, 25, 3, 16); p("#8a8494", center - 38, 24, 7, 4); p("#d9603f", center - 22, 26, 3, 18); p("#e8e0d0", center - 22, 24, 3, 4); p("#3f5f80", center - 8, 30, 14, 12); p("#88b9bb", center - 6, 32, 10, 8); p("#5a5365", center + 14, 26, 3, 18); disc(p, center + 15, 27, 3, "#8a8494"); p("#edbe74", center + 28, 26, 8, 14); p("#c49a4f", center + 28, 36, 8, 4);
  } else {
    framed(p, center - 46, 22, 92, 27, paper); paintText(p, "HELLO", center - 40, 26, "#7c3a35"); p("#a88a69", center - 40, 37, 36, 1); p("#a88a69", center - 40, 41, 26, 1);
    framed(p, center + 18, 25, 20, 20, "#d9603f"); framed(p, center + 22, 29, 12, 12, "#fff4d6"); p("#7c3a35", center + 25, 32, 6, 1); p("#7c3a35", center + 25, 35, 6, 1);
  }
}

/** One opaque, cached bitmap per carriage: detail adds no per-frame draw commands. */
export function carriageTexture(scene: Phaser.Scene, id: string, accent: string, width: number, height: number): string {
  const key = `carriage-${id}`;
  if (scene.textures.exists(key)) return key;
  canvasTexture(scene, key, width, height, (p, context) => {
    const theme = THEMES[id] ?? THEMES.about;
    const floorBottom = height - 24;
    const index = CAR_ORDER.indexOf(id);
    p(palette.shadow, 0, 0, width, height);
    paintFloor(p, theme.pattern, theme.floor, 16, WALL, width - 16, floorBottom);

    // Woven runner along the walking line, with tassels and a quiet border.
    const rug = mix("#473940", accent, 0.62);
    const edge = mix(rug, "#edbe74", 0.65);
    p("#1c172a40", 24, 164, width - 46, 80); p(rug, 22, 160, width - 44, 80);
    p(edge, 25, 163, width - 50, 2); p(edge, 25, 235, width - 50, 2); p(edge, 25, 163, 2, 74); p(edge, width - 27, 163, 2, 74);
    for (let x = 30; x < width - 28; x += 6) { p("#dec18f", x, 157, 2, 3); p("#dec18f", x, 240, 2, 3); }
    for (let x = 40; x < width - 44; x += 28) { const y = 192; p(edge, x + 6, y, 4, 4); p(mix(rug, "#edbe74", 0.3), x + 3, y + 1, 10, 2); p(mix(rug, "#edbe74", 0.3), x + 7, y - 3, 2, 10); }
    for (let y = 170; y < 232; y += 4) p(mix(rug, "#302b42", 0.1), 30, y, width - 60, 1);

    // Baked low sun: window light falls across the floor and rug.
    for (const glass of CAR_WINDOWS) for (let y = WALL + 4, step = 0; y < WALL + 104 && y < floorBottom; y += 4, step++) {
      p("#ffd59622", glass.x + 8 + step * 2, y, glass.w - 12, 4);
    }
    p("#1c172a55", 16, WALL, width - 32, 6); p("#1c172a28", 16, WALL + 6, width - 32, 5);
    p("#1c172a38", 16, WALL, 5, floorBottom - WALL); p("#1c172a38", width - 21, WALL, 5, floorBottom - WALL);
    p("#1c172a40", 16, floorBottom - 5, width - 32, 5);

    // Back wall: roof line, cornice, paneling, and wainscot.
    p(OUT, 0, 0, width, 4); p("#4a3f58", 1, 1, width - 2, 2);
    for (let x = 8; x < width - 4; x += 16) p("#6a5c78", x, 1, 2, 2);
    p(mix(theme.wall, "#ffffff", 0.4), 2, 4, width - 4, 2); p(theme.wall, 2, 6, width - 4, 46);
    for (let x = 16; x < width - 16; x += 32) p(mix(theme.wall, OUT, 0.08), x, 6, 1, 46);
    p(mix(theme.wall, OUT, 0.14), 2, 6, width - 4, 2);
    p(mix(theme.wainscot, "#ffffff", 0.3), 2, 50, width - 4, 2); p(theme.wainscot, 2, 52, width - 4, 10); p(OUT, 2, 62, width - 4, 2);
    for (let x = 20; x < width - 16; x += 24) { p(mix(theme.wainscot, OUT, 0.3), x, 53, 1, 8); p(mix(theme.wainscot, "#ffffff", 0.14), x + 1, 53, 1, 8); }

    // Window pixels are baked inside their frames: no scene-wide panorama can show through.
    for (const { x, y, w, h } of CAR_WINDOWS) {
      p(OUT, x - 4, y - 4, w + 8, h + 9); p("#8a5f42", x - 3, y - 3, w + 6, h + 7); p("#b98a5e", x - 3, y - 3, w + 6, 1); p("#6b4630", x - 1, y - 1, w + 2, h + 2);
      p("#446c68", x, y, w, h);
      if (scene.textures.exists("countryside")) context.drawImage(scene.textures.get("countryside").getSourceImage() as HTMLImageElement, x, y, w, h);
      p("#e5c496", x - 4, y + h + 3, w + 8, 2);
    }
    paintWallArt(p, id, accent, width);
    for (const x of CAR_SCONCES) { p(OUT, x - 3, 24, 6, 9); p("#ffe6a8", x - 2, 25, 4, 6); p("#fff8d8", x - 1, 26, 2, 2); p(palette.darkWood, x - 2, 33, 4, 2); }

    // End walls, seen from above, opening onto the passages between carriages.
    const end = mix(theme.wainscot, "#ffffff", 0.12);
    for (const [x, open] of [[0, index > 0], [width - 16, index < CAR_ORDER.length - 1]] as const) {
      p(OUT, x, WALL, 16, floorBottom - WALL); p(end, x + 2, WALL, 12, floorBottom - WALL); p(mix(end, "#ffffff", 0.22), x + 2, WALL, 12, 2);
      for (let y = WALL + 14; y < floorBottom; y += 28) p(mix(end, OUT, 0.32), x + 4, y, 8, 1);
      if (open) {
        paintFloor(p, theme.pattern, theme.floor, x, DOOR_TOP, x + 16, DOOR_BOTTOM);
        p(palette.gold, x, DOOR_TOP - 2, 16, 2); p(palette.gold, x, DOOR_BOTTOM, 16, 2);
        p(OUT, x, DOOR_TOP - 4, 16, 2); p(OUT, x, DOOR_BOTTOM + 2, 16, 2);
      }
    }

    // Front skirt: the cut edge of the wall, then the train's painted exterior.
    p(mix(theme.wainscot, "#ffffff", 0.2), 2, floorBottom, width - 4, 3); p(theme.wainscot, 2, floorBottom + 3, width - 4, 6); p(OUT, 2, floorBottom + 9, width - 4, 2);
    p("#efe0bd", 2, floorBottom + 11, width - 4, 3); p(palette.gold, 2, floorBottom + 14, width - 4, 1); p("#3f6a66", 2, floorBottom + 15, width - 4, 7); p("#2f5350", 2, floorBottom + 20, width - 4, 2);
    for (let x = 10; x < width - 9; x += 24) p("#5d8a84", x, floorBottom + 17, 2, 1);
  });
  return key;
}

export function connectorTexture(scene: Phaser.Scene): string {
  const key = "carriage-connector";
  if (scene.textures.exists(key)) return key;
  canvasTexture(scene, key, 64, 64, (p) => {
    p(palette.shadow, 0, 0, 64, 64); p("#57505f", 0, 6, 64, 52);
    p("#8d8496", 0, 8, 64, 48);
    for (let x = 0; x < 64; x += 8) { p("#6f6778", x, 8, 1, 48); p("#a49bab", x + 1, 8, 1, 48); for (let y = 12; y < 54; y += 8) p("#6f6778", x + 4, y, 2, 2); }
    p(OUT, 0, 5, 64, 3); p(OUT, 0, 56, 64, 3); p(palette.gold, 0, 8, 64, 1); p(palette.gold, 0, 55, 64, 1);
    p("#1c172a40", 0, 9, 64, 4); p("#1c172a40", 0, 51, 64, 4);
  });
  return key;
}
