"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface LoadingSystemProps {
  onComplete: () => void;
}

const LOG_MESSAGES = [
  "Loading components",
  "Preparing projects",
  "Initializing developer workspace",
  "Launching experience",
];

export function LoadingSystem({ onComplete }: LoadingSystemProps) {
  const [progress, setProgress] = useState(0);
  const [currentLog, setCurrentLog] = useState(0);

  useEffect(() => {
    let animationFrameId: number;
    const startTime = Date.now();
    const duration = 1300; // 1.3 seconds total loading time to fit the 3s budget

    const updateProgress = () => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / duration) * 100, 100);
      
      const easeOutProgress = 100 - 100 * Math.pow(1 - newProgress / 100, 3);
      setProgress(easeOutProgress);

      const logIndex = Math.floor((easeOutProgress / 100) * LOG_MESSAGES.length);
      if (logIndex < LOG_MESSAGES.length) {
        setCurrentLog(logIndex);
      }

      if (elapsed < duration) {
        animationFrameId = requestAnimationFrame(updateProgress);
      } else {
        setProgress(100);
        setCurrentLog(LOG_MESSAGES.length - 1);
        setTimeout(onComplete, 100);
      }
    };

    animationFrameId = requestAnimationFrame(updateProgress);

    return () => cancelAnimationFrame(animationFrameId);
  }, [onComplete]);

  return (
    <div className="absolute inset-0 bg-[#050505] flex flex-col items-center justify-center text-white/80 font-mono z-10 px-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <div className="mb-8 text-center">
          <p className="text-sm font-semibold tracking-widest text-white mb-3">INITIALIZING PORTFOLIO</p>
          <div className="h-0.5 w-full bg-white/10 overflow-hidden mt-4">
            <div 
              className="h-full bg-white transition-all duration-75 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-white/50 mt-2 text-right tracking-widest">{Math.round(progress)}%</p>
        </div>

        <div className="flex flex-col gap-3 h-32 justify-end overflow-hidden">
          {LOG_MESSAGES.slice(0, currentLog + 1).map((log, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: i === currentLog ? 1 : 0.4, x: 0 }}
              className="text-xs text-white/60 flex items-center gap-3 tracking-wider"
            >
              <span className="text-white/80">[✓]</span>
              {log}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
