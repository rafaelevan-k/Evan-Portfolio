"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Lock, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Suspense } from "react";

function PrivateRepoContent() {
  const searchParams = useSearchParams();
  const repo = searchParams.get("repo");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-canvas relative overflow-hidden px-6 selection:bg-ink selection:text-on-dark">
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-ink/5 to-transparent opacity-50 blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 max-w-xl w-full flex flex-col items-center text-center p-8 md:p-12 rounded-[2rem] glass-panel border border-hairline bg-surface-soft shadow-xl"
      >
        <div className="w-16 h-16 rounded-full bg-canvas border border-hairline flex items-center justify-center mb-6 shadow-sm">
          <Lock className="w-8 h-8 text-ink" />
        </div>

        <h1 className="font-display text-3xl md:text-4xl font-bold text-ink tracking-tight mb-4">
          Private Repository
        </h1>

        <p className="text-body-text text-base md:text-lg leading-relaxed mb-10 text-balance">
          The source code for this project is hosted in a private repository. You may need to request access from the owner to view its contents.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          {repo ? (
            <a 
              href={repo} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-ink text-on-dark font-medium transition-transform hover:scale-105 active:scale-95"
            >
              Request Access
              <ArrowRight className="w-4 h-4" />
            </a>
          ) : null}
          
          <Link 
            href="/#projects" 
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-surface-soft border border-hairline text-ink font-medium transition-transform hover:scale-105 active:scale-95 hover:bg-canvas"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Projects
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export default function PrivateRepoPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-canvas" />}>
      <PrivateRepoContent />
    </Suspense>
  );
}
