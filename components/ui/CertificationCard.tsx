"use client";

import { motion } from "framer-motion";
import { FileBadge, Download } from "lucide-react";

interface CertificationCardProps {
  title: string;
  issuer: string;
  date: string;
  pdf: string;
  index: number;
}

export function CertificationCard({ title, issuer, date, pdf, index }: CertificationCardProps) {
  return (
    <motion.a
      href={pdf}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group flex flex-col p-6 rounded-2xl glass-panel transition-all duration-300 hover:shadow-lg dark:hover:shadow-white/5 hover:-translate-y-1 relative overflow-hidden"
    >
      {/* Decorative background gradient */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-ink/5 rounded-full blur-3xl transition-all duration-500 group-hover:bg-ink/10" />

      <div className="flex items-start justify-between mb-6">
        <div className="w-12 h-12 rounded-xl bg-surface-soft border border-hairline flex items-center justify-center text-ink transition-transform duration-300 group-hover:scale-110 group-hover:bg-ink group-hover:text-on-dark">
          <FileBadge className="w-6 h-6" />
        </div>
        <div className="w-8 h-8 rounded-full bg-surface-soft flex items-center justify-center text-muted-text opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:text-ink">
          <Download className="w-4 h-4" />
        </div>
      </div>

      <h3 className="font-display text-lg font-bold text-ink mb-2 pr-4 leading-tight group-hover:text-ink-deep transition-colors">
        {title}
      </h3>
      
      <div className="mt-auto pt-4 border-t border-hairline flex items-center justify-between">
        <p className="text-sm font-medium text-charcoal">{issuer}</p>
        <p className="text-xs text-muted-text bg-surface-soft px-2 py-1 rounded-md">{date}</p>
      </div>
    </motion.a>
  );
}
