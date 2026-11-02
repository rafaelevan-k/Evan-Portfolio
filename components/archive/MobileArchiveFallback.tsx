"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Download } from "lucide-react";
import dynamic from "next/dynamic";
import { archiveBooks, type BookCategory } from "@/lib/archiveBooks";
import { archiveSerif } from "./archiveFont";
import { HERO_BOOKS } from "./shelfLayout";

const BookSpreadReader = dynamic(() => import("@/components/archive/BookSpreadReader").then(mod => mod.BookSpreadReader), {
  ssr: false,
});

// A pile of books lying flat: uneven widths and offsets, with the CV on top
const BOOK_PILE: { type: BookCategory; width: string; offset: string; ink: string }[] = [
  { type: "cv", width: "94%", offset: "2%", ink: "#f6e3a6" },
  { type: "certifications", width: "100%", offset: "0%", ink: "#f6e3a6" },
  { type: "volunteer", width: "91%", offset: "6%", ink: "#241603" },
  { type: "awards", width: "97%", offset: "1%", ink: "#f6e3a6" },
];

const LINK_CLASS =
  "inline-flex items-center gap-2 min-h-11 px-4 rounded-full border border-[#c6a75f]/40 text-sm text-[#f0e6d0] active:bg-white/10 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e5c158]";

export function MobileArchiveFallback() {
  const [activeCategory, setActiveCategory] = useState<BookCategory | null>(null);
  const bookButtonsRef = useRef<Partial<Record<BookCategory, HTMLButtonElement | null>>>({});

  const closeBook = () => {
    if (activeCategory) bookButtonsRef.current[activeCategory]?.focus();
    setActiveCategory(null);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape" || !activeCategory) return;
      bookButtonsRef.current[activeCategory]?.focus();
      setActiveCategory(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeCategory]);

  return (
    <main className="relative min-h-dvh overflow-hidden bg-[#1c2a23] text-[#f0e6d0] flex flex-col">
      {/* Lamp light falling on the wall, as in the 3D room */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_55%_at_10%_12%,_rgba(255,190,120,0.26),_transparent_70%)]" />

      <div className="relative flex flex-1 flex-col px-4 pt-4 pb-6 max-w-xl w-full mx-auto">
        <nav className="flex items-center justify-between gap-3">
          <Link href="/" className={LINK_CLASS}>
            <ArrowLeft className="w-4 h-4" />
            Return
          </Link>
          <a href={archiveBooks.cv.documents[0].path} download className={LINK_CLASS}>
            <Download className="w-4 h-4" />
            Download CV
          </a>
        </nav>

        <header className="mt-10 mb-8">
          <h1 className={`${archiveSerif.className} text-4xl`}>The Archive</h1>
          <p className="mt-2 text-[#d9cfb8]">A collection of my journey. Choose a book to open it.</p>
        </header>

        {/* The pile rests on a shelf at the bottom of the screen */}
        <div className="mt-auto">
          <ul className="flex flex-col gap-[3px]">
            {BOOK_PILE.map(({ type, width, offset, ink }) => {
              const book = archiveBooks[type];
              const count = book.documents.length;
              const color = HERO_BOOKS.find((hero) => hero.type === type)?.color;

              return (
                <li key={type} style={{ width, marginLeft: offset }}>
                  <button
                    ref={(button) => {
                      bookButtonsRef.current[type] = button;
                    }}
                    onClick={() => setActiveCategory(type)}
                    style={{ backgroundColor: color, color: ink }}
                    className="relative w-full min-h-[76px] rounded-[3px] px-6 py-3 text-left shadow-[0_3px_5px_rgba(0,0,0,0.45)] active:translate-x-1.5 transition-transform focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e5c158]"
                  >
                    {/* Rounded spine: light along the top edge, shadow along the bottom, clear of the text */}
                    <span className="pointer-events-none absolute inset-0 rounded-[3px] bg-[linear-gradient(to_bottom,_rgba(255,255,255,0.2),_transparent_16%,_transparent_82%,_rgba(0,0,0,0.35))]" />
                    {/* Gold bands near each end of the spine */}
                    <span className="pointer-events-none absolute inset-y-0 left-2.5 w-[3px] border-x border-current opacity-60" />
                    <span className="pointer-events-none absolute inset-y-0 right-2.5 w-[3px] border-x border-current opacity-60" />
                    <span className={`${archiveSerif.className} relative block text-xl leading-tight`}>{book.title}</span>
                    <span className="relative mt-0.5 block text-sm">
                      {count} {count === 1 ? "document" : "documents"}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          {/* Walnut shelf board */}
          <div
            aria-hidden="true"
            className="h-4 -mx-4 mt-[3px] bg-[#5a3a26] bg-[url('/archive_wood_wall.webp')] bg-cover bg-blend-soft-light shadow-[0_8px_14px_rgba(0,0,0,0.5)]"
          />
          <p className="mt-6 text-sm text-[#d9cfb8]">On a larger screen, these books sit on a shelf in a 3D room.</p>
        </div>
      </div>

      {/* 2D UI Overlay: The PDF Book Spread */}
      <AnimatePresence>
        {activeCategory && (
          <BookSpreadReader
            selectedBook={activeCategory}
            onClose={closeBook}
          />
        )}
      </AnimatePresence>
    </main>
  );
}
