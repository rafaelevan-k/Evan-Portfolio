import type Phaser from "phaser";
import type { Prop } from "./world";

export const palette = { ink: "#302b42", shadow: "#221f30", wall: "#ead7aa", wood: "#b77c54", darkWood: "#70482f", gold: "#edbe74", teal: "#5d9291", green: "#748764", rose: "#bd7c78", paper: "#fbebc7" };
type Paint = (color: string, x: number, y: number, w: number, h: number) => void;

function canvasTexture(scene: Phaser.Scene, key: string, w: number, h: number, draw: (p: Paint, context: CanvasRenderingContext2D) => void) {
  const texture = scene.textures.createCanvas(key, w, h)!;
  const context = texture.getContext();
  context.imageSmoothingEnabled = false;
  draw((color, x, y, width, height) => { context.fillStyle = color; context.fillRect(Math.round(x), Math.round(y), Math.round(width), Math.round(height)); }, context);
  texture.refresh();
}

function mix(a: string, b: string, amount: number) {
  const channels = [1, 3, 5].map((offset) => Math.round(parseInt(a.slice(offset, offset + 2), 16) * (1 - amount) + parseInt(b.slice(offset, offset + 2), 16) * amount));
  return `#${channels.map((channel) => channel.toString(16).padStart(2, "0")).join("")}`;
}

export function createPixelAssets(scene: Phaser.Scene) {
  canvasTexture(scene, "wood-floor", 32, 32, (p) => {
    p("#ae7d55", 0, 0, 32, 32);
    for (let row = 0; row < 4; row++) {
      const y = row * 8;
      p(["#bd8c60", "#b68559", "#c09063", "#b58256"][row], 0, y, 32, 7);
      p("#d0a374", 0, y, 32, 1); p("#87603f", 0, y + 7, 32, 1);
      const seam = [10, 25, 17, 4][row]; p("#946c49", seam, y + 1, 1, 6);
      p("#b17f55", (seam + 7) % 20, y + 4, 9, 1);
      p("#c99b6c", (seam + 3) % 23, y + 2, 7, 1);
      p("#9a704a", seam + 2, y + 2, 1, 1); p("#9a704a", seam - 2, y + 5, 1, 1);
    }
  });
  canvasTexture(scene, "platform-floor", 16, 16, (p) => {
    p("#ceba9c", 0, 0, 16, 16); p("#b29e85", 0, 15, 16, 1); p("#b29e85", 15, 0, 1, 16); p("#ddcaac", 0, 0, 15, 1); p("#c5b194", 3, 7, 1, 1);
  });
  canvasTexture(scene, "wall", 16, 16, (p) => { p(palette.ink, 0, 0, 16, 16); p(palette.wall, 0, 0, 16, 11); p("#c1a77b", 0, 11, 16, 3); p(palette.darkWood, 0, 14, 16, 2); });
  canvasTexture(scene, "grass", 16, 16, (p) => { p("#536253", 0, 0, 16, 16); p("#63715b", 2, 3, 1, 2); p("#63715b", 11, 10, 2, 1); p("#445349", 7, 7, 2, 2); });
  canvasTexture(scene, "solid", 16, 16, (p) => p(palette.ink, 0, 0, 16, 16));
  createCharacter(scene, "traveler", false);
  createCharacter(scene, "conductor", true);
  for (const direction of ["down", "left", "right", "up"]) {
    const offset = ["down", "left", "right", "up"].indexOf(direction) * 3;
    scene.anims.create({ key: `walk-${direction}`, frames: [{ key: "traveler", frame: offset + 1 }, { key: "traveler", frame: offset }, { key: "traveler", frame: offset + 2 }, { key: "traveler", frame: offset }], frameRate: 9, repeat: -1 });
  }
}

function createCharacter(scene: Phaser.Scene, key: string, conductor: boolean) {
  const canvas = document.createElement("canvas");
  canvas.width = 16 * 12; canvas.height = 32;
  const c = canvas.getContext("2d")!;
  const coat = conductor ? "#4e6a85" : "#c67b50";
  for (let dir = 0; dir < 4; dir++) for (let frame = 0; frame < 3; frame++) {
    const offset = (dir * 3 + frame) * 16;
    const bob = frame === 0 ? 0 : 1;
    const p: Paint = (color, x, y, w, h) => { c.fillStyle = color; c.fillRect(offset + x, y - bob, w, h); };
    p("#302b4255", 2, 29, 12, 2);
    p(palette.ink, 4, 22, 8, 7); p("#e6b990", 4, 9, 8, 9);
    p(palette.ink, 3, 7, 10, 5); p(palette.ink, 4, 5, 8, 4);
    p("#514052", 5, 6, 5, 1);
    if (dir === 3) p(palette.ink, 4, 10, 8, 6);
    else { p("#f2cfa7", dir === 1 ? 3 : 5, 12, 7, 4); p(palette.ink, dir === 1 ? 4 : dir === 2 ? 11 : 6, 12, 1, 2); if (dir === 0) p(palette.ink, 10, 12, 1, 2); }
    p(coat, 4, 18, 8, 7); p("#e5c49c", 3, 19 + (frame === 1 ? 1 : 0), 2, 4); p("#e5c49c", 11, 19 + (frame === 2 ? 1 : 0), 2, 4);
    p(conductor ? "#344f65" : "#a55e3e", 10, 20, 2, 5);
    p(conductor ? "#738ba2" : "#e49e65", 5, 18, 5, 1);
    p("#f2cfa7", 7, 17, 2, 2);
    p("#784732", 6, 18, 1, 7); p(palette.gold, 7, 19, 2, 1);
    p("#28333f", 4, 25, 3, frame === 1 ? 4 : 5); p("#28333f", 9, 25, 3, frame === 2 ? 4 : 5);
    p(palette.ink, 3, frame === 1 ? 28 : 29, 4, 2); p(palette.ink, 9, frame === 2 ? 28 : 29, 4, 2);
    if (conductor) { p("#344f65", 3, 5, 10, 4); p(palette.gold, 3, 8, 10, 1); p(palette.ink, 2, 9, 12, 2); }
  }
  const source = scene.textures.addCanvas(key, canvas)!;
  scene.textures.addSpriteSheet(key, source, { frameWidth: 16, frameHeight: 32 });
}

export function propTexture(scene: Phaser.Scene, prop: Prop): string {
  const key = `prop-${prop.kind}-${prop.width}-${prop.height}`;
  if (scene.textures.exists(key)) return key;
  const w = prop.width * 16; const h = prop.height * 16 + 16;
  canvasTexture(scene, key, w, h, (p) => {
    const { ink, darkWood, wood, paper, teal, gold } = palette;
    p("#302b423b", 1, h - 5, w - 2, 4);
    if (prop.kind === "plant") {
      p(darkWood, 9, h - 17, w - 18, 12); p("#cc9160", 7, h - 20, w - 14, 6); p("#a26648", 10, h - 13, w - 20, 6);
      p("#475d48", 14, 5, 4, 25); p("#708563", 4, 10, 12, 7); p("#94a178", 16, 4, 10, 8); p("#566e51", 17, 16, 13, 7); p("#90a277", 8, 20, 9, 6);
      p("#a5b58a", 17, 5, 5, 2); p("#879c71", 5, 10, 5, 2); p("#3a503e", 19, 20, 8, 2);
      p("#e0ad79", 8, h - 19, 2, 5); p("#80583d", 9, h - 17, w - 18, 2);
    } else if (["conductor", "teacher"].includes(prop.kind)) {
      p(ink, 3, 3, 10, 7); p("#e8bb92", 4, 10, 8, 7); p(ink, 6, 12, 1, 2); p(ink, 10, 12, 1, 2);
      p(prop.kind === "conductor" ? "#4e6a85" : teal, 3, 18, 10, 9); p(gold, 6, 19, 3, 2); p(ink, 4, 27, 3, 4); p(ink, 9, 27, 3, 4);
      p("#344f65", 11, 20, 2, 7); p("#f4cba5", 5, 10, 4, 1); p("#dca47c", 10, 15, 2, 2);
      if (prop.kind === "conductor") { p("#526b88", 2, 2, 12, 5); p(gold, 2, 6, 12, 1); }
    } else if (["sofa", "bench"].includes(prop.kind)) {
      p(darkWood, 4, h - 9, 5, 6); p(darkWood, w - 9, h - 9, 5, 6); p(ink, 1, 8, w - 2, h - 14);
      const cloth = prop.kind === "sofa" ? "#668984" : wood;
      p(cloth, 4, 6, w - 8, 13); p(prop.kind === "sofa" ? "#88a29a" : "#d0a071", 4, 19, w - 8, 12);
      p("#456960", 3, 12, 5, 21); p("#456960", w - 8, 12, 5, 21);
      for (let x = 18; x < w - 12; x += 18) p(ink, x, 9, 1, 22);
      p("#aac0ad", 9, 7, w - 18, 1); p("#59766d", 9, 30, w - 18, 2);
      p("#b28459", 4, h - 10, 5, 2); p("#b28459", w - 9, h - 10, 5, 2);
      if (prop.kind === "sofa") for (let x = 16; x < w - 12; x += 18) p("#456960", x, 14, 2, 2);
    } else if (prop.kind === "shelf") {
      p(ink, 0, 2, w, h - 6); p(wood, 3, 4, w - 6, h - 10);
      for (const y of [18, 35]) { p(darkWood, 4, y, w - 8, 3); for (let x = 7; x < w - 7; x += 7) { p([teal, "#b46e64", gold, "#92a579"][Math.floor(x / 7) % 4], x, y - 12, 5, 12); p(paper, x + 1, y - 9, 3, 1); } }
      p("#d1a474", 3, 4, w - 6, 2); p("#d1a474", 3, 5, 1, h - 11);
      for (const y of [18, 35]) { p("#cda071", 5, y + 1, w - 10, 1); for (let x = 7; x < w - 7; x += 7) p("#e8d5ad", x + 1, y - 3, 3, 1); }
    } else if (["education", "timeline", "certificate", "sign"].includes(prop.kind)) {
      p(darkWood, 5, h - 17, 3, 14); p(darkWood, w - 8, h - 17, 3, 14); p(ink, 0, 1, w, h - 15); p(wood, 2, 3, w - 4, h - 19); p(paper, 5, 6, w - 10, h - 25);
      if (prop.kind === "timeline") { p(teal, 11, 15, w - 22, 2); for (let x = 12; x < w - 10; x += 20) { p(ink, x, 13, 5, 5); p("#a88a69", x, 22, 10, 1); } }
      else { p(teal, 10, 11, w - 20, 3); p("#a88a69", 10, 18, w - 20, 2); p("#a88a69", 10, 23, w - 23, 2); }
      p("#d4a679", 2, 3, w - 4, 1); p("#a26648", w - 4, 4, 2, h - 22);
      for (const x of [3, w - 5]) { p(gold, x, 4, 2, 2); p(gold, x, h - 21, 2, 2); }
      if (prop.kind === "certificate") { p("#d2a35c", w - 17, 16, 5, 5); p("#9e6149", w - 16, 21, 2, 3); }
    } else if (prop.kind === "mail") {
      p(darkWood, 14, 25, 4, 18); p(ink, 3, 5, w - 6, 25); p(teal, 5, 3, w - 10, 25); p("#8db8b1", 7, 5, w - 14, 5); p(ink, 8, 13, w - 16, 3); p(paper, 11, 20, 10, 6); p("#bc7355", 23, 6, 4, 10);
      p("#afc5b7", 7, 5, w - 14, 1); p("#446a69", w - 8, 10, 3, 17); p("#ad926e", 13, 22, 6, 1);
    } else if (prop.kind === "exit") {
      p(ink, 0, 0, w, h - 5); p(teal, 3, 3, w - 6, h - 11); p("#86ada6", 5, 5, w - 10, 4); p(paper, 13, 15, 19, 3); p(paper, 27, 12, 3, 10); p(gold, w - 9, 30, 3, 3);
      p("#406361", w - 7, 10, 4, h - 20); p("#a5bdb0", 5, 5, 1, h - 13); p("#cba36b", w - 10, 29, 5, 1);
    } else {
      p(darkWood, 4, h - 13, 4, 10); p(darkWood, w - 8, h - 13, 4, 10); p(ink, 0, 20, w, 15); p(wood, 1, 19, w - 2, 12); p("#d1a474", 2, 19, w - 4, 3);
      if (prop.kind === "terminal" || prop.kind === "desk") {
        p(ink, 7, 1, w - 14, 20); p(teal, 10, 4, w - 20, 13); p("#b5d2bf", 12, 6, 8, 2); p("#b5d2bf", 12, 10, w - 26, 1); p("#719f94", 12, 13, 10, 1); p(ink, w / 2 - 3, 20, 6, 3); p(paper, 10, 25, w - 20, 3); p(gold, w - 9, 22, 5, 7);
        p("#635c70", 8, 2, w - 16, 1); p("#436968", 10, 15, w - 20, 2); p("#d0e2ca", 12, 5, 9, 1);
        p("#8ebf9b", w / 2, 18, 1, 1); p("#9b7f61", 10, 28, w - 20, 1);
        for (let x = 12; x < w - 12; x += 4) p("#8e8071", x, 26, 2, 1);
        p("#fbebc7", w - 9, 22, 5, 1); p("#996b47", w - 7, 24, 2, 2);
      } else if (prop.kind === "book") { p(ink, 5, 8, w - 10, 18); p("#bd7c78", 5, 5, w - 10, 17); p(paper, 9, 9, w - 18, 2); p(gold, 8, 5, 2, 17); }
      else if (prop.kind === "document") { p(paper, 7, 5, w - 14, 21); p(teal, 10, 9, w - 20, 3); p("#aa9575", 10, 16, w - 20, 1); p("#aa9575", 10, 20, w - 22, 1); }
      else { p(teal, 8, 8, 14, 14); p(paper, 25, 14, 18, 12); p(gold, w - 19, 10, 7, 10); }
      p("#e0b17e", 2, 19, w - 4, 1); p("#915f3d", 2, 30, w - 4, 2);
      p("#a5744c", 4, h - 13, 1, 10); p("#a5744c", w - 8, h - 13, 1, 10);
    }
  });
  return key;
}

/** One opaque, cached bitmap per carriage: detail adds no per-frame draw commands. */
export function carriageTexture(scene: Phaser.Scene, id: string, accent: string, width: number, height: number): string {
  const key = `carriage-${id}`;
  if (scene.textures.exists(key)) return key;
  canvasTexture(scene, key, width, height, (p, context) => {
    const floorBottom = height - 24;
    p(palette.shadow, 0, 0, width, height);
    p("#c7ad85", 2, 2, width - 4, height - 7);
    const floor = scene.textures.get("wood-floor").getSourceImage() as HTMLCanvasElement;
    for (let y = 32; y < floorBottom; y += 32) for (let x = 16; x < width - 16; x += 32) context.drawImage(floor, x, y);

    // Baked ambient occlusion and daylight; all finish over an opaque floor.
    p("#302b4240", 16, 32, width - 32, 7); p("#302b4220", 16, 39, width - 32, 5);
    p("#302b4230", 16, 32, 5, floorBottom - 32); p("#302b4230", width - 21, 32, 5, floorBottom - 32);
    p("#302b4240", 16, floorBottom - 4, width - 32, 4);
    for (const x of [43, width - 99]) {
      p("#ffe6af0d", x + 4, 39, 51, 35); p("#ffe6af08", x + 12, 74, 42, 24);
    }

    p("#f0deb7", 4, 4, width - 8, 23); p("#faf0d0", 4, 4, width - 8, 2);
    p("#bea17c", 4, 27, width - 8, 3); p("#654633", 4, 30, width - 8, 2);
    p("#e0c8a1", 4, 32, 12, floorBottom - 32); p("#cfb58d", width - 16, 32, 12, floorBottom - 32);
    for (let y = 42; y < floorBottom; y += 28) {
      p("#f0deb7", 5, y, 9, 1); p("#a88c6a", width - 14, y + 1, 8, 1);
      p("#b99970", 7, y + 10, 2, 2); p("#b99970", width - 11, y + 10, 2, 2);
    }
    p("#d8bd96", 4, floorBottom, width - 8, 12); p("#f0deb7", 4, floorBottom, width - 8, 2);
    p("#755940", 4, floorBottom + 12, width - 8, 3); p("#45655e", 2, floorBottom + 15, width - 4, 6);
    p("#8d9c83", 4, floorBottom + 15, width - 8, 1);
    for (let x = 10; x < width - 9; x += 24) p("#a8b29b", x, floorBottom + 17, 2, 1);

    // Woven runner, with tassels and a quiet geometric border.
    const rug = mix("#473940", accent, 0.6);
    p("#302b4235", 26, 139, width - 48, 68); p(rug, 25, 136, width - 50, 66);
    p(mix(rug, "#edbe74", 0.65), 28, 139, width - 56, 1); p(mix(rug, "#edbe74", 0.65), 28, 198, width - 56, 1);
    for (const x of [28, width - 29]) p(mix(rug, "#edbe74", 0.65), x, 139, 1, 60);
    for (let x = 32; x < width - 30; x += 8) { p("#dec18f", x, 133, 2, 3); p("#dec18f", x, 202, 2, 3); }
    for (let x = 38; x < width - 38; x += 24) {
      p(mix(rug, "#edbe74", 0.25), x, 145, 3, 2); p(mix(rug, "#edbe74", 0.25), x, 191, 3, 2);
    }
    for (let y = 150; y < 190; y += 4) p(mix(rug, "#302b42", 0.08), 32, y, width - 64, 1);

    // Window pixels are baked inside their frames: no scene-wide panorama can show through.
    for (const x of [43, width - 99]) {
      p("#6c5140", x - 2, 4, 63, 24); p("#302b42", x, 5, 59, 22);
      p("#446c68", x + 4, 8, 51, 17);
      if (scene.textures.exists("countryside")) context.drawImage(scene.textures.get("countryside").getSourceImage() as HTMLImageElement, x + 4, 8, 51, 17);
      p("#fbebc72a", x + 7, 9, 18, 1); p("#fbebc71a", x + 8, 10, 12, 1);
      p("#d5b886", x + 28, 5, 2, 22); p("#efd4a1", x + 28, 6, 1, 20);
      p("#e5c496", x - 1, 27, 61, 2);
    }
  });
  return key;
}

export function connectorTexture(scene: Phaser.Scene): string {
  const key = "carriage-connector";
  if (scene.textures.exists(key)) return key;
  canvasTexture(scene, key, 64, 64, (p) => {
    p(palette.shadow, 0, 0, 64, 64); p("#5a5755", 0, 7, 64, 50);
    p("#c3b293", 0, 8, 64, 2); p("#a19178", 0, 54, 64, 2);
    p("#8c8170", 0, 11, 64, 42);
    for (let x = 2; x < 64; x += 6) { p("#514c49", x, 11, 2, 42); p("#b3a48a", x + 2, 11, 1, 42); }
    p("#302b4230", 0, 11, 64, 4); p("#302b4230", 0, 49, 64, 4);
  });
  return key;
}
