export const TILE = 16;
export type Cell = { x: number; y: number };
export type SceneId = "station" | "train";
export type CarriageId = "about" | "projects" | "experience" | "skills" | "contact";
export type PayloadId = "guide" | "navigation" | "boarding" | "about" | "education" | "experience" | "certifications" | "contact" | "cv" | "archive" | "return" | "flavor" | `project:${number}` | `skill:${number}`;
export type Interaction = {
  id: string;
  type: "npc" | "desk" | "terminal" | "board" | "shelf" | "mail" | "document" | "door" | "sign";
  label: string;
  x: number;
  y: number;
  range: number;
  payloadId: PayloadId;
  targetScene?: SceneId;
  carriage?: CarriageId;
  /** Spoken as a small speech bubble instead of opening a detail dialog. */
  line?: string;
};
export type Prop = { kind: string; x: number; y: number; width: number; height: number; interactionId?: string };
export type WorldMap = { scene: SceneId; grid: number[][]; spawn: Cell; props: Prop[]; interactions: Interaction[]; width: number; height: number };

export const CARRIAGES = [
  { id: "about", label: "About", name: "The beginning", description: "Meet Rafael, his story, and his education.", color: "#df986b" },
  { id: "projects", label: "Projects", name: "The workshop", description: "Six builds. Six little computer terminals.", color: "#88b9bb" },
  { id: "experience", label: "Experience", name: "The people", description: "Teaching, leadership, and working together.", color: "#dcb96c" },
  { id: "skills", label: "Skills", name: "The toolkit", description: "Browse the shelves of technologies and tools.", color: "#acb88b" },
  { id: "contact", label: "Contact", name: "The next chapter", description: "Take a CV, say hello, or return to the site.", color: "#c3a0bb" },
] as const;

export const CAR_START = 2;
export const CAR_WIDTH = 24;
export const CAR_STEP = 26;
export const CAR_TOP = 6;
export const FLOOR_TOP = 10;
export const CAR_BOTTOM = 24;

export function cameraLayout(scene: SceneId, width: number, height: number) {
  const desktopInterior = scene === "train" && width >= 768 && height >= 360;
  const bodyHeight = (CAR_BOTTOM - CAR_TOP + 1) * TILE + 8;
  const fit = (height - 76) / bodyHeight;
  // Whole-number zoom keeps every art pixel the same size; only short windows use a fraction.
  const zoom = desktopInterior
    ? fit >= 2 ? Math.min(3, Math.floor(fit)) : Math.max(0.75, Math.floor(fit * 4) / 4)
    : height < 310 ? 1 : width >= 768 && height >= 1000 ? 3 : 2;
  return { zoom, desktopInterior, centerY: CAR_TOP * TILE + bodyHeight / 2 - 16 / zoom };
}

export function toCell(x: number, y: number): Cell { return { x: Math.floor(x / TILE), y: Math.floor(y / TILE) }; }
export function cellCenter(cell: Cell): Cell { return { x: (cell.x + 0.5) * TILE, y: (cell.y + 0.5) * TILE }; }
export function isWalkable(grid: number[][], cell: Cell): boolean { return grid[cell.y]?.[cell.x] === 0; }
export function inRange(position: Cell, target: Interaction): boolean { return Math.hypot(position.x - target.x, position.y - target.y) <= target.range; }
export function walkVelocity(x: number, y: number, speed = 95): Cell {
  const divisor = Math.max(1, Math.hypot(x, y));
  return { x: x / divisor * speed, y: y / divisor * speed };
}
export function interactionAt(map: WorldMap, point: Cell): Interaction | null {
  return map.interactions.filter((target) => {
    const prop = map.props.find((item) => item.interactionId === target.id);
    const halfWidth = Math.max(24, (prop?.width ?? 2) * TILE / 2 + 6);
    return Math.abs(point.x - target.x) <= halfWidth && point.y >= target.y - 48 && point.y <= target.y + 24;
  }).sort((a, b) => Math.hypot(point.x - a.x, point.y - a.y) - Math.hypot(point.x - b.x, point.y - b.y))[0] ?? null;
}
export function carriageAt(x: number): CarriageId {
  return CARRIAGES[Math.max(0, Math.min(4, Math.floor((x / TILE - CAR_START) / CAR_STEP)))].id;
}
export function carriageSpawn(id: CarriageId): Cell {
  const index = CARRIAGES.findIndex((car) => car.id === id);
  return cellCenter({ x: CAR_START + Math.max(0, index) * CAR_STEP + 11, y: 18 });
}

export function createWorld(scene: SceneId, projectCount = 6): WorldMap {
  const columns = scene === "station" ? 72 : 134;
  const grid = Array.from({ length: 30 }, () => Array<number>(columns).fill(1));
  const props: Prop[] = [];
  const interactions: Interaction[] = [];
  const clear = (x: number, y: number, w: number, h: number) => {
    for (let yy = y; yy < y + h; yy++) for (let xx = x; xx < x + w; xx++) grid[yy][xx] = 0;
  };
  const prop = (kind: string, x: number, y: number, width = 2, height = 2, interaction?: Omit<Interaction, "x" | "y" | "range">) => {
    for (let yy = y; yy < y + height; yy++) for (let xx = x; xx < x + width; xx++) grid[yy][xx] = 1;
    props.push({ kind, x: (x + width / 2) * TILE, y: (y + height / 2) * TILE, width, height, interactionId: interaction?.id });
    if (interaction) interactions.push({ ...interaction, x: (x + width / 2) * TILE, y: (y + height / 2) * TILE, range: 44 });
  };
  const flavor = (id: string, label: string, line: string) => ({ id, type: "npc" as const, label, payloadId: "flavor" as const, line });
  if (scene === "station") {
    clear(3, 14, 66, 13);
    prop("booth", 4, 14, 6, 3);
    prop("lamp", 11, 14, 1, 1);
    prop("nameboard-yk", 14, 14, 6, 1);
    prop("bench", 21, 14, 4, 1);
    prop("lamp", 28, 14, 1, 1);
    prop("sign", 40, 14, 3, 1, { id: "station-map", type: "sign", label: "Read the route map", payloadId: "navigation" });
    prop("lamp", 44, 14, 1, 1);
    prop("bench", 47, 14, 4, 1);
    prop("nameboard-rl", 52, 14, 6, 1);
    prop("lamp", 60, 14, 1, 1);
    prop("luggage", 63, 14, 3, 2);
    prop("conductor", 31, 17, 1, 1, { id: "conductor", type: "npc", label: "Talk to the conductor", payloadId: "guide" });
    prop("passenger", 17, 20, 1, 1, flavor("station-passenger", "Chat with a passenger", "They say every carriage holds something different. I'm starting with the workshop."));
    prop("cat", 50, 21, 1, 1, flavor("station-cat", "Pet the station cat", "Mrrp. The cat approves of your travel plans."));
    prop("cart", 22, 23, 4, 2);
    for (const x of [5, 15, 29, 42, 55, 65]) prop("planter", x, 25, 3, 2);
    interactions.push({ id: "train-entrance", type: "door", label: "Board the train", x: 576, y: 200, range: 44, payloadId: "boarding", targetScene: "train" });
  } else {
    CARRIAGES.forEach((car, index) => {
      const start = CAR_START + index * CAR_STEP;
      clear(start + 1, FLOOR_TOP, CAR_WIDTH - 2, CAR_BOTTOM - FLOOR_TOP);
      if (index < 4) clear(start + CAR_WIDTH - 1, 17, 4, 3);
      if (index > 0) clear(start, 17, 1, 3);
      const interact = (id: string, type: Interaction["type"], label: string, payloadId: PayloadId) => ({ id, type, label, payloadId, carriage: car.id });
      prop("plant", start + 2, 10);
      prop("plant", start + 20, 21);
      if (car.id === "about") {
        prop("desk", start + 7, 10, 3, 2, interact("profile-desk", "desk", "Meet Rafael", "about"));
        prop("shelf", start + 11, 10, 3, 2);
        prop("education", start + 16, 10, 3, 2, interact("education", "board", "Read the education board", "education"));
        prop("sofa", start + 4, 21, 5, 2);
        prop("lamp", start + 10, 21, 1, 1);
        prop("book", start + 13, 21, 2, 2, interact("about-story", "document", "Read Rafael's story", "about"));
      }
      if (car.id === "projects") {
        for (let i = 0; i < projectCount; i++) {
          const col = i % 3;
          const row = Math.floor(i / 3);
          if (row > 1) break;
          prop("terminal", start + 5 + col * 6, row === 0 ? 10 : 21, 3, 2, interact(`terminal-${i}`, "terminal", `Open project ${String(i + 1).padStart(2, "0")}`, `project:${i}`));
        }
        prop("rack", start + 20, 10, 2, 2);
        prop("crate", start + 2, 21, 2, 2);
        prop("engineer", start + 3, 14, 1, 1, flavor("workshop-engineer", "Chat with the engineer", "Every terminal here opens a real build. Go on, poke one."));
      }
      if (car.id === "experience") {
        prop("timeline", start + 6, 10, 6, 2, interact("timeline", "board", "Read the experience timeline", "experience"));
        prop("trophy", start + 14, 10, 3, 2);
        prop("teacher", start + 19, 13, 1, 1, interact("teacher", "npc", "Talk about teaching & leadership", "experience"));
        prop("certificate", start + 12, 21, 4, 2, interact("credentials", "board", "View certifications", "certifications"));
        prop("sofa", start + 3, 21, 5, 2);
      }
      if (car.id === "skills") {
        [5, 11, 17].forEach((x, i) => prop("shelf", start + x, 10, 4, 2, interact(`skill-shelf-${i}`, "shelf", ["Browse frontend skills", "Browse backend & data", "Browse tools & practice"][i], `skill:${i}`)));
        prop("worktable", start + 8, 21, 5, 2);
        prop("crate", start + 15, 21, 2, 2);
        prop("cat", start + 3, 15, 1, 1, flavor("skills-cat", "Pet the carriage cat", "Mrow. The cat is sitting on the documentation again."));
      }
      if (car.id === "contact") {
        prop("mail", start + 5, 10, 2, 2, interact("mailbox", "mail", "Say hello to Rafael", "contact"));
        prop("document", start + 11, 10, 2, 2, interact("cv", "document", "Take a look at the CV", "cv"));
        prop("archive", start + 17, 10, 3, 2, interact("archive", "document", "Visit the document archive", "archive"));
        prop("exit", start + 11, 21, 3, 2, interact("exit", "door", "Return to the portfolio", "return"));
        prop("sofa", start + 3, 21, 5, 2);
        prop("parcels", start + 16, 21, 3, 2);
      }
    });
  }
  return { scene, grid, props, interactions, spawn: scene === "station" ? { x: 584, y: 312 } : carriageSpawn("about"), width: columns * TILE, height: grid.length * TILE };
}
