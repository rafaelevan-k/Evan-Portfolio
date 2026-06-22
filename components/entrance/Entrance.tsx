"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DoorScene } from "./DoorScene";
import { LoadingSystem } from "./LoadingSystem";

type EntranceState = "INITIAL" | "IDLE_DOOR" | "OPENING_DOOR" | "LIGHT_TRANSITION" | "LOADING" | "PORTFOLIO_READY";

export function Entrance() {
  const [state, setState] = useState<EntranceState>("INITIAL");

  useEffect(() => {
    const hasVisited = sessionStorage.getItem("hasVisitedPortfolio");
    if (hasVisited) {
      setState("PORTFOLIO_READY");
    } else {
      setState("IDLE_DOOR");
      document.body.style.overflow = "hidden";
    }
  }, []);

  const handleOpenDoor = () => {
    setState("OPENING_DOOR");
    
    // At 1.2s, start the bright light flash transition (Door swing takes 1.5s total)
    setTimeout(() => {
      setState("LIGHT_TRANSITION");
    }, 1200);

    // At 1.5s, switch to loading screen (light flash stays up then fades down)
    setTimeout(() => {
      setState("LOADING");
    }, 1500);
  };

  const handleLoadingComplete = () => {
    // Reveal portfolio smoothly (Loading system handles its own 1.3s duration)
    // 1.5s (start) + 1.3s (loading) = 2.8s total so far.
    setState("PORTFOLIO_READY");
    sessionStorage.setItem("hasVisitedPortfolio", "true");
    document.body.style.overflow = "auto";
  };

  const handleSkip = () => {
    setState("PORTFOLIO_READY");
    sessionStorage.setItem("hasVisitedPortfolio", "true");
    document.body.style.overflow = "auto";
  };

  if (state === "INITIAL" || state === "PORTFOLIO_READY") {
    return null;
  }

  // Determine what's visible based on state
  const isDoorVisible = state === "IDLE_DOOR" || state === "OPENING_DOOR" || state === "LIGHT_TRANSITION";
  const isLoadingVisible = state === "LOADING";
  const isFlashActive = state === "LIGHT_TRANSITION";

  // Map local states to the DoorScene's expected prop types
  let doorStatus: "CLOSED" | "OPENING" | "TRANSITION_LIGHT" = "CLOSED";
  if (state === "OPENING_DOOR") doorStatus = "OPENING";
  if (state === "LIGHT_TRANSITION") doorStatus = "TRANSITION_LIGHT";

  return (
    <AnimatePresence>
      <motion.div
        key="entrance-overlay"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        className="fixed inset-0 z-[9999] bg-[#030303]"
      >
        
        {/* The Boot Sequence */}
        {isLoadingVisible && (
          <LoadingSystem onComplete={handleLoadingComplete} />
        )}

        {/* The Realistic 3D Door Scene */}
        {isDoorVisible && (
          <DoorScene status={doorStatus} onOpen={handleOpenDoor} />
        )}

        {/* Global Transition Flash Overlay */}
        {/* Persists across state changes to bridge the DoorScene and LoadingSystem smoothly */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isFlashActive ? 1 : 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="absolute inset-0 bg-white z-[1000] pointer-events-none"
        />

        {/* Skip button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          onClick={handleSkip}
          className="absolute bottom-6 right-6 text-[10px] font-medium text-white/30 hover:text-white/80 transition-colors z-[1001] tracking-widest uppercase"
        >
          Skip Animation
        </motion.button>

      </motion.div>
    </AnimatePresence>
  );
}

