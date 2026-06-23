"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Book, ShieldCheck, Trophy, Users, ChevronRight, Info, X } from "lucide-react";
import dynamic from "next/dynamic";
import type { BookCategory } from "@/lib/archiveBooks";

const BookSpreadReader = dynamic(() => import("@/components/archive/BookSpreadReader").then(mod => mod.BookSpreadReader), {
  ssr: false,
});

export function MobileArchiveFallback() {
  const [activeCategory, setActiveCategory] = useState<BookCategory | null>(null);
  const [showAlert, setShowAlert] = useState(true);

  const categories: { id: BookCategory; label: string; icon: any; color: string }[] = [
    { id: "cv", label: "Curriculum Vitae", icon: Book, color: "bg-red-500" },
    { id: "certifications", label: "Certifications", icon: ShieldCheck, color: "bg-blue-500" },
    { id: "volunteer", label: "Volunteer & Org", icon: Users, color: "bg-yellow-500" },
    { id: "awards", label: "Awards", icon: Trophy, color: "bg-green-500" },
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 relative overflow-hidden">
      {/* Subtle stylized gradient background to mimic the 3D room's lighting */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/20 via-[#050505] to-[#050505]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-orange-900/10 via-transparent to-transparent" />

      <div className="relative z-10">
        <header className="mb-12 pt-6">
          <Link href="/" className="inline-flex items-center gap-2 text-white/50 text-sm font-medium hover:text-white transition-colors mb-6 uppercase tracking-widest">
            <ArrowLeft className="w-4 h-4" /> Return Home
          </Link>
          <h1 className="font-display text-4xl font-bold tracking-tight mb-2">The Archive</h1>
          <p className="text-white/50">A collection of my journey and documents.</p>
        </header>

        <AnimatePresence>
          {showAlert && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mb-8 p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-start gap-4 backdrop-blur-md relative"
            >
              <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0">
                <Info className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="flex-1 pr-6">
                <h3 className="text-indigo-300 font-medium text-sm mb-1">Desktop Experience Available</h3>
                <p className="text-white/60 text-xs leading-relaxed">
                  The full 3D interactive archive room is exclusively available on desktop devices. You are currently viewing the simplified mobile layout.
                </p>
              </div>
              <button 
                onClick={() => setShowAlert(false)}
                className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
                aria-label="Close alert"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-4">
          {categories.map((cat) => (
            <motion.div
              key={cat.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveCategory(cat.id === activeCategory ? null : cat.id)}
              className={`p-5 rounded-2xl border ${activeCategory === cat.id ? 'border-white/30 bg-white/10' : 'border-white/10 bg-white/5'} flex items-center justify-between cursor-pointer transition-colors backdrop-blur-md`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full ${cat.color} bg-opacity-20 flex items-center justify-center`}>
                  <cat.icon className={`w-5 h-5 text-white`} />
                </div>
                <span className="font-medium text-lg">{cat.label}</span>
              </div>
              <ChevronRight className={`w-5 h-5 text-white/50 transition-transform ${activeCategory === cat.id ? 'rotate-90' : ''}`} />
            </motion.div>
          ))}
        </div>

        {/* 2D UI Overlay: The PDF Book Spread */}
        <AnimatePresence>
          {activeCategory && (
            <BookSpreadReader 
              selectedBook={activeCategory} 
              onClose={() => setActiveCategory(null)} 
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
