"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface ArchiveControlsProps {
  label: string;
  canPrev: boolean;
  canNext: boolean;
  onPrev: () => void;
  onNext: () => void;
}

const BUTTON_CLASS =
  "p-2 hover:bg-white/10 rounded-full disabled:opacity-30 disabled:hover:bg-transparent transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#e5c158]";

export function ArchiveControls({ label, canPrev, canNext, onPrev, onNext }: ArchiveControlsProps) {
  return (
    <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex items-center gap-3 px-3 py-0.5 rounded-full bg-[#1c211c] border border-[#c6a75f]/30 text-[#f0e6d0] z-50">
      <button onClick={onPrev} disabled={!canPrev} className={BUTTON_CLASS} aria-label="Previous page">
        <ChevronLeft className="w-5 h-5" />
      </button>

      <span className="text-sm min-w-[120px] text-center" aria-live="polite">
        {label}
      </span>

      <button onClick={onNext} disabled={!canNext} className={BUTTON_CLASS} aria-label="Next page">
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}
