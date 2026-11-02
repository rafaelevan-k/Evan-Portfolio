"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { DOOR_OPEN_MS, DoorScene } from "./DoorScene";

type EntranceState = "CLOSED" | "OPENING" | "ENTERED";

// How far into the door's slide the page behind starts animating in
const REVEAL_DELAY_MS = 380;

const subscribeToNothing = () => () => {};
const readEntered = () => document.documentElement.dataset.entered === "true";
const readEnteredOnServer = () => false;

interface EntranceProps {
  onReveal: () => void;
}

// The door is server-rendered so it is the first thing painted. The inline script in
// app/layout.tsx sets data-entered before paint, which hides it for returning visitors.
export function Entrance({ onReveal }: EntranceProps) {
  const alreadyEntered = useSyncExternalStore(subscribeToNothing, readEntered, readEnteredOnServer);
  const [state, setState] = useState<EntranceState>("CLOSED");

  const open = useCallback(() => {
    setState((current) => (current === "CLOSED" ? "OPENING" : current));
  }, []);

  useEffect(() => {
    if (alreadyEntered) onReveal();
  }, [alreadyEntered, onReveal]);

  // Anything that means "let me in" opens the door, so it can never feel like a dead end.
  // Scrolling stays swallowed while the panels slide, so the page isn't left scrolled past the hero.
  useEffect(() => {
    if (alreadyEntered || state === "ENTERED") return;

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      if (event.deltaY > 0) open();
    };
    const handleTouchMove = (event: TouchEvent) => {
      if (event.cancelable) event.preventDefault();
      open();
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Tab") {
        event.preventDefault();
        document.getElementById("entrance-door")?.focus();
      } else if (event.key === "Enter" || event.key === " " || event.key === "ArrowDown" || event.key === "PageDown") {
        event.preventDefault();
        open();
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [alreadyEntered, open, state]);

  useEffect(() => {
    if (state !== "OPENING") return;

    try {
      sessionStorage.setItem("hasVisitedPortfolio", "true");
    } catch {
      // Storage can be blocked; the door simply shows again on the next load.
    }

    const revealTimer = window.setTimeout(onReveal, REVEAL_DELAY_MS);
    const finishTimer = window.setTimeout(() => {
      document.documentElement.dataset.entered = "true";
      setState("ENTERED");
    }, DOOR_OPEN_MS);

    return () => {
      window.clearTimeout(revealTimer);
      window.clearTimeout(finishTimer);
    };
  }, [onReveal, state]);

  if (alreadyEntered || state === "ENTERED") return null;

  return (
    <div data-entrance={state === "CLOSED" ? "closed" : "opening"} className="fixed inset-0 z-[9999]">
      <DoorScene status={state === "CLOSED" ? "CLOSED" : "OPENING"} onOpen={open} />
    </div>
  );
}
