"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { X, Loader2, Download, List } from "lucide-react";
import { Document, Page, pdfjs } from "react-pdf";
import { archiveBooks, type BookCategory } from "@/lib/archiveBooks";
import { ArchiveControls } from "./ArchiveControls";
import { archiveSerif } from "./archiveFont";
import { HERO_BOOKS } from "./shelfLayout";

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Safely setup pdf.worker.min.js via unpkg CDN to avoid webpack build issues
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface BookSpreadReaderProps {
  selectedBook: BookCategory;
  onClose: () => void;
  visible?: boolean;
}

interface PageRef {
  docIndex: number;
  pdfPage: number;
  ordinal: number;
  landscape: boolean;
}

const PAGE_TURN_SECONDS = 0.5;
const TOP_BAR_BUTTON_CLASS =
  "inline-flex items-center gap-2 h-9 px-3 rounded-full border border-[#c6a75f]/35 text-sm text-[#f0e6d0] hover:bg-white/10 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#e5c158]";

// The common paper texture and styling applied to each page
const paperStyle = {
  backgroundColor: "#F3ECDC",
  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E")`,
  boxShadow: "inset 0 0 20px rgba(60,40,10,0.06)",
};

export function BookSpreadReader({ selectedBook, onClose, visible = true }: BookSpreadReaderProps) {
  const [spreadIndex, setSpreadIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [viewport, setViewport] = useState({ width: 0, height: 0 });
  // One landscape flag per PDF page, keyed by document index
  const [docPages, setDocPages] = useState<Record<number, boolean[]>>({});
  const [turn, setTurn] = useState<{ id: number; forward: boolean } | null>(null);
  const [isContentsOpen, setIsContentsOpen] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const reduceMotion = useReducedMotion();

  const bookConfig = archiveBooks[selectedBook];
  const coverColor = HERO_BOOKS.find((book) => book.type === selectedBook)?.color ?? bookConfig.color;
  const loading = !bookConfig.documents.every((_, i) => docPages[i] !== undefined);

  // Landscape pages take a whole spread like a plate; portrait pages pair up.
  const spreads = useMemo(() => {
    if (loading) return [];
    const result: PageRef[][] = [];
    let pending: PageRef | null = null;
    let ordinal = 0;

    const flush = () => {
      if (pending) result.push([pending]);
      pending = null;
    };

    bookConfig.documents.forEach((_, docIndex) => {
      docPages[docIndex].forEach((landscape, i) => {
        const page = { docIndex, pdfPage: i + 1, ordinal: ++ordinal, landscape };
        if (isMobile || landscape) {
          flush();
          result.push([page]);
        } else if (pending) {
          result.push([pending, page]);
          pending = null;
        } else {
          pending = page;
        }
      });
      if (bookConfig.separateDocuments !== false) flush();
    });
    flush();
    return result;
  }, [bookConfig, docPages, isMobile, loading]);

  const totalPages = spreads.reduce((sum, spread) => sum + spread.length, 0);
  const currentIndex = Math.min(spreadIndex, Math.max(spreads.length - 1, 0));
  const currentSpread = spreads[currentIndex] ?? [];
  const currentDocIndex = currentSpread[0]?.docIndex ?? 0;
  const currentDoc = bookConfig.documents[currentDocIndex];
  const isPlate = currentSpread[0]?.landscape ?? false;

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
      setViewport({ width: window.innerWidth, height: window.innerHeight });
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (visible) closeButtonRef.current?.focus();
  }, [visible]);

  // Mirrors the spread size classes below: viewport padding, max-w-6xl, 3:2 limit, and the cover edge
  const spreadWidth = Math.min(viewport.width - 96, 1152, (viewport.height - 96) * 1.5) - 20;
  const spreadHeight = spreadWidth / 1.5;
  const mobileWidth = viewport.width * 0.85;
  const portraitWidth = isMobile ? mobileWidth : Math.min(spreadWidth / 2 - 48, (spreadHeight - 48) * 0.7);
  const plateWidth = isMobile ? mobileWidth : Math.min(spreadWidth - 64, (spreadHeight - 48) * 1.41);

  const goToSpread = (target: number) => {
    const next = Math.min(Math.max(target, 0), spreads.length - 1);
    if (next === currentIndex) return;
    if (!isMobile && !reduceMotion) setTurn({ id: Date.now(), forward: next > currentIndex });
    setSpreadIndex(next);
    setIsContentsOpen(false);
  };

  useEffect(() => {
    if (!visible) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goToSpread(currentIndex + 1);
      if (e.key === "ArrowLeft") goToSpread(currentIndex - 1);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  const renderPage = (page: PageRef, width: number) => (
    <Document key={`${page.docIndex}-${page.pdfPage}`} file={bookConfig.documents[page.docIndex].path} loading={null}>
      <Page
        pageNumber={page.pdfPage}
        renderTextLayer={true}
        renderAnnotationLayer={true}
        className="max-w-full drop-shadow-md flex justify-center [&>.react-pdf__Page__canvas]:!max-w-full [&>.react-pdf__Page__canvas]:!h-auto"
        width={width}
      />
    </Document>
  );

  const firstOrdinal = currentSpread[0]?.ordinal ?? 0;
  const lastOrdinal = currentSpread[currentSpread.length - 1]?.ordinal ?? 0;
  const pageLabel = firstOrdinal === lastOrdinal
    ? `Page ${firstOrdinal} of ${totalPages}`
    : `Pages ${firstOrdinal}-${lastOrdinal} of ${totalPages}`;

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={bookConfig.title}
      aria-hidden={!visible}
      inert={!visible}
      initial={{ opacity: 0 }}
      animate={{ opacity: visible ? 1 : 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: visible ? 0.45 : 0.25 }}
      className={`fixed inset-0 z-50 flex items-center justify-center px-4 pt-16 pb-16 md:p-12 bg-[#141a17]/90 backdrop-blur-sm ${visible ? "" : "pointer-events-none"}`}
    >
      {/* Top bar: where you are, plus the book's actions */}
      <div className="absolute top-0 inset-x-0 h-12 flex items-center justify-between gap-3 px-3 md:px-6 z-50">
        <p className={`${archiveSerif.className} min-w-0 truncate text-[#f0e6d0]`}>
          {bookConfig.title}
          {bookConfig.documents.length > 1 && !loading && (
            <span className="hidden sm:inline text-[#f0e6d0]/60 text-sm">: {currentDoc.title}</span>
          )}
        </p>

        <div className="relative flex shrink-0 items-center gap-2">
          {bookConfig.documents.length > 1 && (
            <button
              onClick={() => setIsContentsOpen((open) => !open)}
              aria-expanded={isContentsOpen}
              className={TOP_BAR_BUTTON_CLASS}
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">Contents</span>
            </button>
          )}
          <a href={currentDoc.path} download aria-label={`Download ${currentDoc.title} as PDF`} className={TOP_BAR_BUTTON_CLASS}>
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Download PDF</span>
          </a>
          <button ref={closeButtonRef} onClick={onClose} aria-label="Close book" className={TOP_BAR_BUTTON_CLASS}>
            <X className="w-4 h-4" />
            <span className="hidden sm:inline">Close</span>
          </button>

          {isContentsOpen && (
            <ul className="absolute right-0 top-11 w-72 max-w-[85vw] p-1.5 rounded-lg bg-[#1c211c] border border-[#c6a75f]/30 shadow-xl">
              {bookConfig.documents.map((doc, docIndex) => (
                <li key={doc.path}>
                  <button
                    onClick={() => goToSpread(spreads.findIndex((spread) => spread[0].docIndex === docIndex))}
                    aria-current={docIndex === currentDocIndex}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm leading-snug hover:bg-white/10 transition-colors ${docIndex === currentDocIndex ? "text-[#e5c158]" : "text-[#f0e6d0]"}`}
                  >
                    {doc.title}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-40">
          <Loader2 className="w-8 h-8 text-white/50 animate-spin mb-4" />
          <p className="text-white/60 text-sm">Loading documents...</p>
        </div>
      )}

      {/* The Physical Book: a leather board in the shelf book's color, holding the pages */}
      <motion.div
        initial={{ scale: 0.96 }}
        animate={{ scale: visible ? 1 : 0.96 }}
        transition={{ type: "spring", stiffness: 260, damping: 30 }}
        style={{ backgroundColor: coverColor, perspective: 2200 }}
        className={`relative w-full max-w-6xl md:w-[min(100%,72rem,calc((100dvh-6rem)*1.5))] max-h-full aspect-[3/4] md:aspect-[3/2] p-1.5 md:p-2.5 rounded-lg shadow-2xl z-10 ${loading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
      >
        <div className={`relative flex w-full h-full rounded-sm overflow-hidden ${isMobile ? 'overflow-y-auto custom-scrollbar' : ''}`} style={paperStyle}>
          {/* Center fold shadow, only where two pages actually meet */}
          {!isMobile && !isPlate && (
            <div className="absolute inset-y-0 left-1/2 w-12 -ml-6 bg-gradient-to-r from-black/0 via-black/15 to-black/0 z-30 pointer-events-none" />
          )}

          <motion.div
            key={currentIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: reduceMotion ? 0 : 0.3 }}
            className={`flex w-full ${isMobile ? 'min-h-full h-max items-center justify-center p-3' : 'h-full'}`}
          >
            {isMobile || isPlate ? (
              <div className={`flex w-full items-center justify-center ${isMobile ? '' : 'h-full'}`}>
                {currentSpread[0] && renderPage(currentSpread[0], isPlate ? plateWidth : portraitWidth)}
              </div>
            ) : (
              [0, 1].map((slot) => (
                <div key={slot} className="w-1/2 h-full flex items-center justify-center p-6">
                  {currentSpread[slot] ? (
                    renderPage(currentSpread[slot], portraitWidth)
                  ) : (
                    <div className="w-16 border-t-2 border-black/15" />
                  )}
                </div>
              ))
            )}
          </motion.div>
        </div>

        {/* A blank leaf sweeping across the spread on page turns */}
        {turn && (
          <motion.div
            key={turn.id}
            initial={{ rotateY: 0 }}
            animate={{ rotateY: turn.forward ? -180 : 180 }}
            transition={{ duration: PAGE_TURN_SECONDS, ease: [0.45, 0.05, 0.55, 0.95] }}
            onAnimationComplete={() => setTurn(null)}
            style={{ ...paperStyle, transformOrigin: turn.forward ? "left center" : "right center" }}
            className={`absolute top-2.5 bottom-2.5 w-[calc(50%-0.625rem)] z-40 pointer-events-none ${turn.forward ? "left-1/2" : "right-1/2"}`}
          />
        )}
      </motion.div>

      {/* Hidden persistent PDF loaders to measure every page and prevent AbortError */}
      <div className="hidden">
        {bookConfig.documents.map((doc, docIndex) => (
          <Document
            key={`preload-${doc.path}`}
            file={doc.path}
            loading={null}
            onLoadSuccess={async (pdf) => {
              const flags: boolean[] = [];
              for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const { width, height } = page.getViewport({ scale: 1 });
                flags.push(width > height);
              }
              setDocPages((prev) => ({ ...prev, [docIndex]: flags }));
            }}
            onLoadError={() => setDocPages((prev) => ({ ...prev, [docIndex]: [false] }))}
          />
        ))}
      </div>

      {/* Pagination Controls */}
      {!loading && spreads.length > 1 && (
        <ArchiveControls
          label={pageLabel}
          canPrev={currentIndex > 0}
          canNext={currentIndex < spreads.length - 1}
          onPrev={() => goToSpread(currentIndex - 1)}
          onNext={() => goToSpread(currentIndex + 1)}
        />
      )}
    </motion.div>
  );
}
