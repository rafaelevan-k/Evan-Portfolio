"use client";

import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, BookOpen, Check, HelpCircle, Map, Stamp, TrainFront, Volume2, VolumeX } from "lucide-react";
import { Pixelify_Sans } from "next/font/google";
import { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { JourneyDialog } from "./pixel/JourneyDialog";
import { CARRIAGES, createWorld, type CarriageId, type PayloadId } from "./pixel/world";
import type { JourneyController, JourneySnapshot } from "./pixel/engine";
import type { GameCertification, GameProject } from "./train/types";
import "./pixel/journey.css";

export type { GameCertification, GameProject } from "./train/types";
type Props = { projects: GameProject[]; certifications: GameCertification[]; whatsappLink: string; emailAddress: string; onExit: () => void; onEnterArchive: () => void };
const VISITED_KEY = "rafael-line:visited:v1";
const FOUND_KEY = "rafael-line:found:v1";
const INITIAL: JourneySnapshot = { scene: "station", carriage: null, nearest: null };
const pixelFont = Pixelify_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-pixel", display: "swap" });

function readList(key: string): string[] {
  try {
    const stored = JSON.parse(localStorage.getItem(key) ?? "[]");
    return Array.isArray(stored) ? stored.filter((item): item is string => typeof item === "string") : [];
  } catch { return []; }
}
function writeList(key: string, value: string[]) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* Storage is optional. */ }
}

export function GamifiedPortfolio({ projects, certifications, whatsappLink, emailAddress, onExit, onEnterArchive }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const controller = useRef<JourneyController | null>(null);
  const panelRef = useRef<PayloadId | null>("guide");
  const pendingTravel = useRef<CarriageId | "station" | null>(null);
  const pausedRef = useRef(true);
  const projectLabels = useRef(projects.map((project) => project.shortTitle));
  const [panel, setPanel] = useState<PayloadId | null>("guide");
  const [snapshot, setSnapshot] = useState<JourneySnapshot>(INITIAL);
  const [visited, setVisited] = useState<CarriageId[]>(() => readList(VISITED_KEY).filter((id): id is CarriageId => CARRIAGES.some((carriage) => carriage.id === id)));
  // Stamps count every note a visitor can open; they are a keepsake and never gate content.
  const [stampIds] = useState(() => [...createWorld("station").interactions, ...createWorld("train", projects.length).interactions].filter((item) => !item.line && !item.targetScene).map((item) => item.id));
  const [found, setFound] = useState<string[]>(() => readList(FOUND_KEY));
  const foundRef = useRef(found);
  const [ready, setReady] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);
  const [muted, setMuted] = useState(true);
  const [soundBusy, setSoundBusy] = useState(false);
  const [active, setActive] = useState(true);
  const [message, setMessage] = useState("Your ticket is ready. Take a moment to meet the conductor.");
  const reducedMotion = useReducedMotion() ?? false;
  const car = CARRIAGES.find((item) => item.id === snapshot.carriage);
  const stampCount = stampIds.filter((id) => found.includes(id)).length;
  const place = car ?? { label: "Yogyakarta Station", name: "The platform", description: "Your train is waiting at the platform." };
  const placeNumber = car ? `Carriage ${String(CARRIAGES.indexOf(car) + 1).padStart(2, "0")}` : "Rafael Line";

  const openPanel = useCallback((payload: PayloadId) => {
    controller.current?.setPaused(true);
    panelRef.current = payload;
    setPanel(payload);
  }, []);
  const closePanel = useCallback(() => {
    panelRef.current = null;
    setPanel(null);
    requestAnimationFrame(() => controller.current?.focus());
  }, []);
  const travel = useCallback((destination: CarriageId | "station") => {
    closePanel();
    if (controller.current) controller.current.travel(destination);
    else pendingTravel.current = destination;
  }, [closePanel]);

  useEffect(() => {
    let cancelled = false;
    let instance: JourneyController | null = null;
    const parent = stage.current;
    if (!parent) return;
    import("./pixel/engine").then(({ createJourney }) => {
      if (cancelled) return;
      instance = createJourney(parent, {
        reducedMotion,
        projectLabels: projectLabels.current,
        found: foundRef.current,
        onReady: () => { if (!cancelled) { setReady(true); setError(false); } },
        onProgress: (value) => { if (!cancelled) setProgress(value); },
        onSnapshot: (value) => {
          if (cancelled) return;
          setSnapshot(value);
          if (value.carriage) setVisited((previous) => {
            if (previous.includes(value.carriage!)) return previous;
            const next = [...previous, value.carriage!];
            writeList(VISITED_KEY, next);
            return next;
          });
        },
        onInteract: openPanel,
        onDiscover: (id) => {
          if (cancelled || foundRef.current.includes(id)) return;
          foundRef.current = [...foundRef.current, id];
          writeList(FOUND_KEY, foundRef.current);
          setFound(foundRef.current);
          setMessage("New stamp on your ticket. Keep wandering, there is more to find.");
        },
        onMessage: (value) => { if (!cancelled) setMessage(value); },
      });
      controller.current = instance;
      instance.setPaused(pausedRef.current);
      if (pendingTravel.current) { instance.travel(pendingTravel.current); pendingTravel.current = null; }
    }).catch(() => { if (!cancelled) { setError(true); setMessage("The journey couldn't start. Retry, or read the regular portfolio."); } });
    return () => { cancelled = true; instance?.destroy(); if (controller.current === instance) controller.current = null; };
  }, [reducedMotion, retry, openPanel]);

  useEffect(() => {
    pausedRef.current = Boolean(panel) || !active;
    controller.current?.setPaused(pausedRef.current);
  }, [panel, active]);

  useEffect(() => {
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const blur = () => { setActive(false); controller.current?.stop(); void controller.current?.setMuted(true).catch(() => undefined); setMuted(true); };
    const focus = () => setActive(!document.hidden);
    const visibility = () => document.hidden ? blur() : focus();
    const keydown = (event: KeyboardEvent) => {
      if (panelRef.current) return;
      if (event.key === "Escape") { event.preventDefault(); onExit(); return; }
      if (event.target instanceof HTMLCanvasElement && ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(event.key)) event.preventDefault();
      if (event.key !== "Tab") return;
      const focusable = Array.from(root.current?.querySelectorAll<HTMLElement>("button:not(:disabled),a[href],canvas[tabindex], [tabindex='0']") ?? []).filter((element) => element.getClientRects().length);
      const first = focusable[0]; const last = focusable[focusable.length - 1];
      if (event.shiftKey && (document.activeElement === first || document.activeElement === root.current)) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    window.addEventListener("blur", blur); window.addEventListener("focus", focus);
    document.addEventListener("visibilitychange", visibility); document.addEventListener("keydown", keydown);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener("blur", blur); window.removeEventListener("focus", focus);
      document.removeEventListener("visibilitychange", visibility); document.removeEventListener("keydown", keydown);
    };
  }, [onExit]);

  async function toggleSound() {
    if (!controller.current || soundBusy) return;
    const next = !muted;
    setSoundBusy(true);
    try { await controller.current.setMuted(next); setMuted(next); }
    catch { setMuted(true); setMessage("Sound isn't available in this browser. The journey is ready to explore quietly."); }
    finally { setSoundBusy(false); }
  }

  const directions = [
    { label: "Walk up", x: 0, y: -1, icon: ArrowUp, className: "up" },
    { label: "Walk left", x: -1, y: 0, icon: ArrowLeft, className: "left" },
    { label: "Walk down", x: 0, y: 1, icon: ArrowDown, className: "down" },
    { label: "Walk right", x: 1, y: 0, icon: ArrowRight, className: "right" },
  ];

  return (
    <div ref={root} className={`journey-shell ${pixelFont.variable}`} role="dialog" aria-modal="true" aria-labelledby="journey-title" tabIndex={-1}>
      <main className="journey-world" data-scene={snapshot.scene} data-carriage={snapshot.carriage ?? "station"}>
        <div ref={stage} className="journey-canvas-host" />
        <header className="journey-hud-top">
          <div className="journey-brand journey-panel">
            <span className="journey-brand-mark" aria-hidden="true"><TrainFront size={19} /></span>
            <div><h1 id="journey-title">The Journey</h1><span className="journey-brand-place">{place.label}</span></div>
          </div>
          <nav className="journey-route journey-panel" aria-label="Quick carriage navigation">
            {CARRIAGES.map((item, index) => <button key={item.id} type="button" aria-current={snapshot.carriage === item.id ? "location" : undefined} onClick={() => travel(item.id)} style={{ "--car-color": item.color } as React.CSSProperties}><span className="journey-route-number">{visited.includes(item.id) ? <Check size={12} aria-label="Visited" /> : String(index + 1).padStart(2, "0")}</span><span className="journey-route-label">{item.label}</span></button>)}
          </nav>
          <div className="journey-header-actions">
            <div className="journey-stamps journey-panel" role="status" aria-label={`${stampCount} of ${stampIds.length} stamps collected`} title="Stamps from everything you have opened so far"><Stamp size={15} aria-hidden="true" /><span>{stampCount}/{stampIds.length}</span></div>
            <button className="journey-icon-button journey-panel" type="button" onClick={() => openPanel("guide")} aria-label="Show movement tutorial"><HelpCircle size={18} /></button>
            <button className="journey-icon-button journey-panel" type="button" onClick={toggleSound} disabled={!ready || soundBusy} aria-label={muted ? "Enable sound" : "Mute sound"} aria-pressed={!muted}>{muted ? <VolumeX size={18} /> : <Volume2 size={18} />}</button>
            <button className="journey-exit" type="button" onClick={onExit}><BookOpen size={16} /><span>Read portfolio</span><span className="journey-exit-short">Exit</span></button>
          </div>
        </header>
        {ready && !panel && <div key={snapshot.carriage ?? "station"} className="journey-banner" aria-hidden="true"><small>{placeNumber}</small><strong>{place.name}</strong><span>{place.description}</span></div>}
        {!ready && <div className="journey-loading" role="status"><div className="journey-loading-train" aria-hidden="true"><TrainFront size={34} /></div><h2>{error ? "The train needs a moment." : "Preparing your journey…"}</h2><p>{error ? "Retry, or return to the regular portfolio." : "Pixel scenery, a little traveler, and five open carriages."}</p>{error ? <button className="journey-button-primary" type="button" onClick={() => { setError(false); setRetry((value) => value + 1); }}>Retry the journey</button> : <progress aria-label="Loading game assets" value={progress} max={1} />}</div>}
        {ready && !active && !panel && <div className="journey-paused" role="status">Journey paused · return to continue</div>}
        <footer className="journey-controls">
          <div className="journey-dpad" aria-label="Touch movement controls">{directions.map(({ label, x, y, icon: Icon, className }) => <button key={label} className={className} type="button" aria-label={label} disabled={!ready || Boolean(panel)} onPointerDown={(event) => { event.preventDefault(); event.currentTarget.setPointerCapture(event.pointerId); controller.current?.move(x, y); }} onPointerUp={() => controller.current?.stop()} onPointerCancel={() => controller.current?.stop()} onLostPointerCapture={() => controller.current?.stop()} onKeyDown={(event) => { if (event.key === " " || event.key === "Enter") { event.preventDefault(); controller.current?.move(x, y); } }} onKeyUp={() => controller.current?.stop()} onBlur={() => controller.current?.stop()}><Icon size={18} /></button>)}<span aria-hidden="true" /></div>
          <div className="journey-control-copy journey-panel">
            <p className="journey-status" role="status" aria-live="polite">{message}</p>
            <div className="journey-keyboard-help"><kbd>WASD</kbd><span>walk</span><i /><kbd>E</kbd><span>interact</span><i /><span>click to move</span></div>
          </div>
          <div className="journey-control-actions">
            <button type="button" className="journey-map-button journey-panel" onClick={() => openPanel("navigation")}><Map size={16} /> <span>Route map</span></button>
            <button type="button" className="journey-interact" data-ready={Boolean(snapshot.nearest)} disabled={!ready || !snapshot.nearest} onClick={() => controller.current?.interact()}><kbd>E</kbd><span>{snapshot.nearest?.label ?? "Walk near a marker"}</span><ArrowRight size={16} /></button>
          </div>
        </footer>
      </main>
      {panel && <JourneyDialog key={panel} panel={panel} projects={projects} certifications={certifications} emailAddress={emailAddress} whatsappLink={whatsappLink} visited={visited} className={pixelFont.variable} onClose={closePanel} onTravel={travel} onExit={onExit} onEnterArchive={onEnterArchive} />}
    </div>
  );
}
