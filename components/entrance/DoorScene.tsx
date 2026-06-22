"use client";

import { motion } from "framer-motion";

interface DoorSceneProps {
  status: "CLOSED" | "OPENING" | "TRANSITION_LIGHT";
  onOpen: () => void;
}

// Dust particles for the room environment
const DUST_PARTICLES = Array.from({ length: 20 });

export function DoorScene({ status, onOpen }: DoorSceneProps) {
  const isOpeningOrLater = status === "OPENING" || status === "TRANSITION_LIGHT";
  const isLightTransition = status === "TRANSITION_LIGHT";

  return (
    <div className="absolute inset-0 bg-[#030303] overflow-hidden flex flex-col items-center justify-center font-sans">
      
      {/* ROOM ENVIRONMENT */}
      {/* Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000_100%)] z-0 pointer-events-none opacity-80" />
      
      {/* Spotlight focused on the door */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.05)_0%,transparent_70%)] z-0 pointer-events-none" />

      {/* Floating Dust Particles */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {DUST_PARTICLES.map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full blur-[1px]"
            initial={{
              x: Math.random() * (typeof window !== "undefined" ? window.innerWidth : 1000),
              y: Math.random() * (typeof window !== "undefined" ? window.innerHeight : 1000),
              opacity: Math.random() * 0.5 + 0.1,
            }}
            animate={{
              y: [null, Math.random() * -100 - 50],
              x: [null, (Math.random() - 0.5) * 50],
              opacity: [null, Math.random() * 0.8 + 0.2, 0],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
      </div>

      {/* TEXT ABOVE THE DOOR */}
      <motion.div
        animate={{ opacity: isOpeningOrLater ? 0 : 1, y: isOpeningOrLater ? -20 : 0 }}
        transition={{ duration: 0.5 }}
        className="mb-4 md:mb-6 flex flex-col items-center z-10"
      >
        <p className="font-display text-lg md:text-xl tracking-[0.2em] uppercase font-bold text-white mb-1 drop-shadow-lg text-center">
          Enter My Portfolio
        </p>
        <p className="text-[10px] md:text-xs tracking-widest uppercase text-white/50 text-center">
          Click the door to enter
        </p>
      </motion.div>

      {/* DOOR CONTAINER (The focal point) */}
      {/* The door takes up ~35-45% width, 60-70% height on desktop, ensuring it looks like a physical object */}
      <motion.div
        className="relative z-10 w-[260px] h-[400px] sm:w-[320px] sm:h-[480px] md:w-[360px] md:h-[520px] lg:w-[400px] lg:h-[560px] flex-shrink-0 cursor-pointer group"
        style={{ perspective: "1500px" }}
        animate={{ scale: isOpeningOrLater ? 1.05 : 1 }}
        whileHover={status === "CLOSED" ? { scale: 1.02 } : {}}
        transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
        onClick={() => {
          if (status === "CLOSED") onOpen();
        }}
      >
        {/* Door Frame (Thick outer structure) */}
        <div className="absolute inset-0 border-[12px] md:border-[16px] border-[#0a0a0a] bg-black shadow-[0_20px_50px_rgba(0,0,0,0.8)] rounded-t-sm flex items-center justify-center" style={{ transformStyle: "preserve-3d" }}>
          
          {/* Intense Light behind the door (The DoorLight component) */}
          <motion.div
            animate={{ 
              opacity: isOpeningOrLater ? 1 : 0, 
              scale: isOpeningOrLater ? 2.5 : 1 
            }}
            transition={{ duration: 1.5, ease: "easeIn" }}
            className="absolute inset-0 bg-white blur-[60px] z-0 pointer-events-none"
          />

          {/* Center glowing gap (when closed, warm light leak) */}
          <motion.div
            animate={{ opacity: isOpeningOrLater ? 0 : 0.8 }}
            className="absolute w-[2px] h-full bg-[#ffeedd] blur-[2px] z-10 pointer-events-none mix-blend-screen shadow-[0_0_15px_#ffeedd]"
          />

          {/* LEFT DOOR PANEL (Woody Brown) */}
          <motion.div
            animate={{ rotateY: isOpeningOrLater ? -100 : 0, z: isOpeningOrLater ? -50 : 0 }}
            transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
            className="absolute left-0 w-1/2 h-full bg-[#3A2618] border-r border-[#2A180C] shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] z-20 overflow-hidden"
            style={{ transformOrigin: "left", transformStyle: "preserve-3d" }}
          >
            {/* Panel Carvings (Vertical detailing) */}
            <div className="absolute inset-3 md:inset-4 border border-[#4A3018] rounded-sm pointer-events-none" />
            <div className="absolute inset-x-3 md:inset-x-4 top-[50%] bottom-3 md:bottom-4 border border-[#4A3018] rounded-sm pointer-events-none" />

            
            {/* Left Door Handle */}
            <div className="absolute top-1/2 -translate-y-1/2 right-3 md:right-5 w-2 h-20 md:h-28 bg-gradient-to-b from-[#b89947] to-[#6e5822] rounded-full shadow-[2px_0_5px_rgba(0,0,0,0.8)] border border-[#e8ce84]/30 transition-all duration-300 group-hover:shadow-[0_0_15px_rgba(232,206,132,0.4)] group-hover:from-[#d1b25c]" />
          </motion.div>

          {/* RIGHT DOOR PANEL (Woody Brown) */}
          <motion.div
            animate={{ rotateY: isOpeningOrLater ? 100 : 0, z: isOpeningOrLater ? -50 : 0 }}
            transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
            className="absolute right-0 w-1/2 h-full bg-[#3A2618] border-l border-[#201005] shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] z-20 overflow-hidden"
            style={{ transformOrigin: "right", transformStyle: "preserve-3d" }}
          >
            {/* Panel Carvings */}
            <div className="absolute inset-3 md:inset-4 border border-[#4A3018] rounded-sm pointer-events-none" />
            <div className="absolute inset-x-3 md:inset-x-4 top-[50%] bottom-3 md:bottom-4 border border-[#4A3018] rounded-sm pointer-events-none" />
            
            {/* Right Door Handle */}
            <div className="absolute top-1/2 -translate-y-1/2 left-3 md:left-5 w-2 h-20 md:h-28 bg-gradient-to-b from-[#b89947] to-[#6e5822] rounded-full shadow-[-2px_0_5px_rgba(0,0,0,0.8)] border border-[#e8ce84]/30 transition-all duration-300 group-hover:shadow-[0_0_15px_rgba(232,206,132,0.4)] group-hover:from-[#d1b25c]" />
          </motion.div>

        </div>
      </motion.div>

      {/* TRANSITION LIGHT FLASH OVERLAY */}
      {/* This flashes white completely covering the screen, smoothly fading into the Loading system */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isLightTransition ? 1 : 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="fixed inset-0 bg-white z-[100] pointer-events-none"
      />
    </div>
  );
}
