import Phaser from "phaser";
import { JourneyAudio } from "./audio";
import { findPath, interactionGoals } from "./pathfinding";
import { CAR_SCONCES, CAR_WINDOWS, STATION_TRAIN, bubbleTexture, carriageTexture, connectorTexture, createPixelAssets, palette, propTexture } from "./pixelAssets";
import { CAR_START, CAR_STEP, CAR_TOP, CAR_WIDTH, CAR_BOTTOM, CARRIAGES, TILE, cameraLayout, carriageAt, carriageSpawn, cellCenter, createWorld, inRange, interactionAt, isWalkable, toCell, walkVelocity, type CarriageId, type Cell, type Interaction, type PayloadId, type SceneId, type WorldMap } from "./world";

export type JourneySnapshot = { scene: SceneId; carriage: CarriageId | null; nearest: Interaction | null };
export type JourneyController = {
  setPaused: (paused: boolean) => void;
  interact: () => void;
  travel: (destination: CarriageId | "station") => void;
  move: (x: number, y: number) => void;
  stop: () => void;
  setMuted: (muted: boolean) => Promise<void>;
  focus: () => void;
  destroy: () => void;
};
type Options = {
  reducedMotion: boolean;
  projectLabels: string[];
  found: string[];
  onReady: () => void;
  onProgress: (progress: number) => void;
  onSnapshot: (snapshot: JourneySnapshot) => void;
  onInteract: (payload: PayloadId) => void;
  onDiscover: (id: string) => void;
  onMessage: (message: string) => void;
};

const FACINGS = ["down", "left", "right", "up"];
const NPC_KINDS = ["conductor", "teacher", "engineer", "passenger"];
const SCREEN_TONES = [0xff8a6a, 0x8fc7ff, 0xffd27a, 0xa9d18e, 0xe8b08f, 0xc9a6ff];
const EXTRA_WIDTH = 1200;
const CAR_HEIGHT = (CAR_BOTTOM - CAR_TOP + 1) * TILE + 8;

export function createJourney(parent: HTMLElement, options: Options): JourneyController {
  let active: WorldScene | null = null;
  let overlay: UIScene | null = null;
  let paused = true;
  let destroyed = false;
  let ready = false;
  let transitioning = false;
  let queuedTravel: CarriageId | "station" | null = null;
  let virtual = { x: 0, y: 0 };
  const audio = new JourneyAudio();
  const found = new Set(options.found);
  const calm = options.reducedMotion;

  /** Every scene change passes through the same pixel dissolve. */
  function changeScene(destination: SceneId, carriage: CarriageId | undefined, title: string) {
    const key = destination === "train" ? "TrainScene" : "StationScene";
    const go = () => {
      const scene = active?.scene;
      if (scene) scene.start(key, { carriage });
      else game.scene.start(key, { carriage });
    };
    if (calm || !overlay) { go(); return; }
    overlay.dissolve(go, title);
  }

  class BootScene extends Phaser.Scene {
    constructor() { super("BootScene"); }
    create() { this.scene.start("PreloadScene"); }
  }
  class PreloadScene extends Phaser.Scene {
    constructor() { super("PreloadScene"); }
    preload() {
      this.load.image("countryside", "/game/countryside.webp");
      this.load.on("progress", options.onProgress);
      this.load.on("loaderror", () => options.onMessage("The scenery could not load. You can still explore the whole train."));
    }
    create() {
      createPixelAssets(this);
      this.scene.launch("UIScene");
      ready = true;
      options.onReady();
      const destination = queuedTravel;
      queuedTravel = null;
      this.scene.start(destination && destination !== "station" ? "TrainScene" : "StationScene", { carriage: destination });
    }
  }

  class WorldScene extends Phaser.Scene {
    map!: WorldMap;
    player!: Phaser.Physics.Arcade.Sprite;
    shadow!: Phaser.GameObjects.Image;
    keys!: Record<string, Phaser.Input.Keyboard.Key>;
    route: Cell[] = [];
    pending: Interaction | null = null;
    nearest: Interaction | null = null;
    facing = "down";
    currentCarriage: CarriageId | null = null;
    marker!: Phaser.GameObjects.Graphics;
    private lastPosition = { x: 0, y: 0 };
    private stalledFor = 0;
    private requestedCarriage: CarriageId | null = null;
    private hovered: Interaction | null = null;
    private bubble!: Phaser.GameObjects.Image;
    private speech!: Phaser.GameObjects.Image;
    private speechTimer: Phaser.Time.TimerEvent | null = null;
    private markers = new Map<string, Phaser.GameObjects.Sprite>();
    private anchors = new Map<string, Cell>();
    private npcs: { sprite: Phaser.GameObjects.Sprite; phase: number; cat: boolean }[] = [];
    private screens: { sprite: Phaser.GameObjects.Sprite; offset: number }[] = [];
    private layers: { sprite: Phaser.GameObjects.TileSprite; speed: number }[] = [];
    private wheels: Phaser.GameObjects.Sprite[] = [];
    private door: Phaser.GameObjects.Sprite | null = null;
    private footDust: Phaser.GameObjects.Particles.ParticleEmitter | null = null;
    private stepTimer = 0;

    constructor(key: string, private sceneId: SceneId) { super(key); }
    init(data: { carriage?: CarriageId }) { this.requestedCarriage = data?.carriage ?? null; }
    create() {
      this.map = createWorld(this.sceneId, options.projectLabels.length);
      this.map.interactions.forEach((target) => {
        if (target.payloadId.startsWith("project:")) target.label = `Open ${options.projectLabels[Number(target.payloadId.split(":")[1])]}`;
      });
      this.route = []; this.pending = null; this.nearest = null; this.hovered = null; this.facing = "down";
      this.currentCarriage = null; this.stalledFor = 0;
      this.markers.clear(); this.anchors.clear(); this.npcs = []; this.screens = []; this.layers = []; this.wheels = []; this.door = null;
      // The controller and overlay share the current Phaser world scene.
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      active = this;
      audio.setScene(this.sceneId);
      if (this.sceneId === "station") this.drawStation(); else this.drawTrain();
      this.drawProps();
      const spawn = this.sceneId === "train" && this.requestedCarriage ? carriageSpawn(this.requestedCarriage) : this.map.spawn;
      this.shadow = this.add.image(spawn.x, spawn.y + 3, "shadow").setAlpha(0.35);
      this.player = this.physics.add.sprite(spawn.x, spawn.y, "traveler", 0).setOrigin(0.5, 0.875);
      this.player.body!.setSize(10, 10).setOffset(3, 22);
      this.player.setCollideWorldBounds(true).setDepth(spawn.y + 4);
      this.shadow.setDepth(spawn.y + 3);
      this.physics.world.setBounds(0, 0, this.map.width, this.map.height);
      const collisionMap = this.make.tilemap({ data: this.map.grid.map((row) => row.map((cell) => cell === 1 ? 0 : -1)), tileWidth: TILE, tileHeight: TILE });
      const tiles = collisionMap.addTilesetImage("solid", "solid", TILE, TILE, 0, 0, 0)!;
      const collisionLayer = collisionMap.createLayer(0, tiles)!.setVisible(false).setCollision(0);
      this.physics.add.collider(this.player, collisionLayer);
      this.marker = this.add.graphics().setDepth(1150);
      this.bubble = this.add.image(0, 0, "dust").setOrigin(0.5, 1).setDepth(1300).setVisible(false);
      this.speech = this.add.image(0, 0, "dust").setOrigin(0.5, 1).setDepth(1310).setVisible(false);
      this.keys = this.input.keyboard!.addKeys({ up: "W", left: "A", down: "S", right: "D", arrowUp: "UP", arrowLeft: "LEFT", arrowDown: "DOWN", arrowRight: "RIGHT", interact: "E", confirm: "SPACE" }, false) as Record<string, Phaser.Input.Keyboard.Key>;
      if (!calm) this.footDust = this.add.particles(0, 0, "dust", { lifespan: 380, speedX: { min: -14, max: 14 }, speedY: { min: -12, max: -2 }, alpha: { start: 0.5, end: 0 }, scale: { start: 1, end: 0.5 }, tint: 0xe8d5b0, emitting: false }).setDepth(1000);
      this.input.on("pointerdown", this.onPointer, this);
      this.input.on("pointermove", this.onHover, this);
      const camera = this.cameras.main;
      if (this.sceneId === "station") camera.setBounds(STATION_TRAIN.x, -160, 1600, 680);
      else camera.setBounds(-120, -800, this.map.width + 240, 2200);
      camera.startFollow(this.player, true, calm ? 1 : 0.12, calm ? 1 : 0.12);
      this.resize();
      camera.centerOn(this.player.x, cameraLayout(this.sceneId, this.scale.width, this.scale.height).desktopInterior ? cameraLayout(this.sceneId, this.scale.width, this.scale.height).centerY : this.player.y);
      this.scale.on("resize", this.resize, this);
      this.events.once("shutdown", () => {
        this.scale.off("resize", this.resize, this);
        this.input.off("pointerdown", this.onPointer, this);
        this.input.off("pointermove", this.onHover, this);
        this.events.off("postupdate", this.placeShadow, this);
        game.canvas.style.cursor = "";
        this.route = []; this.pending = null;
        if (active === this) active = null;
      });
      // After physics has moved the player, so the shadow never trails by a frame.
      this.events.on("postupdate", this.placeShadow, this);
      this.publish(true);
      options.onMessage(this.sceneId === "station" ? "Welcome to Rafael Line. Talk to the conductor, or walk up to the glowing train door." : "You're aboard. Walk through the open passages, or pick a carriage on the route above.");
    }

    private placeShadow() { this.shadow.setPosition(this.player.x, this.player.y + 3).setDepth(this.player.y + 3); }

    private resize() {
      const layout = cameraLayout(this.sceneId, this.scale.width, this.scale.height);
      const camera = this.cameras.main;
      camera.setZoom(layout.zoom).setRoundPixels(true);
      // A complete desktop interior stays framed while the camera follows horizontally.
      // Narrow screens keep the closer, two-axis view for walking and touch interaction.
      camera.setLerp(calm ? 1 : 0.12, layout.desktopInterior ? 0 : calm ? 1 : 0.12);
      if (layout.desktopInterior) camera.centerOn(this.player?.x ?? camera.midPoint.x, layout.centerY);
      // Outdoors on wide screens, the traveler sits low in frame so the train and sky stay visible.
      camera.setFollowOffset(0, this.sceneId === "station" && this.scale.width >= 768 ? 70 : 0);
    }

    private scrollingTile(x: number, y: number, width: number, height: number, key: string, speed: number, depth: number) {
      const sprite = this.add.tileSprite(x, y, width, height, key).setOrigin(0).setDepth(depth);
      if (!calm && speed) this.layers.push({ sprite, speed });
      return sprite;
    }

    private glow(x: number, y: number, key = "glow-warm", alpha = 0.55, scale = 1) {
      const image = this.add.image(x, y, key).setBlendMode(Phaser.BlendModes.ADD).setDepth(1110).setAlpha(alpha).setScale(scale);
      if (!calm) this.tweens.add({ targets: image, alpha: alpha * 0.78, duration: 900 + Math.random() * 900, yoyo: true, repeat: -1, ease: "Sine.easeInOut", delay: Math.random() * 800 });
      return image;
    }

    private drawStation() {
      const width = this.map.width;
      const left = -EXTRA_WIDTH / 2; const span = width + EXTRA_WIDTH;
      this.cameras.main.setBackgroundColor("#5a4560");
      this.add.rectangle(left, -400, span, 400, 0x5a4560).setOrigin(0).setDepth(-30);
      // Outdoors uses one cover image, never a vertically repeating panorama.
      if (this.textures.exists("countryside")) this.add.tileSprite(left, -54, span, 240, "countryside").setOrigin(0).setScrollFactor(0.3, 1).setDepth(-29);
      if (!calm) {
        [[120, 20, 90000], [620, 44, 130000], [900, 6, 110000]].forEach(([x, y, duration]) => {
          const cloud = this.add.image(x, y, "cloud").setScrollFactor(0.45, 1).setDepth(-28).setAlpha(0.85);
          this.tweens.add({ targets: cloud, x: x + 340, duration, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
        });
        for (let i = 0; i < 3; i++) {
          const bird = this.add.image(-40 - i * 18, 30 + i * 9, "bird").setScrollFactor(0.6, 1).setDepth(-27);
          this.tweens.add({ targets: bird, x: 1500 - i * 18, y: 14 + i * 9, duration: 42000, delay: 3000, repeat: -1, repeatDelay: 12000 });
        }
      }
      this.add.rectangle(left, 190, span, 22, 0x2a2238).setOrigin(0).setDepth(10);
      this.add.image(STATION_TRAIN.x, STATION_TRAIN.y, "station-train").setOrigin(0).setDepth(20);
      this.door = this.add.sprite(STATION_TRAIN.x + STATION_TRAIN.door, 146, "train-door", 0).setOrigin(0.5, 0).setDepth(21);
      this.glow(576, 178, "glow-warm", 0.7, 0.9);
      this.add.tileSprite(left, 208, span, 224, "platform").setOrigin(0).setDepth(30);
      this.add.tileSprite(left, 208, span, 16, "platform-edge").setOrigin(0).setDepth(31);
      this.add.rectangle(left, 432, span, 700, 0x3d6442).setOrigin(0).setDepth(30);
      this.add.tileSprite(left, 448, span, 700, "paddy").setOrigin(0).setDepth(31);
      this.add.tileSprite(left, 426, span, 28, "fence").setOrigin(0).setDepth(32);
      // String lights hang between the platform lamps.
      const lights = this.add.graphics().setDepth(1105);
      const lamps = this.map.props.filter((prop) => prop.kind === "lamp");
      lamps.forEach((lamp, index) => {
        const next = lamps[index + 1];
        // The middle span would cross the boarding door, so that pair stays unstrung.
        if (!next || (lamp.x < 576 && next.x > 576)) return;
        const startY = lamp.y - 48; const sag = 10;
        lights.fillStyle(0x2a2238);
        for (let t = 0; t <= 1; t += 0.01) lights.fillRect(Math.round(lamp.x + (next.x - lamp.x) * t), Math.round(startY + Math.sin(t * Math.PI) * sag), 1, 1);
        for (let t = 0.08; t < 1; t += 0.14) {
          lights.fillStyle(0xffe6a8).fillRect(Math.round(lamp.x + (next.x - lamp.x) * t) - 1, Math.round(startY + Math.sin(t * Math.PI) * sag) + 1, 3, 3);
        }
      });
      for (const lamp of lamps) { this.glow(lamp.x, lamp.y - 34, "glow-warm", 0.8, 0.7); this.glow(lamp.x, lamp.y + 30, "glow-warm", 0.16, 1.2); }
      this.add.rectangle(left - 400, -600, span + 800, 2400, 0xf0dcd6).setOrigin(0).setDepth(1100).setBlendMode(Phaser.BlendModes.MULTIPLY);
      if (!calm) {
        this.add.particles(0, 0, "firefly", { emitZone: { type: "random", source: new Phaser.Geom.Rectangle(0, 230, width, 360) as unknown as Phaser.Types.GameObjects.Particles.RandomZoneSource }, frequency: 420, lifespan: 4200, speedX: { min: -9, max: 9 }, speedY: { min: -10, max: 4 }, alpha: { start: 0.95, end: 0 }, blendMode: "ADD" }).setDepth(1120);
        this.add.particles(STATION_TRAIN.x + STATION_TRAIN.stack, 108, "puff", { frequency: 340, lifespan: 2600, speedY: { min: -26, max: -14 }, speedX: { min: -16, max: -6 }, scale: { start: 0.6, end: 2.2 }, alpha: { start: 0.55, end: 0 } }).setDepth(19);
      }
    }

    private drawTrain() {
      const width = this.map.width;
      const left = -EXTRA_WIDTH / 2; const span = width + EXTRA_WIDTH;
      const floorY = CAR_TOP * TILE;
      const bottom = floorY + CAR_HEIGHT;
      this.cameras.main.setBackgroundColor("#3d6442");
      this.add.rectangle(left, -800, span, 800 + floorY - 40, 0x5a4560).setOrigin(0).setDepth(-30);
      if (this.textures.exists("countryside")) this.scrollingTile(left, floorY - 150, span, 240, "countryside", 12, -29);
      else this.add.rectangle(left, floorY - 150, span, 240, 0x7a5a70).setOrigin(0).setDepth(-29);
      // The ground rushes past faster than the horizon, so the train always feels under way.
      this.scrollingTile(left, bottom - 6, span, 48, "track", 220, -20);
      this.scrollingTile(left, floorY + 88, span, 1600, "paddy", 110, -21);
      const g = this.add.graphics().setDepth(-3);
      CARRIAGES.forEach((car, index) => {
        const start = (CAR_START + index * CAR_STEP) * TILE;
        const carWidth = CAR_WIDTH * TILE;
        g.fillStyle(0x1c172a).fillRect(start - 2, floorY + 3, carWidth + 4, CAR_HEIGHT);
        this.add.image(start, floorY, carriageTexture(this, car.id, car.color, carWidth, CAR_HEIGHT)).setOrigin(0).setDepth(0);
        for (const pane of CAR_WINDOWS) {
          if (this.textures.exists("countryside")) {
            const scenery = this.scrollingTile(start + pane.x, floorY + pane.y, pane.w, pane.h, "countryside", 44, 1);
            scenery.setTileScale(0.5, 0.5).setTilePosition(index * 170, 112);
          }
          this.add.image(start + pane.x, floorY + pane.y, "window-glass").setOrigin(0).setDepth(1.5);
        }
        for (const x of CAR_SCONCES) this.glow(start + x, floorY + 28, "glow-warm", 0.55, 0.65);
        for (const x of [64, carWidth - 64]) for (const offset of [-16, 16]) {
          const wheel = this.add.sprite(start + x + offset, bottom + 2, "wheel", index % 2).setDepth(-2);
          this.wheels.push(wheel);
        }
        if (index < 4) {
          const gap = (CAR_STEP - CAR_WIDTH) * TILE;
          g.fillStyle(0x3a3246).fillRect(start + carWidth, floorY + 20, gap, CAR_HEIGHT - 44);
          for (let x = start + carWidth + 1; x < start + carWidth + gap; x += 5) { g.fillStyle(0x2a2238).fillRect(x, floorY + 20, 1, CAR_HEIGHT - 44); g.fillStyle(0x56495f).fillRect(x + 2, floorY + 20, 1, CAR_HEIGHT - 44); }
          this.add.image(start + carWidth - TILE, 17 * TILE - 8, connectorTexture(this)).setOrigin(0).setDepth(2);
        }
      });
      const tail = (CAR_START + 4 * CAR_STEP + CAR_WIDTH) * TILE;
      g.fillStyle(0xd9603f).fillRect(tail + 1, bottom - 40, 4, 8);
      this.glow(tail + 3, bottom - 36, "glow-warm", 0.6, 0.35);
      this.add.rectangle(left - 400, -800, span + 800, 3000, 0xfff0dc).setOrigin(0).setDepth(1100).setBlendMode(Phaser.BlendModes.MULTIPLY);
      if (!calm) {
        this.add.particles(0, 0, "dust", { emitZone: { type: "random", source: new Phaser.Geom.Rectangle(32, floorY + 70, width - 64, 200) as unknown as Phaser.Types.GameObjects.Particles.RandomZoneSource }, frequency: 90, lifespan: 3600, speedX: { min: -5, max: 5 }, speedY: { min: -7, max: -1 }, scale: 0.5, alpha: { start: 0.42, end: 0 }, tint: 0xffdfa0, blendMode: "ADD" }).setDepth(1120);
        this.add.particles(0, 0, "puff", { emitZone: { type: "random", source: new Phaser.Geom.Rectangle(-120, floorY - 34, width + 240, 18) as unknown as Phaser.Types.GameObjects.Particles.RandomZoneSource }, frequency: 500, lifespan: 2800, speedX: { min: 40, max: 70 }, scale: { start: 0.6, end: 2 }, alpha: { start: 0.35, end: 0 } }).setDepth(-5);
      }
    }

    private drawProps() {
      for (const prop of this.map.props) {
        const bottom = prop.y + prop.height * TILE / 2;
        let top: number;
        if (NPC_KINDS.includes(prop.kind)) {
          this.add.image(prop.x, bottom - 4, "shadow").setAlpha(0.35).setDepth(bottom - 2);
          const sprite = this.add.sprite(prop.x, bottom - 4, prop.kind, 0).setOrigin(0.5, 0.875).setDepth(bottom);
          this.npcs.push({ sprite, phase: Math.random() * 2000, cat: false });
          top = bottom - 32;
        } else if (prop.kind === "cat") {
          this.add.image(prop.x, bottom - 2, "shadow").setAlpha(0.3).setDepth(bottom - 2);
          const sprite = this.add.sprite(prop.x, bottom, "cat", 0).setOrigin(0.5, 1).setDepth(bottom);
          this.npcs.push({ sprite, phase: Math.random() * 2000, cat: true });
          top = bottom - 16;
        } else {
          const image = this.add.image(prop.x, bottom, propTexture(this, prop)).setOrigin(0.5, 1).setDepth(bottom);
          top = bottom - image.height;
          if (prop.kind === "desk") {
            // Rafael waits behind his desk; the desk itself carries the interaction.
            const rafael = this.add.sprite(prop.x, bottom - 26, "rafael", 0).setOrigin(0.5, 0.875).setDepth(bottom - 1);
            this.npcs.push({ sprite: rafael, phase: 400, cat: false });
            top = bottom - 56;
          }
          if (prop.kind === "terminal") {
            const index = this.screens.length;
            const sprite = this.add.sprite(prop.x, top + 4, "screen", index % 3).setOrigin(0.5, 0).setDepth(bottom + 0.1).setTint(SCREEN_TONES[index % SCREEN_TONES.length]);
            this.screens.push({ sprite, offset: index * 170 });
            this.glow(prop.x, top + 10, "glow-cool", 0.5, 0.7);
          }
          if (prop.kind === "lamp" && this.sceneId === "train") this.glow(prop.x, top + 6, "glow-warm", 0.7, 0.7);
        }
        if (prop.interactionId) this.addMarker(prop.interactionId, prop.x, top - 8);
      }
      for (const target of this.map.interactions) if (target.targetScene) this.addMarker(target.id, target.x, 132);
    }

    private addMarker(id: string, x: number, y: number) {
      this.anchors.set(id, { x, y });
      const target = this.map.interactions.find((item) => item.id === id);
      const discovered = found.has(id);
      const marker = this.add.sprite(x, y, "marker", discovered ? 1 : 0).setDepth(1200).setAlpha(discovered ? 0.75 : 1);
      if (target?.payloadId === "flavor") marker.setScale(0.75);
      if (!calm && !discovered) this.tweens.add({ targets: marker, y: y - 3, duration: 460, yoyo: true, repeat: -1, ease: "Stepped", easeParams: [3], delay: Math.random() * 400 });
      this.markers.set(id, marker);
    }

    private refreshBubble() {
      const target = this.hovered ?? this.nearest;
      if (!target || paused) { this.bubble.setVisible(false); return; }
      const anchor = this.anchors.get(target.id);
      const inReach = this.nearest?.id === target.id;
      this.bubble.setTexture(bubbleTexture(this, target.label, inReach)).setPosition(anchor?.x ?? target.x, (anchor?.y ?? target.y) - 8).setVisible(true);
    }

    private say(target: Interaction) {
      const anchor = this.anchors.get(target.id) ?? target;
      this.speech.setTexture(bubbleTexture(this, target.line ?? "")).setPosition(anchor.x, anchor.y - 2).setVisible(true);
      this.bubble.setVisible(false);
      this.speechTimer?.remove();
      this.speechTimer = this.time.delayedCall(3600, () => { this.speech.setVisible(false); this.refreshBubble(); });
      audio.play("blip");
      options.onMessage(target.line ?? "");
    }

    private discover(target: Interaction) {
      if (found.has(target.id)) return;
      found.add(target.id);
      options.onDiscover(target.id);
      const marker = this.markers.get(target.id);
      if (marker) {
        this.tweens.killTweensOf(marker);
        marker.setFrame(1).setAlpha(0.75);
        const anchor = this.anchors.get(target.id);
        if (anchor) marker.setPosition(anchor.x, anchor.y);
      }
      audio.play("stamp");
      if (!calm && marker) {
        const burst = this.add.particles(marker.x, marker.y, "dust", { lifespan: 520, speed: { min: 24, max: 70 }, quantity: 14, tint: [0xedbe74, 0xa9d18e, 0xfff1c9], alpha: { start: 1, end: 0 }, emitting: false }).setDepth(1210);
        burst.explode(14);
        this.time.delayedCall(700, () => burst.destroy());
      }
    }

    private onHover(pointer: Phaser.Input.Pointer) {
      if (paused || pointer.wasTouch) return;
      const position = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
      const target = interactionAt(this.map, position);
      if (target?.id === this.hovered?.id) return;
      this.hovered = target;
      game.canvas.style.cursor = target ? "pointer" : "";
      this.refreshBubble();
    }

    clearMovement() {
      this.route = []; this.pending = null; virtual = { x: 0, y: 0 };
      this.player?.setVelocity(0, 0);
      this.input.keyboard?.resetKeys();
      this.marker?.clear();
      if (this.bubble) this.refreshBubble();
    }

    private drawRoute() {
      this.marker.clear();
      this.marker.fillStyle(0xedbe74, 0.7);
      this.route.forEach((cell, index) => { if (index % 2 === 0) { const point = cellCenter(cell); this.marker.fillRect(point.x - 1, point.y - 1, 2, 2); } });
      const destination = this.route[this.route.length - 1];
      if (destination) { const point = cellCenter(destination); this.marker.lineStyle(1, 0xfff1c9, 0.95).strokeRect(point.x - 5, point.y - 5, 10, 10); }
    }

    private ripple(x: number, y: number) {
      if (calm) return;
      const ring = this.add.rectangle(x, y, 4, 4).setStrokeStyle(1, 0xfff1c9).setDepth(1151);
      this.tweens.add({ targets: ring, scale: 3.5, alpha: 0, duration: 320, ease: "Stepped", easeParams: [4], onComplete: () => ring.destroy() });
    }

    private onPointer(pointer: Phaser.Input.Pointer) {
      if (paused || transitioning) return;
      game.canvas.focus({ preventScroll: true });
      const position = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
      const target = interactionAt(this.map, position);
      this.clearMovement();
      if (target && inRange(this.player, target)) { this.activate(target); return; }
      const cell = toCell(position.x, position.y);
      const goals = target ? interactionGoals(this.map.grid, target) : isWalkable(this.map.grid, cell) ? [cell] : [];
      const start = toCell(this.player.x, this.player.y);
      const path = findPath(this.map.grid, start, goals);
      if (!path) { options.onMessage("That spot isn't reachable. Choose an open part of the floor or use the route map."); return; }
      this.route = path.length ? path : [start];
      this.pending = target ?? null;
      this.ripple(position.x, position.y);
      this.drawRoute();
      options.onMessage(target ? `Walking over: ${target.label.toLowerCase()}.` : "On your way. Use a direction key any time to take over.");
      this.lastPosition = { x: this.player.x, y: this.player.y }; this.stalledFor = 0;
    }

    interact() {
      if (paused || transitioning) return;
      this.publish();
      if (this.nearest && inRange(this.player, this.nearest)) this.activate(this.nearest);
      else options.onMessage("Walk closer to something with a marker to interact.");
    }

    private activate(target: Interaction) {
      if (paused || transitioning || !inRange(this.player, target)) return;
      this.clearMovement();
      if (target.line) { this.say(target); return; }
      if (target.targetScene) {
        audio.play("whistle");
        this.door?.setFrame(1);
        changeScene(target.targetScene, "about", "ALL ABOARD");
        return;
      }
      this.discover(target);
      audio.play("blip");
      options.onInteract(target.payloadId);
    }

    private publish(force = false) {
      const nextCarriage = this.sceneId === "train" ? carriageAt(this.player.x) : null;
      const nextNearest = this.map.interactions.filter((item) => inRange(this.player, item)).sort((a, b) => Math.hypot(a.x - this.player.x, a.y - this.player.y) - Math.hypot(b.x - this.player.x, b.y - this.player.y))[0] ?? null;
      if (force || nextCarriage !== this.currentCarriage || nextNearest?.id !== this.nearest?.id) {
        this.currentCarriage = nextCarriage; this.nearest = nextNearest;
        this.door?.setFrame(nextNearest?.targetScene ? 1 : 0);
        this.refreshBubble();
        options.onSnapshot({ scene: this.sceneId, carriage: nextCarriage, nearest: nextNearest });
      }
    }

    private animateWorld(time: number, delta: number) {
      if (calm) return;
      for (const { sprite, speed } of this.layers) sprite.tilePositionX -= speed * delta / 1000;
      const wheelFrame = Math.floor(time / 110) % 2;
      for (const wheel of this.wheels) wheel.setFrame(wheelFrame);
      for (const { sprite, offset } of this.screens) sprite.setFrame(Math.floor((time + offset) / 520) % 3);
      for (const npc of this.npcs) {
        if (npc.cat) { npc.sprite.setFrame(Math.floor((time + npc.phase) / 640) % 2); continue; }
        const dx = this.player.x - npc.sprite.x; const dy = this.player.y - npc.sprite.y;
        const facing = Math.hypot(dx, dy) > 72 ? 0 : Math.abs(dx) > Math.abs(dy) ? dx < 0 ? 1 : 2 : dy < 0 ? 3 : 0;
        npc.sprite.setFrame(facing * 4 + (Math.floor((time + npc.phase) / 720) % 2 ? 3 : 0));
      }
    }

    update(time: number, delta: number) {
      if (!this.player) return;
      this.animateWorld(time, delta);
      if (paused || transitioning || !document.hasFocus()) { this.player.setVelocity(0, 0); this.player.anims.stop(); return; }
      const focus = document.activeElement;
      const typing = focus instanceof HTMLElement && focus.matches("button,a,input,select,textarea,[contenteditable=true]");
      let x = typing ? 0 : Number(this.keys.right.isDown || this.keys.arrowRight.isDown) - Number(this.keys.left.isDown || this.keys.arrowLeft.isDown);
      let y = typing ? 0 : Number(this.keys.down.isDown || this.keys.arrowDown.isDown) - Number(this.keys.up.isDown || this.keys.arrowUp.isDown);
      x += virtual.x; y += virtual.y;
      if (x || y) { this.route = []; this.pending = null; this.marker.clear(); }
      else if (this.route.length) {
        if (this.pending && inRange(this.player, this.pending)) { this.activate(this.pending); return; }
        const target = cellCenter(this.route[0]);
        const dx = target.x - this.player.x; const dy = target.y - this.player.y;
        if (Math.hypot(dx, dy) < 2) {
          this.player.setPosition(target.x, target.y); this.route.shift();
          this.drawRoute();
          if (!this.route.length) { this.marker.clear(); if (this.pending) this.activate(this.pending); }
        } else {
          const factor = Math.min(1, Math.hypot(dx, dy) / Math.max(1, 95 * delta / 1000));
          const distance = Math.hypot(dx, dy); x = dx / distance * factor; y = dy / distance * factor;
          if (Math.hypot(this.player.x - this.lastPosition.x, this.player.y - this.lastPosition.y) < 0.15) this.stalledFor += delta;
          else this.stalledFor = 0;
          this.lastPosition = { x: this.player.x, y: this.player.y };
          if (this.stalledFor > 700) { this.clearMovement(); x = 0; y = 0; options.onMessage("The path was blocked. Tap an open floor tile to try another route."); }
        }
      }
      const length = Math.hypot(x, y);
      const velocity = walkVelocity(x, y);
      this.player.setVelocity(velocity.x, velocity.y);
      if (length) {
        this.facing = Math.abs(x) > Math.abs(y) ? x > 0 ? "right" : "left" : y > 0 ? "down" : "up";
        this.player.anims.play(`walk-${this.facing}`, true);
        this.stepTimer -= delta;
        if (this.stepTimer <= 0) { this.stepTimer = 230; this.footDust?.emitParticleAt(this.player.x, this.player.y + 3, 2); audio.play("step"); }
      } else {
        this.player.anims.stop();
        this.player.setFrame(FACINGS.indexOf(this.facing) * 4 + (!calm && Math.floor(time / 720) % 2 ? 3 : 0));
      }
      this.player.setDepth(this.player.y + 4);
      this.publish();
      if (!typing && (Phaser.Input.Keyboard.JustDown(this.keys.interact) || Phaser.Input.Keyboard.JustDown(this.keys.confirm))) this.interact();
    }
  }
  class StationScene extends WorldScene { constructor() { super("StationScene", "station"); } }
  class TrainScene extends WorldScene { constructor() { super("TrainScene", "train"); } }
  class UIScene extends Phaser.Scene {
    private vignette!: Phaser.GameObjects.Image;
    private curtain!: Phaser.GameObjects.Graphics;
    private title!: Phaser.GameObjects.Text;
    constructor() { super("UIScene"); }
    create() {
      // Other scenes hold the keyboard and pointer; this one only paints on top of them.
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      overlay = this;
      this.input.enabled = false;
      this.vignette = this.add.image(0, 0, "vignette").setOrigin(0).setAlpha(0.2);
      this.curtain = this.add.graphics().setDepth(10);
      this.title = this.add.text(0, 0, "", { fontFamily: "monospace", fontSize: "20px", fontStyle: "bold", color: palette.gold }).setOrigin(0.5).setDepth(11).setVisible(false);
      this.layout();
      this.scale.on("resize", this.layout, this);
      this.events.once("shutdown", () => { this.scale.off("resize", this.layout, this); if (overlay === this) overlay = null; });
    }
    private layout() { this.vignette.setDisplaySize(this.scale.width, this.scale.height); this.title.setPosition(this.scale.width / 2, this.scale.height / 2); }
    private paint(amount: number) {
      const size = 32;
      const order = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
      this.curtain.clear().fillStyle(0x221f30);
      for (let y = 0; y * size < this.scale.height; y++) for (let x = 0; x * size < this.scale.width; x++) {
        if (order[(y % 4) * 4 + (x % 4)] / 16 < amount) this.curtain.fillRect(x * size, y * size, size, size);
      }
    }
    dissolve(midpoint: () => void, title: string) {
      if (transitioning) return;
      transitioning = true;
      this.title.setText(title);
      const state = { amount: 0 };
      this.tweens.add({
        targets: state, amount: 1.05, duration: 300, onUpdate: () => this.paint(state.amount),
        onComplete: () => {
          this.title.setVisible(true);
          midpoint();
          this.time.delayedCall(320, () => {
            this.title.setVisible(false);
            this.tweens.add({ targets: state, amount: 0, duration: 300, onUpdate: () => this.paint(state.amount), onComplete: () => { this.curtain.clear(); transitioning = false; } });
          });
        },
      });
    }
  }

  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    backgroundColor: palette.ink,
    pixelArt: true,
    roundPixels: true,
    antialias: false,
    banner: false,
    // Canvas key events reach Phaser before the document's scroll prevention.
    // HTML dialogs and toolbar buttons never feed into gameplay input.
    input: { keyboard: { target: parent } },
    scale: { mode: Phaser.Scale.RESIZE, width: parent.clientWidth || 800, height: parent.clientHeight || 500 },
    physics: { default: "arcade", arcade: { gravity: { x: 0, y: 0 }, debug: false } },
    audio: { noAudio: true },
    fps: { target: 60, forceSetTimeOut: false },
    scene: [BootScene, PreloadScene, StationScene, TrainScene, UIScene],
    callbacks: { postBoot: (bootedGame) => { bootedGame.canvas.tabIndex = 0; bootedGame.canvas.setAttribute("aria-label", "Pixel train world. Use WASD or arrow keys to walk, E to interact. The route map and Read portfolio provide keyboard navigation."); } },
  });
  const observer = new ResizeObserver(() => { if (!destroyed && parent.clientWidth && parent.clientHeight) game.scale.resize(parent.clientWidth, parent.clientHeight); });
  observer.observe(parent);

  return {
    setPaused(value) { paused = value; active?.clearMovement(); },
    interact() { active?.interact(); },
    travel(destination) {
      if (!ready) { queuedTravel = destination; return; }
      active?.clearMovement();
      changeScene(destination === "station" ? "station" : "train", destination === "station" ? undefined : destination, destination === "station" ? "YOGYAKARTA" : CARRIAGES.find((car) => car.id === destination)?.label.toUpperCase() ?? "");
      game.canvas.focus({ preventScroll: true });
    },
    move(x, y) { if (!paused) { virtual = { x, y }; if (active) { active.route = []; active.pending = null; active.marker.clear(); } } },
    stop() { virtual = { x: 0, y: 0 }; active?.player.setVelocity(0, 0); },
    setMuted: (value) => audio.setMuted(value),
    focus() { game.canvas.focus({ preventScroll: true }); },
    destroy() { destroyed = true; observer.disconnect(); audio.destroy(); active?.clearMovement(); game.destroy(true); },
  };
}
