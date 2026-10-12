import Phaser from "phaser";
import { JourneyAudio } from "./audio";
import { findPath, interactionGoals } from "./pathfinding";
import { carriageTexture, connectorTexture, createPixelAssets, palette, propTexture } from "./pixelAssets";
import { CAR_BOTTOM, CAR_START, CAR_STEP, CAR_TOP, CAR_WIDTH, CARRIAGES, TILE, cameraLayout, carriageAt, carriageSpawn, cellCenter, createWorld, inRange, interactionAt, isWalkable, toCell, walkVelocity, type CarriageId, type Cell, type Interaction, type PayloadId, type SceneId, type WorldMap } from "./world";

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
  onReady: () => void;
  onProgress: (progress: number) => void;
  onSnapshot: (snapshot: JourneySnapshot) => void;
  onInteract: (payload: PayloadId) => void;
  onMessage: (message: string) => void;
};

export function createJourney(parent: HTMLElement, options: Options): JourneyController {
  let active: WorldScene | null = null;
  let paused = true;
  let destroyed = false;
  let ready = false;
  let queuedTravel: CarriageId | "station" | null = null;
  let virtual = { x: 0, y: 0 };
  const audio = new JourneyAudio();

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
    shadow!: Phaser.GameObjects.Ellipse;
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

    constructor(key: string, private sceneId: SceneId) { super(key); }
    init(data: { carriage?: CarriageId }) { this.requestedCarriage = data?.carriage ?? null; }
    create() {
      this.map = createWorld(this.sceneId, options.projectLabels.length);
      this.map.interactions.forEach((target) => {
        if (target.payloadId.startsWith("project:")) target.label = `Open ${options.projectLabels[Number(target.payloadId.split(":")[1])]}`;
      });
      this.route = []; this.pending = null; this.nearest = null; this.facing = "down";
      this.currentCarriage = null; this.stalledFor = 0;
      // The controller and overlay share the current Phaser world scene.
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      active = this;
      this.drawWorld();
      const spawn = this.sceneId === "train" && this.requestedCarriage ? carriageSpawn(this.requestedCarriage) : this.map.spawn;
      this.shadow = this.add.ellipse(spawn.x, spawn.y + 3, 15, 6, 0x302b42, 0.3);
      this.player = this.physics.add.sprite(spawn.x, spawn.y, "traveler", 0).setOrigin(0.5, 0.875);
      this.player.body!.setSize(10, 10).setOffset(3, 22);
      this.player.setCollideWorldBounds(true);
      this.physics.world.setBounds(0, 0, this.map.width, this.map.height);
      const collisionMap = this.make.tilemap({ data: this.map.grid.map((row) => row.map((cell) => cell === 1 ? 0 : -1)), tileWidth: TILE, tileHeight: TILE });
      const tiles = collisionMap.addTilesetImage("solid", "solid", TILE, TILE, 0, 0, 0)!;
      const collisionLayer = collisionMap.createLayer(0, tiles)!.setVisible(false).setCollision(0);
      this.physics.add.collider(this.player, collisionLayer);
      this.marker = this.add.graphics().setDepth(900);
      this.keys = this.input.keyboard!.addKeys({ up: "W", left: "A", down: "S", right: "D", arrowUp: "UP", arrowLeft: "LEFT", arrowDown: "DOWN", arrowRight: "RIGHT", interact: "E" }, false) as Record<string, Phaser.Input.Keyboard.Key>;
      this.input.on("pointerdown", this.onPointer, this);
      this.cameras.main.setBounds(0, 0, this.map.width, this.map.height);
      this.cameras.main.startFollow(this.player, true, 1, 1, 0, 28);
      this.resize();
      this.scale.on("resize", this.resize, this);
      this.events.once("shutdown", () => {
        this.scale.off("resize", this.resize, this);
        this.input.off("pointerdown", this.onPointer, this);
        this.route = []; this.pending = null;
        if (active === this) active = null;
      });
      this.publish(true);
      options.onMessage(this.sceneId === "station" ? "Welcome to Rafael Line. Talk to the conductor, or walk to the glowing train door." : "You're aboard. Walk through the open passages, or choose a carriage above.");
    }

    private resize() {
      const layout = cameraLayout(this.sceneId, this.scale.width, this.scale.height);
      const camera = this.cameras.main;
      camera.setZoom(layout.zoom).setRoundPixels(true);
      // A complete desktop interior stays framed while the camera follows horizontally.
      // Narrow screens keep the closer, two-axis view for walking and touch interaction.
      camera.setLerp(1, layout.desktopInterior ? 0 : 1);
      if (layout.desktopInterior) camera.centerOn(this.player.x, layout.centerY);
    }

    private label(x: number, y: number, text: string, color = palette.paper, size = 8) {
      return this.add.text(x, y, text, { fontFamily: "monospace", fontSize: `${size}px`, color, backgroundColor: palette.ink, padding: { x: 4, y: 3 } }).setOrigin(0.5).setDepth(550);
    }

    private drawWorld() {
      const g = this.add.graphics();
      this.cameras.main.setBackgroundColor(this.sceneId === "train" ? palette.shadow : palette.ink);
      if (this.sceneId === "station" && this.textures.exists("countryside")) {
        // Outdoors uses one cover image, never a vertically repeating panorama.
        const backdrop = this.add.image(this.map.width / 2, this.map.height / 2, "countryside").setDepth(-1);
        backdrop.setScale(Math.max(this.map.width / backdrop.width, this.map.height / backdrop.height));
      }
      if (this.sceneId === "station") {
        // The paving stays below station trim, lights, and boarding markings.
        this.add.tileSprite(0, 420, 640, 60, "grass").setOrigin(0).setDepth(-0.5);
        this.add.tileSprite(48, 256, 544, 176, "platform-floor").setOrigin(0).setDepth(-0.5);
        g.fillStyle(0x302b42).fillRect(35, 246, 570, 9);
        for (let x = 50; x < 590; x += 16) g.fillStyle(0xeebd76).fillRect(x, 258, 10, 3);
        g.fillStyle(0x3d655f).fillRect(48, 135, 544, 110);
        g.fillStyle(0xa7baa2).fillRect(48, 132, 544, 9);
        g.fillStyle(0x284d4b).fillRect(48, 226, 544, 13);
        g.fillStyle(0xeac48b).fillRect(48, 221, 544, 4);
        for (const x of [92, 166, 390, 464]) {
          g.fillStyle(0x302b42).fillRect(x, 165, 58, 39);
          if (this.textures.exists("countryside")) this.add.image(x + 29, 183, "countryside").setDisplaySize(50, 29);
          this.add.rectangle(x + 29, 184, 3, 39, 0xd2c59c);
        }
        g.fillStyle(0x302b42).fillRect(287, 156, 50, 91);
        g.fillStyle(0xeac48b).fillRect(290, 159, 4, 88).fillRect(330, 159, 4, 88);
        g.fillStyle(0x6f9387).fillRect(296, 162, 32, 79);
        g.fillStyle(0xd5bd85).fillRect(303, 174, 18, 31);
        g.fillStyle(0xeebd76).fillRect(290, 247, 44, 7);
        this.label(312, 125, "RAFAEL LINE", palette.paper, 11);
        this.label(312, 280, "BOARD HERE", palette.gold);
        this.label(125, 401, "YOGYAKARTA STATION", palette.paper, 8);
        for (const x of [55, 574]) {
          g.fillStyle(0x302b42).fillRect(x, 312, 4, 75).fillRect(x - 7, 306, 18, 5);
          g.fillStyle(0xeac48b).fillRect(x - 5, 312, 14, 9);
        }
      } else {
        CARRIAGES.forEach((car, index) => {
          const start = (CAR_START + index * CAR_STEP) * TILE;
          const width = CAR_WIDTH * TILE;
          const height = (CAR_BOTTOM - CAR_TOP + 1) * TILE + 8;
          g.fillStyle(0x171526).fillRect(start - 3, CAR_TOP * TILE + 5, width + 6, height + 3);
          this.add.image(start, CAR_TOP * TILE, carriageTexture(this, car.id, car.color, width, height)).setOrigin(0);
          this.label(start + 192, 140, `${String(index + 1).padStart(2, "0")}  ${car.label.toUpperCase()}`, palette.paper, 10);
          if (index < 4) {
            const gap = (CAR_STEP - CAR_WIDTH) * TILE;
            g.fillStyle(0x262333).fillRect(start + width, CAR_TOP * TILE, gap, height);
            for (let x = start + width + 2; x < start + width + gap; x += 6) g.fillStyle(0x34303d).fillRect(x, CAR_TOP * TILE + 4, 2, height - 8);
            this.add.image(start + width - TILE, 17 * TILE - 8, connectorTexture(this)).setOrigin(0).setDepth(2);
          }
        });
      }
      for (const prop of this.map.props) {
        this.add.image(prop.x, prop.y, propTexture(this, prop)).setOrigin(0.5, 2 / 3).setDepth(prop.y);
        const interaction = this.map.interactions.find((item) => item.id === prop.interactionId);
        if (interaction) {
          const text = interaction.payloadId.startsWith("project:") ? `PROJECT ${Number(interaction.payloadId.split(":")[1]) + 1}` : interaction.type === "npc" ? prop.kind === "conductor" ? "CONDUCTOR" : "TEACHING" : interaction.payloadId.startsWith("skill:") ? ["FRONTEND", "BACKEND", "TOOLS"][Number(interaction.payloadId.split(":")[1])] : { about: "RAFAEL", education: "EDUCATION", experience: "TIMELINE", certifications: "CERTIFICATES", contact: "SAY HELLO", cv: "CV", archive: "ARCHIVE", return: "EXIT", navigation: "ROUTE MAP" }[interaction.payloadId as "about"] ?? "EXPLORE";
          this.label(prop.x, prop.y - 37, text, palette.gold, 7);
        }
      }
    }

    clearMovement() {
      this.route = []; this.pending = null; virtual = { x: 0, y: 0 };
      this.player?.setVelocity(0, 0);
      this.input.keyboard?.resetKeys();
      this.marker?.clear();
    }

    private onPointer(pointer: Phaser.Input.Pointer) {
      if (paused) return;
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
      const destination = cellCenter(this.route[this.route.length - 1]);
      this.marker.lineStyle(1, 0xedbe74).strokeRect(destination.x - 5, destination.y - 5, 10, 10);
      options.onMessage(target ? `Walking to ${target.label.toLowerCase()}…` : "Walking to the marked spot. Use a direction key to cancel.");
      this.lastPosition = { x: this.player.x, y: this.player.y }; this.stalledFor = 0;
    }

    interact() {
      if (paused) return;
      this.publish();
      if (this.nearest && inRange(this.player, this.nearest)) this.activate(this.nearest);
      else options.onMessage("Walk closer to a labeled object to interact.");
    }

    private activate(target: Interaction) {
      if (paused || !inRange(this.player, target)) return;
      this.clearMovement();
      if (target.targetScene) this.scene.start("TransitionScene", { target: target.targetScene, carriage: "about" });
      else options.onInteract(target.payloadId);
    }

    private publish(force = false) {
      const nextCarriage = this.sceneId === "train" ? carriageAt(this.player.x) : null;
      const nextNearest = this.map.interactions.filter((item) => inRange(this.player, item)).sort((a, b) => Math.hypot(a.x - this.player.x, a.y - this.player.y) - Math.hypot(b.x - this.player.x, b.y - this.player.y))[0] ?? null;
      if (force || nextCarriage !== this.currentCarriage || nextNearest?.id !== this.nearest?.id) {
        this.currentCarriage = nextCarriage; this.nearest = nextNearest;
        options.onSnapshot({ scene: this.sceneId, carriage: nextCarriage, nearest: nextNearest });
      }
    }

    update(_time: number, delta: number) {
      if (!this.player) return;
      if (paused || !document.hasFocus()) { this.player.setVelocity(0, 0); this.player.anims.stop(); return; }
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
      } else { this.player.anims.stop(); this.player.setFrame(["down", "left", "right", "up"].indexOf(this.facing) * 3); }
      this.player.setDepth(this.player.y + 4);
      this.shadow.setPosition(this.player.x, this.player.y + 3).setDepth(this.player.y - 1);
      this.publish();
      if (!typing && Phaser.Input.Keyboard.JustDown(this.keys.interact)) this.interact();
    }
  }
  class StationScene extends WorldScene { constructor() { super("StationScene", "station"); } }
  class TrainScene extends WorldScene { constructor() { super("TrainScene", "train"); } }
  class TransitionScene extends Phaser.Scene {
    constructor() { super("TransitionScene"); }
    create(data: { target: SceneId; carriage?: CarriageId }) {
      virtual = { x: 0, y: 0 };
      this.cameras.main.setBackgroundColor(palette.ink);
      this.add.text(this.scale.width / 2, this.scale.height / 2, data.target === "train" ? "ALL ABOARD…" : "BACK AT THE STATION", { fontFamily: "monospace", fontSize: "16px", color: palette.gold }).setOrigin(0.5);
      this.time.delayedCall(options.reducedMotion ? 0 : 380, () => this.scene.start(data.target === "train" ? "TrainScene" : "StationScene", { carriage: data.carriage }));
    }
  }
  class UIScene extends Phaser.Scene {
    private hint!: Phaser.GameObjects.Text;
    constructor() { super("UIScene"); }
    create() { this.hint = this.add.text(0, 0, "E", { fontFamily: "monospace", fontSize: "12px", color: palette.ink, backgroundColor: palette.gold, padding: { x: 5, y: 3 } }).setOrigin(0.5).setVisible(false); }
    update() {
      const target = active?.nearest;
      this.hint.setVisible(Boolean(target && !paused));
      if (target && active) {
        const camera = active.cameras.main;
        this.hint.setPosition((target.x - camera.worldView.x) * camera.zoom, (target.y - 45 - camera.worldView.y) * camera.zoom);
      }
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
    scene: [BootScene, PreloadScene, StationScene, TransitionScene, TrainScene, UIScene],
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
      const target = destination === "station" ? "StationScene" : "TrainScene";
      if (game.scene.isActive("TransitionScene")) game.scene.stop("TransitionScene");
      if (active) active.scene.start(target, { carriage: destination === "station" ? undefined : destination });
      else game.scene.start(target, { carriage: destination === "station" ? undefined : destination });
      game.canvas.focus({ preventScroll: true });
    },
    move(x, y) { if (!paused) { virtual = { x, y }; if (active) { active.route = []; active.pending = null; active.marker.clear(); } } },
    stop() { virtual = { x: 0, y: 0 }; active?.player.setVelocity(0, 0); },
    setMuted: (value) => audio.setMuted(value),
    focus() { game.canvas.focus({ preventScroll: true }); },
    destroy() { destroyed = true; observer.disconnect(); audio.destroy(); active?.clearMovement(); game.destroy(true); },
  };
}
