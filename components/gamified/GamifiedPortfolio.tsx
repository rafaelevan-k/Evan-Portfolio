"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, ChevronLeft, ChevronRight, Gamepad2, MapPin, Sparkles, Ticket, TrainFront, Trophy, X, Zap } from "lucide-react";
import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";

import { StationContent } from "./train/StationContent";
import { trainStations, type GameCertification, type GameProject, type StationId, type TrainStation } from "./train/types";

export type { GameCertification, GameProject } from "./train/types";

type JourneyPhase = "boarding" | "platform" | "departing" | "traveling" | "arriving" | "exploring";

type JourneyState = {
  phase: JourneyPhase;
  currentIndex: number;
  selectedIndex: number;
  direction: 1 | -1;
  tripId: number;
};

type JourneyAction = { type: "BOARD" } | { type: "SELECT"; index: number } | { type: "DEPART" } | { type: "DOORS_CLOSED" } | { type: "REACHED_DESTINATION" } | { type: "DOORS_OPEN" } | { type: "EXPLORE" } | { type: "RETURN_TO_TRAIN" };

const initialJourney: JourneyState = {
  phase: "boarding",
  currentIndex: 0,
  selectedIndex: 0,
  direction: 1,
  tripId: 0,
};

const TOTAL_XP = trainStations.reduce((total, station) => total + station.xp, 0);

function journeyReducer(state: JourneyState, action: JourneyAction): JourneyState {
  switch (action.type) {
    case "BOARD":
      return state.phase === "boarding" ? { ...state, phase: "platform" } : state;
    case "SELECT": {
      if (state.phase !== "platform") return state;
      const index = Math.min(trainStations.length - 1, Math.max(0, action.index));
      return { ...state, selectedIndex: index };
    }
    case "DEPART":
      if (state.phase !== "platform" || state.selectedIndex === state.currentIndex) return state;
      return {
        ...state,
        phase: "departing",
        direction: state.selectedIndex > state.currentIndex ? 1 : -1,
        tripId: state.tripId + 1,
      };
    case "DOORS_CLOSED":
      return state.phase === "departing" ? { ...state, phase: "traveling" } : state;
    case "REACHED_DESTINATION":
      return state.phase === "traveling" ? { ...state, phase: "arriving", currentIndex: state.selectedIndex } : state;
    case "DOORS_OPEN":
      return state.phase === "arriving" ? { ...state, phase: "platform" } : state;
    case "EXPLORE":
      return state.phase === "platform" && state.selectedIndex === state.currentIndex ? { ...state, phase: "exploring" } : state;
    case "RETURN_TO_TRAIN":
      return state.phase === "exploring" ? { ...state, phase: "platform" } : state;
  }
}

type GamifiedPortfolioProps = {
  projects: GameProject[];
  certifications: GameCertification[];
  whatsappLink: string;
  emailAddress: string;
  onExit: () => void;
  onEnterArchive: () => void;
};

type RouteStripProps = {
  state: JourneyState;
  visited: Set<StationId>;
  reducedMotion: boolean;
  onSelect: (index: number) => void;
};

function RouteStrip({ state, visited, reducedMotion, onSelect }: RouteStripProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const markerIndex = state.phase === "traveling" || state.phase === "arriving" ? state.selectedIndex : state.currentIndex;
  const routeLocked = state.phase !== "platform";
  const distance = Math.abs(state.selectedIndex - state.currentIndex);
  const markerDuration = reducedMotion ? 0 : 0.72 + Math.min(distance, 3) * 0.08;
  const lineProgress = (markerIndex / (trainStations.length - 1)) * 80;

  useEffect(() => {
    const scroller = scrollerRef.current;
    const selected = scroller?.querySelector<HTMLElement>(`[data-station-index="${state.selectedIndex}"]`);
    if (!scroller || !selected) return;

    const nextLeft = selected.offsetLeft - scroller.clientWidth / 2 + selected.clientWidth / 2;
    scroller.scrollTo({ left: Math.max(0, nextLeft), behavior: reducedMotion ? "auto" : "smooth" });
  }, [reducedMotion, state.selectedIndex]);

  return (
    <nav className="game-route-strip absolute inset-x-0 top-[4.25rem] z-40 border-b border-[#192234]/15 bg-[#ece4d6] px-3 py-2.5 text-[#171a20] sm:px-6" aria-label="Night Shift route">
      <div ref={scrollerRef} className="mx-auto max-w-7xl overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="relative flex min-w-[40rem] items-start px-8">
          <div className="game-route-line absolute left-[10%] right-[10%] top-[1.15rem] h-1 rounded-full bg-[#192234]/14" aria-hidden="true" />
          <motion.div
            className="game-route-line absolute left-[10%] top-[1.15rem] h-1 origin-left rounded-full bg-[#d94b35]"
            initial={false}
            animate={{ width: `${lineProgress}%` }}
            transition={{ duration: markerDuration, ease: [0.4, 0, 0.2, 1] }}
            aria-hidden="true"
          />

          {trainStations.map((station, index) => {
            const isSelected = state.selectedIndex === index;
            const isCurrent = state.currentIndex === index;
            const hasVisited = visited.has(station.id);

            return (
              <button
                key={station.id}
                type="button"
                data-station-index={index}
                data-station-button
                disabled={routeLocked}
                aria-label={`${isCurrent ? "Current stop, " : "Select "}${station.name}`}
                aria-pressed={isSelected}
                aria-current={isCurrent ? "step" : undefined}
                onClick={() => onSelect(index)}
                className="group relative flex min-h-[4.65rem] flex-1 flex-col items-center px-2 text-center disabled:cursor-default focus-visible:z-20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d94b35] focus-visible:ring-offset-2 focus-visible:ring-offset-[#ece4d6]"
              >
                <span
                  data-station-node
                  className={`relative z-10 flex h-9 w-9 items-center justify-center rounded-full border-[3px] transition-[color,background-color,border-color,transform] duration-150 ${
                    isSelected ? "scale-105 border-[#d94b35] bg-[#192234] text-white" : hasVisited ? "border-[#ece4d6] bg-[#3f6e61] text-white" : "border-[#ece4d6] bg-[#7d7d78] text-white"
                  }`}
                >
                  {hasVisited ? <Check className="h-4 w-4" strokeWidth={2.5} /> : <span className="font-mono text-[10px]">{index + 1}</span>}
                  {markerIndex === index && (
                    <motion.span
                      layoutId="rafael-line-train-marker"
                      transition={{ duration: markerDuration, ease: [0.4, 0, 0.2, 1] }}
                      className="absolute -top-3 left-1/2 flex h-5 w-5 -translate-x-1/2 items-center justify-center rounded-sm bg-[#f2d99c] text-[#192234] shadow-[0_2px_0_rgba(0,0,0,0.2)]"
                    >
                      <TrainFront className="h-3 w-3" />
                    </motion.span>
                  )}
                </span>
                <span data-station-meta className={`mt-2 font-display text-xs font-semibold uppercase tracking-[-0.01em] ${isSelected ? "text-[#d94b35]" : "text-[#343841]"}`}>
                  {station.name}
                </span>
                <span data-station-meta className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.1em] text-[#5c6068]">
                  {isCurrent ? "Current" : hasVisited ? "Cleared" : station.code}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

function MovingView({ direction, tripId, duration, reducedMotion, onComplete }: { direction: 1 | -1; tripId: number; duration: number; reducedMotion: boolean; onComplete: () => void }) {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#101b2b]">
      <motion.div
        key={`landscape-${tripId}-${direction}`}
        initial={{ x: reducedMotion ? "0%" : direction > 0 ? "0%" : "-48%" }}
        animate={{ x: reducedMotion ? "0%" : direction > 0 ? "-48%" : "0%" }}
        transition={{ duration, ease: reducedMotion ? "linear" : [0.42, 0, 0.35, 1] }}
        onAnimationComplete={onComplete}
        className="absolute -inset-y-[5%] left-0 w-[205%] transform-gpu bg-repeat-x opacity-65"
        style={{
          backgroundImage: "url('/portfolio-bg.webp')",
          backgroundPosition: "center",
          backgroundSize: "50% 100%",
        }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(12,22,38,0.22),rgba(242,217,156,0.08),rgba(12,22,38,0.48))]" />
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#0c1626]/90 to-transparent" />
      {!reducedMotion && (
        <motion.div
          initial={{ x: direction > 0 ? "120%" : "-30%" }}
          animate={{ x: direction > 0 ? "-30%" : "120%" }}
          transition={{ duration: Math.max(0.55, duration * 0.68), ease: "linear" }}
          className="absolute inset-y-0 w-1/4 skew-x-[-10deg] bg-gradient-to-r from-transparent via-[#f2d99c]/14 to-transparent transform-gpu"
        />
      )}
    </div>
  );
}

function StationPlatform({ station, phase, onExplore }: { station: TrainStation; phase: JourneyPhase; onExplore: () => void }) {
  const canExplore = phase === "platform";

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#132033] text-[#f4efe6]">
      <div
        className="absolute inset-0 opacity-45 [background-image:linear-gradient(rgba(255,255,255,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.055)_1px,transparent_1px)] [background-size:34px_34px]"
        aria-hidden="true"
      />
      <div className="absolute inset-x-0 top-0 h-2" style={{ backgroundColor: station.accent }} />
      <div className="absolute left-[8%] top-[15%] h-px w-[22%] bg-white/25" aria-hidden="true" />
      <div className="absolute right-[8%] top-[15%] h-px w-[22%] bg-white/25" aria-hidden="true" />
      <div className="absolute bottom-[8%] left-[7%] h-16 w-2 bg-[#f2d99c]/80" aria-hidden="true" />
      <div className="absolute bottom-[8%] right-[7%] h-16 w-2 bg-[#f2d99c]/80" aria-hidden="true" />

      <div className="absolute inset-x-[6%] bottom-[10%] top-[9%] flex flex-col items-center justify-center border border-white/16 bg-[#18263a]/88 px-5 text-center shadow-[0_24px_80px_rgba(0,0,0,0.32)] sm:inset-x-[15%] sm:px-10">
        <div className="absolute inset-x-0 top-0 flex h-10 items-center justify-between border-b border-white/12 px-4 font-mono text-[10px] uppercase tracking-[0.16em] text-white/65">
          <span>{station.code}</span>
          <span>{station.platform}</span>
        </div>
        <span className="mt-8 font-mono text-[10px] uppercase tracking-[0.22em]" style={{ color: station.accent }}>
          Night Shift stop {station.code.slice(-2)}
        </span>
        <h2 className="mt-3 font-display text-[clamp(2.5rem,7vw,6rem)] font-semibold uppercase leading-[0.8] tracking-[-0.065em]">{station.name}</h2>
        <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.16em] text-white/65 sm:text-xs">Mission: {station.objective}</p>
        <p className="mt-4 hidden max-w-lg text-sm leading-6 text-white/68 sm:block">{station.tagline}</p>
        <AnimatePresence mode="wait">
          {canExplore && (
            <motion.button
              key={station.id}
              type="button"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              onClick={onExplore}
              className="game-platform-explore group mt-5 inline-flex min-h-11 items-center gap-3 rounded-sm px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.13em] text-white shadow-[0_8px_24px_rgba(0,0,0,0.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f2d99c] focus-visible:ring-offset-3 focus-visible:ring-offset-[#18263a]"
              style={{ backgroundColor: station.accent }}
            >
              Clear this stop <span className="font-mono text-[10px] opacity-80">+{station.xp} XP</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function TrainDoor({ side, state, reducedMotion, onDoorAnimationComplete }: { side: "left" | "right"; state: JourneyState; reducedMotion: boolean; onDoorAnimationComplete: () => void }) {
  const doorsClosed = state.phase === "boarding" || state.phase === "departing" || state.phase === "traveling";
  const openX = side === "left" ? "-94%" : "94%";
  const panelClass = "absolute bg-[#d9d3c7] shadow-[inset_0_0_0_1px_rgba(24,24,22,0.15)]";

  return (
    <motion.div
      initial={false}
      animate={{ x: doorsClosed ? "0%" : openX }}
      transition={{ duration: reducedMotion ? 0.01 : 0.28, ease: [0.4, 0, 0.2, 1] }}
      onAnimationComplete={onDoorAnimationComplete}
      className={`pointer-events-none absolute inset-y-0 z-20 w-1/2 transform-gpu border-black/30 ${side === "left" ? "left-0 border-r" : "right-0 border-l"}`}
      aria-hidden="true"
    >
      <div className={`${panelClass} inset-x-0 top-0 h-[16%]`} />
      <div className={`${panelClass} inset-x-0 bottom-0 h-[24%]`} />
      <div className={`${panelClass} bottom-[24%] left-0 top-[16%] w-[12%]`} />
      <div className={`${panelClass} bottom-[24%] right-0 top-[16%] w-[12%]`} />
      <div className="absolute inset-x-[12%] bottom-[24%] top-[16%] border-4 border-[#77746e] bg-[#dbe4eb]/[0.06] shadow-[inset_0_0_24px_rgba(0,0,0,0.18)] sm:border-[6px]" />
      <div className={`absolute top-1/2 h-16 w-1.5 -translate-y-1/2 bg-[#a88243] ${side === "left" ? "right-5" : "left-5"}`} />
      <div className="absolute inset-x-[10%] bottom-[7%] flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.12em] text-black/55">
        <span>Door {side === "left" ? "A" : "B"}</span>
        <span>Stand clear</span>
      </div>
    </motion.div>
  );
}

function PaperTicket({ visited, xp }: { visited: Set<StationId>; xp: number }) {
  const complete = visited.size === trainStations.length;

  return (
    <div className="relative w-full overflow-hidden bg-[#f1e8d8] p-5 text-[#181816] shadow-[0_26px_70px_rgba(0,0,0,0.32)] [clip-path:polygon(0_0,100%_0,100%_42%,97%_45%,100%_48%,100%_100%,0_100%,0_48%,3%_45%,0_42%)] sm:p-7">
      <div className="flex items-start justify-between border-b border-dashed border-black/25 pb-5">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#b63725]">Night operator pass</p>
          <h3 className="mt-2 font-display text-3xl font-semibold uppercase tracking-[-0.04em]">Rafael Line</h3>
        </div>
        <div className="text-right font-mono text-[10px] uppercase leading-5 tracking-[0.12em] text-black/58">
          <p>REK / 2026</p>
          <p>07.7697° S</p>
        </div>
      </div>

      <div className="my-6 grid grid-cols-5 gap-2" aria-label={`${visited.size} of ${trainStations.length} stops cleared`}>
        {trainStations.map((station) => {
          const stamped = visited.has(station.id);
          return (
            <div key={station.id} className="text-center">
              <motion.div
                initial={false}
                animate={{ scale: stamped ? 1 : 0.9, rotate: stamped ? -4 : 0 }}
                className={`mx-auto flex aspect-square max-w-14 items-center justify-center rounded-full border-2 border-dashed ${stamped ? "text-white" : "border-black/22 text-black/36"}`}
                style={stamped ? { backgroundColor: station.accent, borderColor: station.accent } : undefined}
                aria-label={`${station.name}: ${stamped ? "cleared" : "not cleared"}`}
              >
                {stamped ? <Check className="h-4 w-4" /> : <span className="font-mono text-[10px]">{station.code.slice(-2)}</span>}
              </motion.div>
              <span className="mt-2 hidden font-mono text-[9px] uppercase tracking-[0.08em] text-black/60 sm:block">{station.name}</span>
            </div>
          );
        })}
      </div>

      <div className="flex items-end justify-between gap-5 border-t border-dashed border-black/25 pt-5">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-black/55">Signal score</p>
          <p className="mt-1 font-display text-lg font-semibold uppercase">{complete ? "Route certified" : `${xp} / ${TOTAL_XP} XP`}</p>
        </div>
        <div className="text-right">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-black/55">Stops</p>
          <p className="mt-1 font-display text-lg font-semibold">
            {visited.size} / {trainStations.length}
          </p>
        </div>
      </div>
    </div>
  );
}

export function GamifiedPortfolio({ projects, certifications, whatsappLink, emailAddress, onExit, onEnterArchive }: GamifiedPortfolioProps) {
  const reducedMotion = useReducedMotion() ?? false;
  const rootRef = useRef<HTMLDivElement>(null);
  const ticketButtonRef = useRef<HTMLButtonElement>(null);
  const primaryActionRef = useRef<HTMLButtonElement>(null);
  const boardingButtonRef = useRef<HTMLButtonElement>(null);
  const stationReturnRef = useRef<HTMLButtonElement>(null);
  const swipeStartXRef = useRef<number | null>(null);
  const completionQueuedRef = useRef(false);
  const [state, dispatch] = useReducer(journeyReducer, initialJourney);
  const [showTicket, setShowTicket] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const [stampEarned, setStampEarned] = useState<TrainStation | null>(null);
  const [visited, setVisited] = useState<Set<StationId>>(() => {
    if (typeof window === "undefined") return new Set();
    try {
      const stored = JSON.parse(window.sessionStorage.getItem("rafael-line-stamps") ?? "[]") as StationId[];
      return new Set(stored.filter((id) => trainStations.some((station) => station.id === id)));
    } catch {
      return new Set();
    }
  });

  const currentStation = trainStations[state.currentIndex];
  const selectedStation = trainStations[state.selectedIndex];
  const distance = Math.abs(state.selectedIndex - state.currentIndex);
  const travelDuration = reducedMotion ? 0.08 : 0.82 + Math.min(distance, 3) * 0.08;
  const journeyLocked = state.phase !== "platform";
  const xp = useMemo(() => trainStations.reduce((score, station) => score + (visited.has(station.id) ? station.xp : 0), 0), [visited]);
  const rank = xp === TOTAL_XP ? "Line Master" : xp >= 40 ? "Signal Operator" : "Observer";
  const overlayOpen = showTicket || showCompletion;
  const baseInert = state.phase === "exploring" || overlayOpen;

  const selectStation = useCallback((index: number) => dispatch({ type: "SELECT", index }), []);

  const markVisited = useCallback((station: TrainStation) => {
    setVisited((current) => {
      if (current.has(station.id)) return current;
      const next = new Set(current);
      next.add(station.id);
      try {
        window.sessionStorage.setItem("rafael-line-stamps", JSON.stringify(Array.from(next)));
      } catch {
        // Progress remains available in memory when storage is unavailable.
      }
      return next;
    });
    setStampEarned(station);
  }, []);

  const exploreCurrentStation = useCallback(() => {
    if (state.phase !== "platform" || state.currentIndex !== state.selectedIndex) return;
    if (!visited.has(currentStation.id)) markVisited(currentStation);
    dispatch({ type: "EXPLORE" });
    window.performance?.mark?.("rafael-line-station-open");
  }, [currentStation, markVisited, state.currentIndex, state.phase, state.selectedIndex, visited]);

  const primaryAction = useCallback(() => {
    if (state.phase !== "platform") return;
    if (state.selectedIndex === state.currentIndex) {
      exploreCurrentStation();
      return;
    }
    window.performance?.mark?.("rafael-line-trip-start");
    dispatch({ type: "DEPART" });
  }, [exploreCurrentStation, state.currentIndex, state.phase, state.selectedIndex]);

  const moveSelection = useCallback(
    (step: 1 | -1) => {
      if (state.phase !== "platform") return;
      selectStation(Math.min(trainStations.length - 1, Math.max(0, state.selectedIndex + step)));
    },
    [selectStation, state.phase, state.selectedIndex],
  );

  const closeTicket = useCallback(() => {
    setShowTicket(false);
    window.requestAnimationFrame(() => ticketButtonRef.current?.focus());
  }, []);

  const returnToTrain = useCallback(() => {
    dispatch({ type: "RETURN_TO_TRAIN" });
    window.requestAnimationFrame(() => primaryActionRef.current?.focus());
  }, []);

  const closeCompletion = useCallback(() => {
    setShowCompletion(false);
    window.requestAnimationFrame(() => {
      if (state.phase === "exploring") stationReturnRef.current?.focus();
      else if (state.phase === "boarding") boardingButtonRef.current?.focus();
      else primaryActionRef.current?.focus();
    });
  }, [state.phase]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusFrame = window.requestAnimationFrame(() => rootRef.current?.focus());

    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    if (!stampEarned) return;
    const toastTimer = window.setTimeout(() => setStampEarned(null), reducedMotion ? 1800 : 2400);
    return () => window.clearTimeout(toastTimer);
  }, [reducedMotion, stampEarned]);

  useEffect(() => {
    if (visited.size !== trainStations.length || completionQueuedRef.current) return;

    try {
      if (window.sessionStorage.getItem("rafael-line-completion-seen") === "true") {
        completionQueuedRef.current = true;
        return;
      }
    } catch {
      // The completion moment still works without storage.
    }

    const completionTimer = window.setTimeout(
      () => {
        completionQueuedRef.current = true;
        setShowCompletion(true);
        try {
          window.sessionStorage.setItem("rafael-line-completion-seen", "true");
        } catch {
          // No persistent acknowledgement when storage is unavailable.
        }
      },
      reducedMotion ? 0 : 650,
    );

    return () => window.clearTimeout(completionTimer);
  }, [reducedMotion, visited.size]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Tab") {
      const focusable = Array.from(rootRef.current?.querySelectorAll<HTMLElement>("button:not([disabled]), a[href]") ?? []).filter((element) => element.offsetParent !== null && !element.closest("[inert]"));
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      if (showTicket) closeTicket();
      else if (showCompletion) closeCompletion();
      else if (state.phase === "exploring") returnToTrain();
      else onExit();
      return;
    }

    const target = event.target as HTMLElement;
    if (target.closest("button, a, input, select, textarea")) return;
    if (overlayOpen || state.phase === "exploring") return;

    if (event.key === "ArrowRight") {
      event.preventDefault();
      moveSelection(1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      moveSelection(-1);
    } else if (event.key === "Home" && state.phase === "platform") {
      event.preventDefault();
      selectStation(0);
    } else if (event.key === "End" && state.phase === "platform") {
      event.preventDefault();
      selectStation(trainStations.length - 1);
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (state.phase === "boarding") dispatch({ type: "BOARD" });
      else primaryAction();
    }
  };

  const statusCopy = useMemo(() => {
    switch (state.phase) {
      case "boarding":
        return "Operator pass ready";
      case "departing":
        return "Doors closing";
      case "traveling":
        return `En route to ${selectedStation.name}`;
      case "arriving":
        return `Arrived at ${currentStation.name}`;
      case "exploring":
        return `Clearing ${currentStation.name}`;
      case "platform":
        return state.selectedIndex === state.currentIndex ? `Standing at ${currentStation.name}` : `${selectedStation.name} selected`;
    }
  }, [currentStation.name, selectedStation.name, state.currentIndex, state.phase, state.selectedIndex]);

  return (
    <motion.div
      ref={rootRef}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-label="Rafael Line Night Shift interactive portfolio"
      onKeyDown={handleKeyDown}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reducedMotion ? 0 : 0.22 }}
      className="fixed inset-0 z-[90] h-[100dvh] overflow-hidden bg-[#d8d2c5] text-[#181816] outline-none"
    >
      <div aria-hidden={baseInert || undefined} inert={baseInert || undefined}>
        <header className="game-shell-header absolute inset-x-0 top-0 z-[70] flex h-[4.25rem] items-center border-b border-white/10 bg-[#111b2b] px-3 text-[#f4efe6] sm:px-6">
          <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm bg-[#d94b35] font-mono text-xs font-bold tracking-[-0.04em] text-white shadow-[0_0_0_1px_rgba(255,255,255,0.15)]">REK</span>
              <div className="min-w-0">
                <p className="truncate font-display text-sm font-semibold uppercase tracking-[0.03em] sm:text-base">
                  Rafael Line <span className="text-[#f2d99c]">Night Shift</span>
                </p>
                <p className="mt-0.5 hidden font-mono text-[10px] uppercase tracking-[0.14em] text-white/58 sm:block">Operator session / Yogyakarta / 07.7697° S</p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <div className="hidden w-52 lg:block">
                <div className="mb-1 flex items-center justify-between gap-3 font-mono text-[10px] uppercase tracking-[0.12em] text-white/62">
                  <span>{rank}</span>
                  <span>
                    {xp}/{TOTAL_XP} XP
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-white/12">
                  <motion.div className="h-full origin-left rounded-full bg-[#f2d99c]" initial={false} animate={{ scaleX: xp / TOTAL_XP }} />
                </div>
              </div>
              <button
                ref={ticketButtonRef}
                type="button"
                onClick={() => setShowTicket(true)}
                aria-label={`Open journey pass, ${visited.size} of ${trainStations.length} stops cleared`}
                className="flex h-10 items-center gap-2 rounded-sm border border-white/18 px-3 font-mono text-[10px] uppercase tracking-[0.12em] transition-colors hover:bg-white/8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f2d99c]"
              >
                <Ticket className="h-4 w-4 text-[#f2d99c]" />
                <span className="hidden sm:inline">Pass</span>
                <span>
                  {visited.size}/{trainStations.length}
                </span>
              </button>
              <button
                type="button"
                role="switch"
                aria-checked="true"
                aria-label="Exit Night Shift mode"
                onClick={onExit}
                className="flex h-10 items-center gap-2 rounded-sm border border-white/18 px-3 text-[10px] font-semibold uppercase tracking-[0.12em] transition-colors hover:bg-white/8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d94b35]"
              >
                <Gamepad2 className="h-4 w-4 text-[#d94b35]" />
                <span className="hidden lg:inline">Exit mode</span>
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </header>

        <RouteStrip state={state} visited={visited} reducedMotion={reducedMotion} onSelect={selectStation} />

        <main
          className="game-stage absolute inset-x-0 bottom-[7rem] top-[10.25rem] z-10 px-3 py-3 sm:bottom-[7.45rem] sm:px-6 sm:py-4"
          onPointerDown={(event) => {
            if (event.pointerType === "touch" && state.phase === "platform") swipeStartXRef.current = event.clientX;
          }}
          onPointerUp={(event) => {
            if (event.pointerType !== "touch" || swipeStartXRef.current === null || state.phase !== "platform") return;
            const distanceX = event.clientX - swipeStartXRef.current;
            swipeStartXRef.current = null;
            if (Math.abs(distanceX) < 48) return;
            moveSelection(distanceX < 0 ? 1 : -1);
          }}
        >
          <div className="relative mx-auto h-full max-w-7xl overflow-hidden rounded-[3px] border-[6px] border-[#303640] bg-[#101b2b] shadow-[0_18px_46px_rgba(24,24,22,0.24)] [contain:layout_paint] sm:border-[9px]">
            <div className="absolute inset-x-0 top-0 z-30 flex h-9 items-center justify-between border-b border-black/30 bg-[#c9c5bc] px-4 font-mono text-[10px] uppercase tracking-[0.12em] text-black/58">
              <span>Cab REK-26</span>
              <span className="flex items-center gap-1.5">
                <MapPin className="h-3 w-3" /> Yogyakarta
              </span>
              <span className="hidden sm:inline">Signal desk online</span>
            </div>

            <div className="absolute inset-x-0 bottom-0 top-9">
              {state.phase === "traveling" ? (
                <MovingView
                  direction={state.direction}
                  tripId={state.tripId}
                  duration={travelDuration}
                  reducedMotion={reducedMotion}
                  onComplete={() => {
                    window.performance?.mark?.("rafael-line-arrival");
                    dispatch({ type: "REACHED_DESTINATION" });
                  }}
                />
              ) : (
                <StationPlatform station={currentStation} phase={state.phase} onExplore={exploreCurrentStation} />
              )}

              <TrainDoor side="left" state={state} reducedMotion={reducedMotion} onDoorAnimationComplete={() => undefined} />
              <TrainDoor
                side="right"
                state={state}
                reducedMotion={reducedMotion}
                onDoorAnimationComplete={() => {
                  if (state.phase === "departing") dispatch({ type: "DOORS_CLOSED" });
                  else if (state.phase === "arriving") dispatch({ type: "DOORS_OPEN" });
                }}
              />

              <div className="pointer-events-none absolute inset-x-0 top-0 z-40 flex h-8 items-center justify-center bg-[#252c35] px-3 font-mono text-[10px] uppercase tracking-[0.14em] text-[#f2d99c]">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span key={statusCopy} initial={{ opacity: 0, y: 3 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -3 }} transition={{ duration: reducedMotion ? 0 : 0.14 }}>
                    {statusCopy}
                  </motion.span>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </main>

        <div className="game-controls absolute inset-x-0 bottom-0 z-50 min-h-[7rem] border-t border-[#192234]/18 bg-[#ece4d6] px-3 pb-[max(0.7rem,env(safe-area-inset-bottom))] pt-3 sm:min-h-[7.45rem] sm:px-6 sm:py-3.5">
          <div className="mx-auto grid max-w-7xl grid-cols-[3rem_1fr_3rem] items-center gap-2 sm:grid-cols-[auto_1fr_auto] sm:gap-5">
            <button
              type="button"
              disabled={journeyLocked || state.selectedIndex === 0}
              onClick={() => moveSelection(-1)}
              aria-label="Select previous stop"
              className="flex h-12 items-center justify-center rounded-sm border border-black/18 px-3 text-[10px] font-semibold uppercase tracking-[0.12em] transition-colors hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d94b35] sm:gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Previous</span>
            </button>

            <div className="grid min-w-0 items-center gap-3 sm:grid-cols-[1fr_auto]">
              <div data-destination className="hidden min-w-0 sm:block">
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-black/55">Selected destination</p>
                <div className="mt-1 flex items-baseline gap-3">
                  <p className="truncate font-display text-xl font-semibold uppercase">{selectedStation.name}</p>
                  <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-black/55">{selectedStation.code}</span>
                </div>
              </div>
              <button
                ref={primaryActionRef}
                type="button"
                disabled={state.phase !== "platform"}
                onClick={primaryAction}
                className="game-primary group flex min-h-12 w-full items-center justify-center gap-3 rounded-sm bg-[#d94b35] px-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-white transition-[background-color,transform] hover:bg-[#bd3d2a] active:translate-y-px disabled:cursor-wait disabled:bg-[#777873] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#192234] focus-visible:ring-offset-2 focus-visible:ring-offset-[#ece4d6] sm:min-w-56 sm:w-auto sm:text-[11px]"
              >
                {state.phase === "departing" && "Doors closing"}
                {state.phase === "traveling" && "Train in motion"}
                {state.phase === "arriving" && "Arriving now"}
                {state.phase === "boarding" && "Validate your pass first"}
                {state.phase === "platform" && (state.selectedIndex === state.currentIndex ? `Explore ${currentStation.name}` : `Depart for ${selectedStation.name}`)}
                {state.phase === "exploring" && "Stop in progress"}
                {state.phase === "platform" && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />}
              </button>
            </div>

            <button
              type="button"
              disabled={journeyLocked || state.selectedIndex === trainStations.length - 1}
              onClick={() => moveSelection(1)}
              aria-label="Select next stop"
              className="flex h-12 items-center justify-center rounded-sm border border-black/18 px-3 text-[10px] font-semibold uppercase tracking-[0.12em] transition-colors hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d94b35] sm:gap-2"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <div data-helper className="mx-auto mt-2 hidden max-w-7xl items-center justify-between font-mono text-[10px] uppercase tracking-[0.1em] text-black/52 lg:flex">
            <span className="flex items-center gap-2">
              <ArrowLeft className="h-3 w-3" /> Arrows select stops
            </span>
            <span>{currentStation.announcement}</span>
            <span className="flex items-center gap-2">
              Enter dispatches <ArrowRight className="h-3 w-3" />
            </span>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {state.phase === "boarding" && (
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: reducedMotion ? 0 : -14 }}
            transition={{ duration: reducedMotion ? 0 : 0.26 }}
            className="game-boarding absolute inset-x-0 bottom-0 top-[4.25rem] z-[65] flex items-center justify-center overflow-y-auto bg-[#111d30] px-4 py-7"
          >
            <div className="grid w-full max-w-6xl items-center gap-8 md:grid-cols-[1.08fr_0.82fr]">
              <div className="text-[#f4efe6]">
                <div className="inline-flex items-center gap-2 rounded-sm border border-[#f2d99c]/30 bg-[#f2d99c]/8 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.16em] text-[#f2d99c]">
                  <span className="h-2 w-2 rounded-full bg-[#d94b35]" /> Operator call 07.7697
                </div>
                <h2 className="mt-5 font-display text-[clamp(3.4rem,9vw,7.8rem)] font-semibold uppercase leading-[0.76] tracking-[-0.07em]">
                  Run the
                  <br />
                  <span className="text-[#d94b35]">Night Shift</span>
                </h2>
                <p className="mt-6 max-w-xl text-sm leading-7 text-white/70 sm:text-base">Take control of Rafael Line. Clear five stops, route real projects through the signal board, and certify the journey with 100 signal XP.</p>
                <div className="mt-6 grid max-w-xl gap-2 sm:grid-cols-3">
                  {[
                    ["01", "Choose a stop"],
                    ["02", "Dispatch the line"],
                    ["03", "Collect its stamp"],
                  ].map(([number, label]) => (
                    <div key={number} className="rounded-sm border border-white/14 bg-white/[0.035] p-3">
                      <span className="font-mono text-[10px] text-[#f2d99c]">{number}</span>
                      <span className="mt-2 block text-xs font-semibold uppercase tracking-[0.08em] text-white/74">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <PaperTicket visited={visited} xp={xp} />
                <button
                  ref={boardingButtonRef}
                  type="button"
                  aria-label="Validate pass and begin Night Shift"
                  autoFocus
                  onClick={() => dispatch({ type: "BOARD" })}
                  className="group mt-4 flex min-h-14 w-full items-center justify-between rounded-sm bg-[#d94b35] px-5 text-xs font-semibold uppercase tracking-[0.15em] text-white transition-colors hover:bg-[#bd3d2a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f2d99c] focus-visible:ring-offset-3 focus-visible:ring-offset-[#111d30]"
                >
                  Validate pass &amp; begin{" "}
                  <span className="flex items-center gap-2">
                    <TrainFront className="h-5 w-5" />
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </button>
                <p className="mt-3 text-center font-mono text-[10px] uppercase tracking-[0.1em] text-white/52">No sound · Keyboard ready · Progress saved for this session</p>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {state.phase === "exploring" && !overlayOpen && (
          <motion.section
            role="region"
            aria-labelledby={`train-station-${currentStation.id}`}
            initial={{ opacity: 0, y: reducedMotion ? 0 : "5%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reducedMotion ? 0 : "3%" }}
            transition={{ duration: reducedMotion ? 0 : 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="game-exploring absolute inset-x-0 bottom-0 top-[4.25rem] z-[60] flex flex-col overflow-hidden bg-[#eee8dc]"
          >
            <div className="flex min-h-14 shrink-0 items-center justify-between gap-3 border-b border-black/15 bg-[#ded7ca] px-4 py-2 sm:px-6">
              <div className="flex min-w-0 items-center gap-3">
                <span className="h-7 w-2 shrink-0 rounded-sm" style={{ backgroundColor: currentStation.accent }} />
                <div className="min-w-0">
                  <p className="truncate font-display text-sm font-semibold uppercase sm:text-base">{currentStation.name}</p>
                  <p className="mt-0.5 hidden font-mono text-[10px] uppercase tracking-[0.12em] text-black/58 sm:block">Mission: {currentStation.objective}</p>
                </div>
              </div>
              <button
                ref={stationReturnRef}
                type="button"
                autoFocus
                onClick={returnToTrain}
                aria-label={`Continue the journey from ${currentStation.name}`}
                className="flex h-10 shrink-0 items-center gap-2 rounded-sm border border-black/18 px-3 text-[10px] font-semibold uppercase tracking-[0.11em] transition-colors hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d94b35]"
              >
                <TrainFront className="h-4 w-4" />
                <span className="hidden sm:inline">Continue journey</span>
                <ArrowRight className="h-3.5 w-3.5 sm:hidden" />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-7 [touch-action:pan-y] sm:px-7 md:px-10 md:py-9">
              <div className="mx-auto max-w-7xl">
                <StationContent station={currentStation} projects={projects} certifications={certifications} whatsappLink={whatsappLink} emailAddress={emailAddress} onEnterArchive={onEnterArchive} />
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {stampEarned && !showCompletion && (
          <motion.div
            role="status"
            initial={{ opacity: 0, y: reducedMotion ? 0 : 16, scale: reducedMotion ? 1 : 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: reducedMotion ? 0 : -8 }}
            className="pointer-events-none absolute bottom-5 left-1/2 z-[78] flex w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 items-center gap-3 rounded-sm border border-white/12 bg-[#111d30] p-3 text-[#f4efe6] shadow-[0_18px_50px_rgba(0,0,0,0.3)] sm:bottom-7"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white" style={{ backgroundColor: stampEarned.accent }}>
              <Check className="h-5 w-5" />
            </span>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.13em] text-[#f2d99c]">Stamp secured · +{stampEarned.xp} XP</p>
              <p className="mt-1 font-display text-base font-semibold">{stampEarned.name} cleared</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showTicket && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Journey pass"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[85] flex items-center justify-center overflow-y-auto bg-[#0b1320]/90 p-4 py-8"
          >
            <motion.div initial={{ y: reducedMotion ? 0 : 20, scale: reducedMotion ? 1 : 0.98 }} animate={{ y: 0, scale: 1 }} exit={{ y: reducedMotion ? 0 : 16, opacity: 0 }} className="w-full max-w-xl">
              <div className="mb-3 flex items-center justify-between text-white">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#f2d99c]">Current rank</p>
                  <p className="mt-1 font-display text-xl font-semibold">{rank}</p>
                </div>
                <button
                  type="button"
                  autoFocus
                  onClick={closeTicket}
                  aria-label="Close journey pass"
                  className="flex h-10 items-center gap-2 rounded-sm border border-white/20 px-3 text-[10px] font-semibold uppercase tracking-[0.12em] hover:bg-white/8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f2d99c]"
                >
                  Close <X className="h-4 w-4" />
                </button>
              </div>
              <PaperTicket visited={visited} xp={xp} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCompletion && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="route-complete-title"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[88] flex items-center justify-center overflow-y-auto bg-[#0b1320]/94 p-4 py-8"
          >
            <motion.div
              initial={{ y: reducedMotion ? 0 : 24, scale: reducedMotion ? 1 : 0.96 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: reducedMotion ? 0 : 18, opacity: 0 }}
              className="relative w-full max-w-2xl overflow-hidden rounded-sm border border-[#f2d99c]/35 bg-[#17253a] p-6 text-center text-[#f4efe6] shadow-[0_30px_90px_rgba(0,0,0,0.42)] sm:p-10"
            >
              <div
                className="absolute inset-0 opacity-35 [background-image:linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:28px_28px]"
                aria-hidden="true"
              />
              <div className="relative">
                <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#f2d99c] text-[#17253a] shadow-[0_0_0_8px_rgba(242,217,156,0.08)]">
                  <Trophy className="h-7 w-7" />
                </span>
                <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.2em] text-[#f2d99c]">Operator achievement unlocked</p>
                <h2 id="route-complete-title" className="mt-3 font-display text-[clamp(2.7rem,8vw,5.5rem)] font-semibold uppercase leading-[0.82] tracking-[-0.055em]">
                  Route
                  <br />
                  certified.
                </h2>
                <p className="mx-auto mt-5 max-w-md text-sm leading-7 text-white/70 sm:text-base">You cleared every stop, inspected Rafael&apos;s operating system, and earned all {TOTAL_XP} signal XP.</p>
                <div className="mx-auto mt-7 grid max-w-md grid-cols-3 border-y border-white/14 py-4">
                  <div>
                    <strong className="block font-display text-2xl">05</strong>
                    <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-white/58">Stops</span>
                  </div>
                  <div className="border-x border-white/14">
                    <strong className="block font-display text-2xl">{TOTAL_XP}</strong>
                    <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-white/58">Signal XP</span>
                  </div>
                  <div>
                    <strong className="block font-display text-2xl">A</strong>
                    <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-white/58">Rank</span>
                  </div>
                </div>
                <button
                  type="button"
                  autoFocus
                  onClick={closeCompletion}
                  className="group mx-auto mt-7 inline-flex min-h-12 items-center gap-3 rounded-sm bg-[#d94b35] px-6 text-[11px] font-semibold uppercase tracking-[0.13em] text-white hover:bg-[#bd3d2a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f2d99c] focus-visible:ring-offset-3 focus-visible:ring-offset-[#17253a]"
                >
                  Continue as Line Master <Sparkles className="h-4 w-4 transition-transform group-hover:rotate-12" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="pointer-events-none absolute left-0 top-1/2 z-[75] hidden -translate-y-1/2 xl:block" aria-hidden="true">
        <div className="flex items-center gap-2 bg-[#f2d99c] px-2 py-4 text-[#17253a] [writing-mode:vertical-rl]">
          <Zap className="h-3.5 w-3.5" />
          <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em]">Signal live</span>
        </div>
      </div>

      <p className="sr-only" aria-live="polite">
        {statusCopy}. {state.phase === "platform" ? currentStation.announcement : ""}
      </p>
    </motion.div>
  );
}
