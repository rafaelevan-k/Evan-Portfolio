"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { ThemeToggle } from "./ui/ThemeToggle";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "About", href: "#about" },
  { label: "Projects", href: "#projects" },
  { label: "Certifications", href: "#certifications" },
  { label: "Archive", href: "#archive" },
  { label: "Contact", href: "#contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

      const sections = navLinks.map((link) => link.href.replace("#", ""));
      let current = "";
      for (const section of [...sections].reverse()) {
        const el = document.getElementById(section);
        if (el) {
          const rect = el.getBoundingClientRect();
          // Adjust threshold for what counts as active
          if (rect.top <= 200) {
            current = section;
            break;
          }
        }
      }
      setActiveSection(current);
    };

    window.addEventListener("scroll", handleScroll);
    // Initial check
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const targetId = href.replace("#", "");
    const el = document.getElementById(targetId);
    if (el) el.scrollIntoView({ behavior: "smooth" });
    setMobileMenuOpen(false);
  };

  return (
    <>
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-0 left-0 right-0 z-50 flex justify-center mt-4 px-4 sm:px-6 pointer-events-none"
      >
        <div
          className={cn(
            "pointer-events-auto flex items-center justify-between transition-all duration-300",
            scrolled
              ? "w-full max-w-3xl rounded-full glass-panel px-4 py-2 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.1)] dark:shadow-[0_8px_32px_-8px_rgba(255,255,255,0.05)]"
              : "w-full max-w-5xl rounded-2xl bg-transparent px-2 py-4"
          )}
        >
          {/* Logo */}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="flex items-center gap-2 group ml-2"
          >
            <div className="w-8 h-8 rounded-full bg-ink flex items-center justify-center text-on-dark font-display font-bold text-sm">
              R
            </div>
            {!scrolled && (
              <span className="font-display font-semibold text-ink tracking-tight">
                Rafael Evan
              </span>
            )}
          </a>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1 p-1 rounded-full border border-hairline bg-surface-soft/50 backdrop-blur-md">
            {navLinks.map((link) => {
              const isActive = activeSection === link.href.replace("#", "");
              return (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleClick(e, link.href)}
                  className={cn(
                    "relative px-4 py-1.5 text-sm font-medium transition-colors rounded-full z-10",
                    isActive ? "text-on-dark" : "text-body-text hover:text-ink"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeNavIndicator"
                      className="absolute inset-0 bg-ink rounded-full -z-10"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  {link.label}
                </a>
              );
            })}
          </div>

          <div className="flex items-center gap-2 mr-1">
            <ThemeToggle />
            
            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden flex items-center justify-center w-9 h-9 rounded-full bg-surface-soft text-ink transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed top-20 left-4 right-4 z-40 md:hidden glass-panel rounded-2xl p-4 flex flex-col gap-2 shadow-xl"
          >
            {navLinks.map((link) => {
              const isActive = activeSection === link.href.replace("#", "");
              return (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleClick(e, link.href)}
                  className={cn(
                    "px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 text-center",
                    isActive
                      ? "bg-ink text-on-dark"
                      : "bg-surface-soft text-ink"
                  )}
                >
                  {link.label}
                </a>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
