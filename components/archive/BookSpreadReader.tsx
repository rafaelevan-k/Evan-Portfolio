"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { X, Loader2 } from "lucide-react";
import { Document, Page, pdfjs } from "react-pdf";
import { archiveBooks, type BookCategory } from "@/lib/archiveBooks";
import { ArchiveControls } from "./ArchiveControls";

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Safely setup pdf.worker.min.js via unpkg CDN to avoid webpack build issues
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface BookSpreadReaderProps {
  selectedBook: BookCategory;
  onClose: () => void;
}

export function BookSpreadReader({ selectedBook, onClose }: BookSpreadReaderProps) {
  const [globalCurrentPage, setGlobalCurrentPage] = useState<number>(1);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [docPageCounts, setDocPageCounts] = useState<Record<number, number>>({});

  const bookConfig = archiveBooks[selectedBook];
  const allDocsMeasured = bookConfig.documents.every((_, i) => docPageCounts[i] !== undefined);

  // Flatten all documents into a single deterministic page map.
  const pageMap = useMemo(() => {
    if (!allDocsMeasured) return [];
    const map: { docIndex: number; pdfPage: number | null }[] = [];
    bookConfig.documents.forEach((_, i) => {
      const pages = docPageCounts[i] || 1;
      for (let p = 1; p <= pages; p++) {
        map.push({ docIndex: i, pdfPage: p });
      }
      
      // Pad with a blank right page if separateDocuments is true (defaults to true)
      const separateDocs = bookConfig.separateDocuments !== false;
      if (!isMobile && separateDocs && map.length % 2 !== 0) {
        map.push({ docIndex: i, pdfPage: null });
      }
    });
    return map;
  }, [bookConfig.documents, docPageCounts, allDocsMeasured, isMobile, bookConfig.separateDocuments]);

  // Determine which document and pages are currently visible
  const leftPageData = pageMap[globalCurrentPage - 1];
  const rightPageData = isMobile ? null : pageMap[globalCurrentPage];
  
  const loading = !allDocsMeasured;

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [globalCurrentPage, pageMap.length, isMobile]);

  const handlePrev = () => {
    setGlobalCurrentPage((prev) => Math.max(1, prev - (isMobile ? 1 : 2)));
  };

  const handleNext = () => {
    setGlobalCurrentPage((prev) => prev + (isMobile ? 1 : 2));
  };

  // The common paper texture and styling applied to each page
  const paperStyle = {
    backgroundColor: "#F4F1EA",
    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E")`,
    boxShadow: "inset 0 0 20px rgba(0,0,0,0.05)"
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-12 backdrop-blur-xl bg-black/80"
    >
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 md:top-8 md:right-8 p-3 bg-red-600/90 hover:bg-red-700 text-white/90 hover:text-white rounded-full backdrop-blur-md transition-all hover:scale-110 shadow-[0_0_20px_rgba(220,38,38,0.3)] z-50"
        aria-label="Close Book"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Loading State */}
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-40">
          <Loader2 className="w-8 h-8 text-white/50 animate-spin mb-4" />
          <p className="text-white/50 tracking-widest text-sm uppercase font-display">Retrieving archived documents...</p>
        </div>
      )}

      {/* The Physical Book Spread Container */}
      <motion.div
        initial={{ scale: 0.95, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.95, y: 20, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.1 }}
        className={`relative w-full max-w-6xl aspect-[3/4] md:aspect-[3/2] flex bg-[#E6E2D6] rounded-sm md:rounded-lg overflow-hidden shadow-2xl z-10 ${loading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-500`}
      >
        {/* Center fold shadow */}
        {!isMobile && (
          <div className="absolute inset-y-0 left-1/2 w-12 -ml-6 bg-gradient-to-r from-black/5 via-black/20 to-black/5 z-30 pointer-events-none" />
        )}

        <div className={`flex w-full h-full ${isMobile ? 'flex-col overflow-y-auto overflow-x-hidden custom-scrollbar' : 'flex-row'}`}>
          {/* Left Page (Or Single Mobile Page) */}
          <div 
            className={`${isMobile ? 'w-full h-auto flex justify-center p-4' : 'w-1/2 h-full flex flex-col items-center justify-center p-6 md:p-10'} relative shadow-[inset_-10px_0_20px_rgba(0,0,0,0.02)]`}
            style={paperStyle}
          >
            {!isMobile && leftPageData?.pdfPage === 1 && (
              <div className="absolute top-8 left-8 md:top-12 md:left-12 text-xs font-bold tracking-widest uppercase text-black/30 z-20">
                {bookConfig.documents[leftPageData.docIndex].title}
              </div>
            )}
            
            {leftPageData?.pdfPage ? (
              <Document file={bookConfig.documents[leftPageData.docIndex].path} loading={null}>
                <Page 
                  pageNumber={leftPageData.pdfPage} 
                  renderTextLayer={true}
                  renderAnnotationLayer={true}
                  className="max-w-full drop-shadow-md flex justify-center [&>.react-pdf__Page__canvas]:!max-w-full [&>.react-pdf__Page__canvas]:!h-auto"
                  width={isMobile ? (window.innerWidth * 0.9) : (window.innerWidth * 0.45 - 80)}
                />
              </Document>
            ) : (
              <div className="w-full h-full flex items-center justify-center opacity-20">
                <div className="w-16 h-1 border-t-2 border-black/50" />
              </div>
            )}
          </div>

          {/* Right Page (Only for Desktop) */}
          {!isMobile && (
            <div 
              className="w-1/2 h-full flex flex-col items-center justify-center p-6 md:p-10 relative shadow-[inset_10px_0_20px_rgba(0,0,0,0.02)]"
              style={paperStyle}
            >
              {rightPageData?.pdfPage === 1 && (
                <div className="absolute top-8 left-8 md:top-12 md:left-12 text-xs font-bold tracking-widest uppercase text-black/30 z-20">
                  {bookConfig.documents[rightPageData.docIndex].title}
                </div>
              )}
              
              {rightPageData?.pdfPage ? (
                <Document file={bookConfig.documents[rightPageData.docIndex].path} loading={null}>
                  <Page 
                    pageNumber={rightPageData.pdfPage} 
                    renderTextLayer={true}
                    renderAnnotationLayer={true}
                    className="max-w-full drop-shadow-md flex justify-center [&>.react-pdf__Page__canvas]:!max-w-full [&>.react-pdf__Page__canvas]:!h-auto"
                    width={window.innerWidth * 0.45 - 80}
                  />
                </Document>
              ) : (
                <div className="w-full h-full flex items-center justify-center opacity-20">
                  <div className="w-16 h-1 border-t-2 border-black/50" />
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>

      {/* Hidden persistent PDF loaders to dynamically compute total pages and prevent AbortError */}
      <div className="hidden">
        {bookConfig.documents.map((doc, docIndex) => (
          <Document
            key={`preload-${doc.path}`}
            file={doc.path}
            loading={null}
            onLoadSuccess={({ numPages }) => {
              if (docPageCounts[docIndex] !== numPages) {
                setDocPageCounts(prev => ({ ...prev, [docIndex]: numPages }));
              }
            }}
            onLoadError={() => {
              if (docPageCounts[docIndex] !== 1) {
                setDocPageCounts(prev => ({ ...prev, [docIndex]: 1 }));
              }
            }}
          />
        ))}
      </div>

      {/* Pagination Controls */}
      {!loading && pageMap.length > 0 && (selectedBook !== "cv" || isMobile) && (
        <ArchiveControls 
          currentPage={globalCurrentPage}
          numPages={pageMap.length}
          onPrev={handlePrev}
          onNext={handleNext}
          isMobile={isMobile}
          hasNextDocument={globalCurrentPage + (isMobile ? 0 : 1) < pageMap.length}
          hasPrevDocument={globalCurrentPage > 1}
          rightPageIsBlank={!rightPageData}
        />
      )}
    </motion.div>
  );
}
