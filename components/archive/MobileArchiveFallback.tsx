"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Book, ShieldCheck, Trophy, Users, ChevronRight } from "lucide-react";
import dynamic from "next/dynamic";
import type { BookCategory } from "@/lib/archiveBooks";

const BookSpreadReader = dynamic(() => import("@/components/archive/BookSpreadReader").then(mod => mod.BookSpreadReader), {
  ssr: false,
});

export function MobileArchiveFallback() {
  const [activeCategory, setActiveCategory] = useState<BookCategory | null>(null);

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
