"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface ArchiveEntranceTransitionProps {
  isTriggered: boolean;
}

export function ArchiveEntranceTransition({ isTriggered }: ArchiveEntranceTransitionProps) {
  const router = useRouter();
  const [particles, setParticles] = useState<{ id: number; x: number; y: number }[]>([]);

  useEffect(() => {
    if (isTriggered) {
      // Generate random particles for the portal effect
      const newParticles = Array.from({ length: 40 }).map((_, i) => ({
        id: i,
        x: Math.random() * 100 - 50,
        y: Math.random() * 100 - 50,
      }));
      setParticles(newParticles);

      // Pre-fetch the route for instant navigation
      router.prefetch("/archive");

      // Execute navigation after the animation sequence
      const timeout = setTimeout(() => {
        router.push("/archive");
      }, 1500);

      return () => clearTimeout(timeout);
    }
  }, [isTriggered, router]);

  return (
    <AnimatePresence>
      {isTriggered && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#050505] overflow-hidden pointer-events-none"
        >
          {/* Subtle noise grain */}
          <div 
            className="absolute inset-0 opacity-20 mix-blend-overlay"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
          />

          {/* Growing Portal Glow */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: [0.8, 1.2, 5], opacity: [0, 1, 0] }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="absolute w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] rounded-full bg-white/10 blur-[100px]"
          />
          
          <motion.div
            initial={{ scale: 0.1, opacity: 0 }}
            animate={{ scale: [0.1, 1, 8], opacity: [0, 0.8, 0] }}
            transition={{ duration: 1.5, ease: "easeInOut", delay: 0.2 }}
            className="absolute w-[20vw] h-[20vw] max-w-[300px] max-h-[300px] rounded-full border border-white/20 shadow-[0_0_100px_rgba(255,255,255,0.2)]"
          />

          {/* Floating Particles */}
          {particles.map((p) => (
            <motion.div
              key={p.id}
              initial={{ 
                x: 0, 
                y: 0, 
                scale: 0, 
                opacity: 0 
              }}
              animate={{ 
                x: `${p.x}vw`, 
                y: `${p.y}vh`, 
                scale: Math.random() * 1.5 + 0.5, 
                opacity: [0, 0.8, 0] 
              }}
              transition={{ 
                duration: 1 + Math.random(), 
                ease: "easeOut",
                delay: Math.random() * 0.3
              }}
              className="absolute w-1 h-1 bg-white/60 rounded-full blur-[1px]"
            />
          ))}

          {/* Zooming text */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1.2, opacity: [0, 1, 0] }}
            transition={{ duration: 1.2, ease: "easeIn" }}
            className="absolute text-white/50 font-display tracking-[0.3em] uppercase text-sm md:text-base font-medium"
          >
            Entering
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
