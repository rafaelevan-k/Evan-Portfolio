"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface MagneticButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  as?: "button" | "a";
  href?: string;
}

export function MagneticButton({
  children,
  className,
  variant = "primary",
  as = "button",
  href,
  ...props
}: MagneticButtonProps) {
  const ref = useRef<HTMLButtonElement | HTMLAnchorElement | null>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouse = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    setPosition({ x: middleX * 0.2, y: middleY * 0.2 });
  };

  const reset = () => {
    setPosition({ x: 0, y: 0 });
  };

  const Component = as as any;

  return (
    <motion.div
      style={{ position: "relative" }}
      ref={ref as any}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
    >
      <Component
        href={href}
        className={cn(
          "inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium transition-colors duration-300",
          variant === "primary"
            ? "bg-ink text-on-dark hover:bg-ink-deep hover:shadow-lg"
            : "glass-panel text-ink hover:bg-surface-soft",
          className
        )}
        {...props}
      >
        {children}
      </Component>
    </motion.div>
  );
}
