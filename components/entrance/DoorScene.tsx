"use client";

import { type MotionValue, motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { useState } from "react";

interface DoorSceneProps {
  status: "CLOSED" | "OPENING";
  onOpen: () => void;
}

export const DOOR_OPEN_MS = 1300;

const SLIDE_EASE = [0.76, 0, 0.24, 1] as const;
const RISE_EASE = [0.22, 1, 0.36, 1] as const;

const WASHI_GRAIN =
  "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.72' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.8'/%3E%3C/svg%3E\")";

const LATTICE_BARS =
  "linear-gradient(to left, var(--lattice) 2px, transparent 2px), linear-gradient(to bottom, var(--lattice) 2px, transparent 2px)";

interface PanelProps {
  side: "left" | "right";
  status: DoorSceneProps["status"];
  ajar: boolean;
  sunX: MotionValue<number>;
  sunY: MotionValue<number>;
  glowX: MotionValue<number>;
  glowY: MotionValue<number>;
}

function ShojiPanel({ side, status, ajar, sunX, sunY, glowX, glowY }: PanelProps) {
  const isLeft = side === "left";
  const direction = isLeft ? -1 : 1;
  // Each panel holds one half of the same sun, so its centre sits exactly on the seam.
  const seam = isLeft ? "left-full" : "left-0";

  return (
    <motion.div
      initial={false}
      animate={
        status === "OPENING"
          ? { x: [null, `${direction * 0.7}vw`, `${direction * 0.45}vw`, `${direction * 52}vw`] }
          : { x: ajar ? `${direction * 0.35}vw` : "0vw" }
      }
      transition={
        status === "OPENING"
          ? { duration: DOOR_OPEN_MS / 1000, times: [0, 0.1, 0.17, 1], ease: ["easeOut", "easeInOut", SLIDE_EASE] }
          : { duration: 0.5, ease: RISE_EASE }
      }
      className={`absolute inset-y-0 w-1/2 transform-gpu overflow-hidden bg-[var(--paper)] shadow-[0_0_50px_rgba(0,0,0,0.45)] will-change-transform ${isLeft ? "left-0" : "right-0"}`}
    >
      {/* The sun rises from behind the kick plate on load */}
      <motion.div style={{ x: sunX, y: sunY }} className={`absolute top-[43%] ${seam} h-0 w-0`}>
        <motion.div
          initial={{ y: "62%" }}
          animate={{ y: "0%" }}
          transition={{ duration: 1.8, ease: RISE_EASE }}
          className="absolute -left-[min(29vh,37vw)] -top-[min(29vh,37vw)] h-[min(58vh,74vw)] w-[min(58vh,74vw)] rounded-full bg-[#d94b35] shadow-[0_0_90px_24px_rgba(217,75,53,0.28)] blur-[1.5px]"
        />
      </motion.div>

      {/* A lamp carried behind the paper follows the pointer */}
      <motion.div style={{ x: glowX, y: glowY }} className={`pointer-events-none absolute top-1/2 ${seam} h-0 w-0`}>
        <div className="absolute -left-[32vmin] -top-[32vmin] h-[64vmin] w-[64vmin] rounded-full bg-[radial-gradient(circle,rgba(255,226,180,0.5),transparent_66%)] dark:bg-[radial-gradient(circle,rgba(255,190,120,0.2),transparent_66%)]" />
      </motion.div>

      <div className="pointer-events-none absolute inset-0 opacity-[0.1] mix-blend-multiply dark:opacity-[0.07] dark:mix-blend-screen" style={{ backgroundImage: WASHI_GRAIN }} />

      {/* Kumiko lattice, measured outwards from the seam so both halves mirror */}
      <div
        className="pointer-events-none absolute inset-0 [--cell:clamp(58px,10.5vmin,112px)]"
        style={{
          backgroundImage: LATTICE_BARS,
          backgroundSize: "var(--cell) var(--cell)",
          backgroundPosition: isLeft ? "right top" : "left top",
          transform: isLeft ? undefined : "scaleX(-1)",
        }}
      />

      {/* Kick plate */}
      <div className="absolute inset-x-0 bottom-0 h-[15%] border-t-[5px] border-[var(--lattice)] bg-[var(--plate)]" style={{ backgroundImage: "repeating-linear-gradient(to bottom, transparent 0 13px, rgba(255,255,255,0.035) 13px 14px)" }} />

      {/* Stiles: the heavy timber edges of the panel */}
      <div className={`absolute inset-y-0 w-1.5 bg-[var(--timber)] md:w-2 ${isLeft ? "right-0" : "left-0"}`} />
      <div className={`absolute inset-y-0 w-2.5 bg-[var(--timber)] md:w-3.5 ${isLeft ? "left-0" : "right-0"}`} />

      {/* Recessed pull */}
      <div className={`absolute top-[43%] flex h-11 w-7 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-[#0c0c0b] shadow-[inset_0_2px_6px_rgba(0,0,0,0.9)] md:h-14 md:w-8 ${isLeft ? "right-5 md:right-7" : "left-5 md:left-7"}`}>
        <span className="h-7 w-3 rounded-full bg-[#2a2622] shadow-[inset_0_2px_3px_rgba(0,0,0,0.9)] md:h-9 md:w-4" />
      </div>
    </motion.div>
  );
}

export function DoorScene({ status, onOpen }: DoorSceneProps) {
  const prefersReducedMotion = useReducedMotion();
  const isOpening = status === "OPENING";
  const [ajar, setAjar] = useState(false);

  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const sunX = useSpring(useTransform(pointerX, (value) => value * -0.025), { stiffness: 50, damping: 16 });
  const sunY = useSpring(useTransform(pointerY, (value) => value * -0.025), { stiffness: 50, damping: 16 });
  const glowX = useSpring(pointerX, { stiffness: 70, damping: 20 });
  const glowY = useSpring(pointerY, { stiffness: 70, damping: 20 });

  return (
    <motion.div
      animate={{ opacity: isOpening && prefersReducedMotion ? 0 : 1 }}
      transition={{ duration: 0.4 }}
      className={`absolute inset-0 overflow-hidden [--lattice:#181816] [--paper:#efe9da] [--timber:#181816] [--plate:#33231a] dark:[--plate:#1c1510] dark:[--lattice:#060605] dark:[--paper:#3a2a1c] dark:[--timber:#0f0e0c] ${isOpening ? "pointer-events-none" : ""}`}
    >
      {/* Light that spills in as the panels part */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={isOpening ? { opacity: [0, 0.85, 0], scale: [0.5, 1.1, 1.7] } : { opacity: 0 }}
        transition={{ duration: 1.25, delay: 0.2, ease: "easeOut" }}
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,236,205,0.95),rgba(217,75,53,0.14)_46%,transparent_70%)]"
      />

      {/* Everything inside this wrapper is the doorway: it grows as you step through it */}
      <motion.div
        animate={{ scale: isOpening ? 1.14 : 1 }}
        transition={{ duration: DOOR_OPEN_MS / 1000, ease: SLIDE_EASE }}
        className="absolute inset-0 transform-gpu will-change-transform"
      >
        <div className="absolute inset-x-0 bottom-[clamp(62px,10vh,84px)] top-[clamp(58px,9vh,76px)]">
          {/* Warm light that leaks through the seam when the panels sit ajar */}
          <motion.div animate={{ opacity: isOpening ? 0 : 1 }} transition={{ duration: 0.25, delay: isOpening ? 0.2 : 0 }} className="absolute inset-y-0 left-1/2 w-[3vw] -translate-x-1/2 bg-[#ffe9c9]" />
          <ShojiPanel side="left" status={status} ajar={ajar} sunX={sunX} sunY={sunY} glowX={glowX} glowY={glowY} />
          <ShojiPanel side="right" status={status} ajar={ajar} sunX={sunX} sunY={sunY} glowX={glowX} glowY={glowY} />
        </div>

        {/* Lintel */}
        <motion.div
          initial={false}
          animate={{ y: isOpening ? "-110%" : "0%" }}
          transition={{ duration: 0.8, delay: isOpening ? 0.3 : 0, ease: SLIDE_EASE }}
          className="absolute inset-x-0 top-0 flex h-[clamp(58px,9vh,76px)] items-center justify-between border-b border-white/10 bg-[var(--timber)] px-4 text-[#eeeae0] shadow-[0_8px_24px_rgba(0,0,0,0.35)] sm:px-7"
        >
          <span className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center bg-[#d94b35] text-sm font-bold text-white">礼</span>
            <span className="leading-none">
              <span className="block font-display text-sm font-semibold tracking-tight">RAFAEL EVAN KRISTANTO</span>
              <span className="mt-1 block font-mono text-[8px] uppercase tracking-[0.24em] opacity-50">Full-Stack Developer</span>
            </span>
          </span>
          <span className="hidden font-mono text-[10px] uppercase tracking-[0.28em] opacity-60 sm:block">Yogyakarta · Indonesia</span>
        </motion.div>

        {/* Sill */}
        <motion.div
          initial={false}
          animate={{ y: isOpening ? "110%" : "0%" }}
          transition={{ duration: 0.8, delay: isOpening ? 0.3 : 0, ease: SLIDE_EASE }}
          className="absolute inset-x-0 bottom-0 flex h-[clamp(62px,10vh,84px)] items-center justify-center border-t border-white/10 bg-[var(--timber)] px-4 text-[#eeeae0] sm:justify-between sm:px-7"
        >
          <span className="hidden font-mono text-[10px] uppercase tracking-[0.28em] opacity-60 sm:block">入口 / Entrance</span>
          <motion.span
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.6 }}
            className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em]"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inset-0 animate-ping rounded-full bg-[#d94b35] opacity-75 motion-reduce:hidden" />
              <span className="relative h-2 w-2 rounded-full bg-[#d94b35]" />
            </span>
            <span className="hidden sm:inline">Click or scroll to enter</span>
            <span className="sm:hidden">Tap or swipe to enter</span>
          </motion.span>
          <span className="hidden font-mono text-[10px] uppercase tracking-[0.28em] opacity-60 sm:block">Portfolio 2026</span>
        </motion.div>
      </motion.div>

      <button
        id="entrance-door"
        type="button"
        aria-label="Slide the door open and enter the portfolio"
        onClick={onOpen}
        onPointerEnter={(event) => {
          if (event.pointerType !== "touch") setAjar(true);
        }}
        onPointerLeave={() => setAjar(false)}
        onPointerMove={(event) => {
          if (event.pointerType === "touch") return;
          pointerX.set(event.clientX - window.innerWidth / 2);
          pointerY.set(event.clientY - window.innerHeight / 2);
        }}
        onFocus={() => setAjar(true)}
        onBlur={() => setAjar(false)}
        className="absolute inset-0 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#d94b35]"
      />
    </motion.div>
  );
}
