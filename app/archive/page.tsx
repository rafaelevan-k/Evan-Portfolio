"use client";

import dynamic from "next/dynamic";
import { useCallback, useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MobileArchiveFallback } from "@/components/archive/MobileArchiveFallback";
import { HERO_BOOKS } from "@/components/archive/shelfLayout";
import { archiveBooks, type BookCategory } from "@/lib/archiveBooks";
import Link from "next/link";
import { ArrowLeft, Download } from "lucide-react";

const ROOM_BUTTON_CLASS =
  "absolute top-6 md:top-10 z-40 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/45 border border-white/20 text-white/90 text-xs font-medium tracking-widest uppercase hover:bg-black/65 hover:text-white transition-colors backdrop-blur-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#e5c158]";

// Tab order follows the shelf from top to bottom
const BOOKS_TOP_DOWN = [...HERO_BOOKS].reverse();

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
    <div className="absolute inset-0 flex items-center justify-center bg-[#141a17]">
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
  // The reader mounts on selection so PDFs load during the 3D opening, and shows once the cover is open
  const [isReaderVisible, setIsReaderVisible] = useState(false);
  const [isMobile, setIsMobile] = useState<boolean | null>(null);
  const [focusedBook, setFocusedBook] = useState<BookCategory | null>(null);
  const [hasOpenedBook, setHasOpenedBook] = useState(false);
  const bookButtonsRef = useRef<Partial<Record<BookCategory, HTMLButtonElement | null>>>({});
  const keyboardOpenedBookRef = useRef<BookCategory | null>(null);

  const selectBook = (book: BookType) => {
    setSelectedBook(book);
    if (book) setHasOpenedBook(true);
  };

  const closeBook = useCallback(() => {
    setSelectedBook(null);
    setIsReaderVisible(false);
    // Keyboard users land back on the book they opened
    if (keyboardOpenedBookRef.current) {
      bookButtonsRef.current[keyboardOpenedBookRef.current]?.focus();
      keyboardOpenedBookRef.current = null;
    }
  }, []);

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
        closeBook();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedBook, closeBook]);

  // Don't render until we know the screen size to prevent flash
  if (isMobile === null) return <ArchiveLoader />;

  if (isMobile) {
    return <MobileArchiveFallback />;
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#141a17] selection:bg-white/20 selection:text-white">
      {/* 3D Environment */}
      <ArchiveScene
        selectedBook={selectedBook}
        setSelectedBook={selectBook}
        focusedBook={focusedBook}
        onBookOpened={() => setIsReaderVisible(true)}
      />

      {/* The canvas can't take focus, so hidden buttons drive the same books for keyboards and screen readers */}
      <nav aria-label="Books on the shelf" className="sr-only">
        {BOOKS_TOP_DOWN.map(({ type }) => (
          <button
            key={type}
            ref={(button) => {
              bookButtonsRef.current[type] = button;
            }}
            tabIndex={selectedBook ? -1 : 0}
            onFocus={() => setFocusedBook(type)}
            onBlur={() => setFocusedBook(null)}
            onClick={() => {
              keyboardOpenedBookRef.current = type;
              selectBook(type);
            }}
          >
            Open {archiveBooks[type].title}
          </button>
        ))}
      </nav>

      {/* Vignette that pulls the eye toward the shelf */}
      <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(ellipse_at_center,_transparent_55%,_rgba(0,0,0,0.5)_100%)]" />
      {/* Tighter vignette while a book is out, so the room falls away around it */}
      <div className={`pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(ellipse_at_center,_transparent_25%,_rgba(0,0,0,0.75)_85%)] transition-opacity duration-700 ${selectedBook ? "opacity-100" : "opacity-0"}`} />

      {/* 2D UI Overlay: The PDF Book Spread */}
      <AnimatePresence>
        {selectedBook && (
          <BookSpreadReader 
            selectedBook={selectedBook}
            visible={isReaderVisible}
            onClose={closeBook}
          />
        )}
      </AnimatePresence>

      {/* Subtle Back Button (visible when no book is selected) */}
      <AnimatePresence>
        {!selectedBook && (
          <Link href="/" className={`${ROOM_BUTTON_CLASS} left-6 md:left-10`}>
            <ArrowLeft className="w-4 h-4" />
            Return
          </Link>
        )}
      </AnimatePresence>

      {/* The CV stays one click away for visitors who came only for that */}
      {!selectedBook && (
        <a href={archiveBooks.cv.documents[0].path} download className={`${ROOM_BUTTON_CLASS} right-6 md:right-10`}>
          <Download className="w-4 h-4" />
          Download CV
        </a>
      )}

      {/* First-visit hint, gone once a book has been opened */}
      <AnimatePresence>
        {!hasOpenedBook && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, delay: 0.8 }}
            className="pointer-events-none absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 z-20 whitespace-nowrap px-4 py-2 rounded-full bg-black/55 border border-white/15 text-sm text-white/90 backdrop-blur-md"
          >
            Choose a bright book to open it
          </motion.p>
        )}
      </AnimatePresence>

    </div>
  );
}
