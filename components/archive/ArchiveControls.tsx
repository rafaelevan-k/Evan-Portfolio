"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

interface ArchiveControlsProps {
  currentPage: number;
  numPages: number;
  onPrev: () => void;
  onNext: () => void;
  isMobile: boolean;
  hasNextDocument: boolean;
  hasPrevDocument: boolean;
  rightPageIsBlank?: boolean;
}

export function ArchiveControls({ currentPage, numPages, onPrev, onNext, isMobile, hasNextDocument, hasPrevDocument, rightPageIsBlank }: ArchiveControlsProps) {
  // If desktop (2 pages per view), we show something like "Page 1-2 of X"
  // If mobile (1 page per view), we show "Page 1 of X"
  const getPageText = () => {
    if (isMobile) {
      return `Page ${currentPage} of ${numPages}`;
    } else {
      if (rightPageIsBlank) {
        return `Page ${currentPage} of ${numPages}`;
      }
      const nextPage = Math.min(currentPage + 1, numPages);
      if (currentPage === nextPage) {
        return `Page ${currentPage} of ${numPages}`;
      }
      return `Pages ${currentPage}-${nextPage} of ${numPages}`;
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1 }}
      className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-6 bg-black/80 backdrop-blur-md px-6 py-3 rounded-full text-white shadow-2xl z-50"
    >
      <button 
        onClick={onPrev}
        disabled={currentPage <= 1 && !hasPrevDocument}
        className="p-2 hover:bg-white/10 rounded-full disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
        aria-label="Previous Page"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <span className="text-sm font-medium tracking-wide min-w-[120px] text-center">
        {getPageText()}
      </span>

      <button 
        onClick={onNext}
        disabled={(isMobile ? currentPage >= numPages : currentPage + 1 >= numPages) && !hasNextDocument}
        className="p-2 hover:bg-white/10 rounded-full disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
        aria-label="Next Page"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </motion.div>
  );
}
