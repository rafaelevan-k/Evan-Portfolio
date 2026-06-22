"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  title: string;
  subtitle: string;
  description?: string;
  className?: string;
}

export function SectionHeader({ title, subtitle, description, className }: SectionHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={cn("flex flex-col items-center text-center mb-16", className)}
    >
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-hairline bg-surface-soft text-xs font-medium uppercase tracking-widest text-muted-text mb-6">
        <span className="w-1.5 h-1.5 rounded-full bg-ink animate-pulse" />
        {subtitle}
      </div>
      <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight text-ink mb-4">
        {title}
      </h2>
      {description && (
        <p className="text-body-text max-w-2xl mx-auto text-lg leading-relaxed text-balance">
          {description}
        </p>
      )}
    </motion.div>
  );
}
