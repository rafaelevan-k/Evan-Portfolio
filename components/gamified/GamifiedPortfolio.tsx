"use client";

import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, BookOpen, Check, HelpCircle, Map, TrainFront, Volume2, VolumeX } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { JourneyDialog } from "./pixel/JourneyDialog";
import { CARRIAGES, type CarriageId, type PayloadId } from "./pixel/world";
import type { JourneyController, JourneySnapshot } from "./pixel/engine";
import type { GameCertification, GameProject } from "./train/types";
import "./pixel/journey.css";

export type { GameCertification, GameProject } from "./train/types";
type Props = { projects: GameProject[]; certifications: GameCertification[]; whatsappLink: string; emailAddress: string; onExit: () => void; onEnterArchive: () => void };
const VISITED_KEY = "rafael-line:visited:v1";
const INITIAL: JourneySnapshot = { scene: "station", carriage: null, nearest: null };

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
  const [visited, setVisited] = useState<CarriageId[]>([]);
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
        onReady: () => { if (!cancelled) { setReady(true); setError(false); } },
        onProgress: (value) => { if (!cancelled) setProgress(value); },
        onSnapshot: (value) => {
          if (cancelled) return;
          setSnapshot(value);
          if (value.carriage) setVisited((previous) => {
            if (previous.includes(value.carriage!)) return previous;
            const next = [...previous, value.carriage!];
            try { localStorage.setItem(VISITED_KEY, JSON.stringify(next)); } catch { /* Storage is optional. */ }
            return next;
          });
        },
        onInteract: openPanel,
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
    const stored = (() => { try { return JSON.parse(localStorage.getItem(VISITED_KEY) ?? "[]"); } catch { return []; } })();
    if (Array.isArray(stored)) setVisited(stored.filter((id): id is CarriageId => CARRIAGES.some((carriage) => carriage.id === id)));
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
    <div ref={root} className="journey-shell" role="dialog" aria-modal="true" aria-labelledby="journey-title" tabIndex={-1}>
      <header className="journey-header">
        <div className="journey-brand"><span className="journey-brand-mark" aria-hidden="true"><TrainFront size={23} /></span><div><span className="journey-eyebrow">REVS PORTFOLIO / RAFAEL LINE</span><h1 id="journey-title">The Journey<span className="journey-title-dot">.</span></h1></div></div>
        <div className="journey-header-actions">
          <button className="journey-icon-button" type="button" onClick={() => openPanel("guide")} aria-label="Show movement tutorial"><HelpCircle size={19} /></button>
          <button className="journey-icon-button" type="button" onClick={toggleSound} disabled={!ready || soundBusy} aria-label={muted ? "Enable sound" : "Mute sound"} aria-pressed={!muted}>{muted ? <VolumeX size={19} /> : <Volume2 size={19} />}</button>
          <button className="journey-exit" type="button" onClick={onExit}><BookOpen size={17} /><span>Read portfolio</span><span className="journey-exit-short">Exit</span></button>
        </div>
      </header>
      <nav className="journey-route" aria-label="Quick carriage navigation">
        {CARRIAGES.map((item, index) => <button key={item.id} type="button" aria-current={snapshot.carriage === item.id ? "location" : undefined} onClick={() => travel(item.id)} style={{ "--car-color": item.color } as React.CSSProperties}><span className="journey-route-number">{visited.includes(item.id) ? <Check size={12} aria-label="Visited" /> : String(index + 1).padStart(2, "0")}</span><span>{item.label}</span><i aria-hidden="true" /></button>)}
      </nav>
      <main className="journey-world" data-scene={snapshot.scene} data-carriage={snapshot.carriage ?? "station"}>
        <div className="journey-location"><span className="journey-location-light" /><span>{car ? `${car.label} / ${car.name}` : "Yogyakarta Station / The platform"}</span><span className="journey-location-mode">2D PIXEL EXPLORATION</span></div>
        <div ref={stage} className="journey-canvas-host" />
        {!ready && <div className="journey-loading" role="status"><TrainFront size={36} /><h2>{error ? "The train needs a moment." : "Preparing your journey…"}</h2><p>{error ? "Retry, or return to the regular portfolio." : "Pixel scenery, a little traveler, and five open carriages."}</p>{error ? <button className="journey-button-primary" type="button" onClick={() => { setError(false); setRetry((value) => value + 1); }}>Retry the journey</button> : <progress aria-label="Loading game assets" value={progress} max={1} />}</div>}
        {ready && !active && !panel && <div className="journey-paused" role="status">Journey paused · return to continue</div>}
        <div className="journey-world-caption" aria-hidden="true"><span>{snapshot.scene === "station" ? "A LITTLE JOURNEY BEGINS HERE" : "FOLLOW YOUR CURIOSITY"}</span><span>{visited.length} / 5 CARRIAGES VISITED</span></div>
      </main>
      <footer className="journey-controls">
        <div className="journey-control-copy"><span className="journey-eyebrow">{snapshot.nearest ? "SOMETHING TO DISCOVER" : "MAKE YOURSELF AT HOME"}</span><p className="journey-status" role="status" aria-live="polite">{message}</p><div className="journey-keyboard-help"><kbd>W A S D</kbd><span>or</span><kbd>↑ ← ↓ →</kbd><span>walk</span><i /><kbd>E</kbd><span>interact</span><i /><span>click the floor to move</span></div><p className="journey-touch-help">Tap the floor to walk. Tap an object to take a closer look.</p></div>
        <div className="journey-dpad" aria-label="Touch movement controls">{directions.map(({ label, x, y, icon: Icon, className }) => <button key={label} className={className} type="button" aria-label={label} disabled={!ready || Boolean(panel)} onPointerDown={(event) => { event.preventDefault(); event.currentTarget.setPointerCapture(event.pointerId); controller.current?.move(x, y); }} onPointerUp={() => controller.current?.stop()} onPointerCancel={() => controller.current?.stop()} onLostPointerCapture={() => controller.current?.stop()} onKeyDown={(event) => { if (event.key === " " || event.key === "Enter") { event.preventDefault(); controller.current?.move(x, y); } }} onKeyUp={() => controller.current?.stop()} onBlur={() => controller.current?.stop()}><Icon size={18} /></button>)}<span aria-hidden="true" /></div>
        <div className="journey-control-actions"><button type="button" className="journey-interact" disabled={!ready || !snapshot.nearest} onClick={() => controller.current?.interact()}><kbd>E</kbd><span>{snapshot.nearest?.label ?? "Walk near an object"}</span><ArrowRight size={17} /></button><button type="button" className="journey-map-button" onClick={() => openPanel("navigation")}><Map size={17} /> Route map</button></div>
      </footer>
      {panel && <JourneyDialog key={panel} panel={panel} projects={projects} certifications={certifications} emailAddress={emailAddress} whatsappLink={whatsappLink} visited={visited} onClose={closePanel} onTravel={travel} onExit={onExit} onEnterArchive={onEnterArchive} />}
    </div>
  );
}
