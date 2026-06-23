"use client";

import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MobileArchiveFallback } from "@/components/archive/MobileArchiveFallback";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

// The Loading Component with sequence texts
function ArchiveLoader() {
  const [loadingText, setLoadingText] = useState("Entering The Archive...");

  useEffect(() => {
    const t1 = setTimeout(() => setLoadingText("Preparing the room..."), 1000);
    const t2 = setTimeout(() => setLoadingText("Arranging the books..."), 2000);
    const t3 = setTimeout(() => setLoadingText("Opening the memory vault..."), 3000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-[#0a0a0a]">
      <div className="flex flex-col items-center">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white/80 rounded-full animate-spin mb-6" />
        <motion.p 
          key={loadingText}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="text-xs tracking-[0.2em] uppercase text-white/50 font-display h-4"
        >
          {loadingText}
        </motion.p>
      </div>
    </div>
  );
}

// Dynamically import the 3D scene to prevent blocking the initial page load
const ArchiveScene = dynamic(() => import("@/components/archive/ArchiveScene"), {
  ssr: false,
  loading: () => <ArchiveLoader />,
});

// Dynamically import the heavy PDF Reader ONLY when a book is clicked
const BookSpreadReader = dynamic(() => import("@/components/archive/BookSpreadReader").then(mod => mod.BookSpreadReader), {
  ssr: false,
});

export type BookType = "cv" | "certifications" | "volunteer" | "awards" | null;

export default function ArchivePage() {
  const [selectedBook, setSelectedBook] = useState<BookType>(null);
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Use Escape key to close book
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedBook) {
        setSelectedBook(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedBook]);

  // Don't render until we know the screen size to prevent flash
  if (isMobile === null) return <ArchiveLoader />;

  if (isMobile) {
    return <MobileArchiveFallback />;
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#F5F2EB] selection:bg-white/20 selection:text-white">
      {/* 3D Environment */}
      <ArchiveScene selectedBook={selectedBook} setSelectedBook={setSelectedBook} />

      {/* 2D UI Overlay: The PDF Book Spread */}
      <AnimatePresence>
        {selectedBook && (
          <BookSpreadReader 
            selectedBook={selectedBook} 
            onClose={() => setSelectedBook(null)} 
          />
        )}
      </AnimatePresence>

      {/* Subtle Back Button (visible when no book is selected) */}
      <AnimatePresence>
        {!selectedBook && (
          <Link
            href="/"
            className="absolute top-6 left-6 md:top-10 md:left-10 z-40 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/70 text-xs font-medium tracking-widest uppercase hover:bg-white/10 hover:text-white transition-colors backdrop-blur-md"
          >
            <ArrowLeft className="w-4 h-4" />
            Return
          </Link>
        )}
      </AnimatePresence>
      

    </div>
  );
}
