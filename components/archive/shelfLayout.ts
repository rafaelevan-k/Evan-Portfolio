import type { BookCategory } from "@/lib/archiveBooks";

// The room group sits this far below world origin; book Y values below are in room space
export const ROOM_OFFSET_Y = -1;
export const ARCHIVE_FONT = "/fonts/playfair-display-latin-400-normal.woff";

export const SHELF_WIDTH = 3.6;
export const SHELF_HEIGHT = 3.1;
export const SHELF_DEPTH = 0.5;
// Top surface of each shelf board, bottom level first
export const SHELF_SURFACES = [0.1, 0.85, 1.6, 2.35];
export const LEVEL_CLEAR_HEIGHT = 0.71;
export const UPRIGHT_X = [-0.6, 0.6];
const BACK_PANEL_FRONT_Z = -0.2;

export const HERO_WIDTH = 0.13;
export const HERO_HEIGHT = 0.62;
export const HERO_DEPTH = 0.38;
// How far a selected book travels out of the shelf toward the camera
export const PULL_OUT_Z = 1.25;

export interface HeroBook {
  type: BookCategory;
  title: string;
  color: string;
  level: number;
  position: [number, number, number];
  yaw: number;
}

function heroPosition(level: number, x: number): [number, number, number] {
  return [x, SHELF_SURFACES[level] + HERO_HEIGHT / 2, BACK_PANEL_FRONT_Z + HERO_DEPTH / 2 + 0.02];
}

// The CV sits at eye level because it is the book most visitors come for
export const HERO_BOOKS: HeroBook[] = [
  { type: "volunteer", title: "Volunteer & Org", color: "#b8761a", level: 0, position: heroPosition(0, -0.12), yaw: 0.02 },
  { type: "certifications", title: "Certifications", color: "#23408f", level: 1, position: heroPosition(1, 1.14), yaw: -0.02 },
  { type: "cv", title: "Curriculum Vitae", color: "#8f1f24", level: 2, position: heroPosition(2, 0.05), yaw: 0.015 },
  { type: "awards", title: "Awards", color: "#1a6b48", level: 3, position: heroPosition(3, -1.16), yaw: -0.025 },
];

export interface BoxInstance {
  position: [number, number, number];
  scale: [number, number, number];
  rotationZ: number;
  color?: string;
}

export interface FillerBooks {
  covers: BoxInstance[];
  pages: BoxInstance[];
  bands: BoxInstance[];
}

const FILLER_COLORS = ["#37201c", "#1f2a38", "#2a3528", "#3f2f22", "#29282b", "#544429", "#28393a"];
const BAYS: [number, number][] = [[-1.77, -0.625], [-0.575, 0.575], [0.625, 1.77]];

function seededRandom(seed: number) {
  let state = seed;
  return () => {
    state = (state * 16807) % 2147483647;
    return (state - 1) / 2147483646;
  };
}

// Deterministic so the shelf looks the same on every visit
export function buildFillerBooks(): FillerBooks {
  const random = seededRandom(20260);
  const between = (min: number, max: number) => min + random() * (max - min);
  const pick = () => FILLER_COLORS[Math.floor(random() * FILLER_COLORS.length)];
  const books: FillerBooks = { covers: [], pages: [], bands: [] };

  const addUpright = (x: number, surface: number, width: number, height: number, depth: number, rotationZ: number) => {
    const y = surface + (height / 2) * Math.cos(rotationZ) + (width / 2) * Math.sin(rotationZ);
    const z = BACK_PANEL_FRONT_Z + depth / 2;
    books.covers.push({ position: [x, y, z], scale: [width, height, depth], rotationZ, color: pick() });
    books.pages.push({ position: [x, y, z - 0.008], scale: [width - 0.012, height + 0.003, depth - 0.016], rotationZ });

    if (rotationZ === 0 && random() < 0.55) {
      for (const offset of [-0.36, 0.36]) {
        books.bands.push({
          position: [x, y + height * offset, z + depth / 2 + 0.001],
          scale: [width - 0.014, 0.006, 0.002],
          rotationZ: 0,
        });
      }
    }
  };

  SHELF_SURFACES.forEach((surface, level) => {
    BAYS.forEach(([start, end]) => {
      const hero = HERO_BOOKS.find((book) => book.level === level && book.position[0] > start && book.position[0] < end);
      const limit = hero ? end : start + (end - start) * between(0.6, 0.8);
      let x = start + 0.005;

      while (x < limit - 0.1) {
        const width = between(0.05, 0.1);
        if (hero && x + width > hero.position[0] - HERO_WIDTH / 2 - 0.012 && x < hero.position[0] + HERO_WIDTH / 2 + 0.012) {
          x = hero.position[0] + HERO_WIDTH / 2 + 0.012;
          continue;
        }
        addUpright(x + width / 2, surface, width, between(0.44, LEVEL_CLEAR_HEIGHT - 0.11), between(0.34, 0.38), 0);
        x += width + 0.002;
      }

      if (hero) return;

      // The rest of the bay gets one leaning book and a small flat stack
      const leanWidth = between(0.05, 0.08);
      const leanHeight = between(0.46, 0.56);
      const lean = 0.14;
      addUpright(x + leanWidth / 2 + (leanHeight / 2) * Math.sin(lean), surface, leanWidth, leanHeight, 0.34, lean);

      const stackCount = 2 + Math.floor(random() * 2);
      let stackY = surface;
      for (let i = 0; i < stackCount; i++) {
        const thickness = between(0.04, 0.06);
        books.covers.push({
          position: [end - 0.17 + between(-0.01, 0.01), stackY + thickness / 2, BACK_PANEL_FRONT_Z + 0.17],
          scale: [0.3 - i * 0.02, thickness, 0.32],
          rotationZ: 0,
          color: pick(),
        });
        stackY += thickness;
      }
    });
  });

  return books;
}
