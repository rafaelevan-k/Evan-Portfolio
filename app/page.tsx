"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import projectPortfolioImage from "@/public/project_porto2.webp";
import { AnimatePresence, MotionConfig, motion, useMotionValue, useMotionValueEvent, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { ArrowDown, ArrowRight, ArrowUpRight, ChevronUp, Gamepad2, Menu, X } from "lucide-react";
import { SiGithub, SiGmail, SiWhatsapp } from "react-icons/si";
import { useCallback, useEffect, useRef, useState } from "react";

import { ArchiveEntranceTransition } from "@/components/archive/ArchiveEntranceTransition";
import { Entrance } from "@/components/entrance/Entrance";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

const GamifiedPortfolio = dynamic(
  () => import("@/components/gamified/GamifiedPortfolio").then((module) => module.GamifiedPortfolio),
  {
    ssr: false,
    loading: () => (
      <div className="fixed inset-0 z-[90] flex items-center justify-center bg-[#15202b] text-[#eeeae0]" role="status" aria-label="Preparing Rafael Line">
        <div className="border border-white/15 px-6 py-5 text-center">
          <p className="font-mono text-[8px] uppercase tracking-[0.25em] text-[#f2d99c]">REK Line / Yogyakarta</p>
          <p className="mt-3 font-display text-lg font-semibold uppercase tracking-[0.08em]">Preparing the Night Shift…</p>
        </div>
      </div>
    ),
  },
);

const preloadGamifiedPortfolio = () => {
  void import("@/components/gamified/GamifiedPortfolio");
};

const projects = [
  {
    title: "Sistem Informasi Inventory",
    shortTitle: "Inventory System",
    number: "01",
    role: "Full-Stack Developer",
    description: "A multi-user inventory tracking system for university data management and goods monitoring, complete with CRUD, search, filtering, and damaged-goods reporting.",
    image: "/project_inventory.webp",
    tags: ["Next.js", "TypeScript", "MySQL"],
    tone: "#D94B35",
  },
  {
    title: "CyberShark LMS",
    shortTitle: "CyberShark LMS",
    number: "02",
    role: "Frontend Developer",
    description: "A tutoring platform combining video and text learning, quiz assessments, and clear student grade tracking in one focused experience.",
    image: "/project_cybershark.webp",
    tags: ["Laravel", "CSS", "MySQL"],
    repoLink: "https://github.com/Jhonhil/cyber-shark",
    isPrivate: true,
    tone: "#26324A",
  },
  {
    title: "Sinau Matika",
    shortTitle: "Sinau Matika",
    number: "03",
    role: "Frontend Developer",
    description: "A playful, gamified mathematics learning platform built for elementary students at SD Kanisius Sorowajan.",
    image: "/project_sinaumatika.webp",
    tags: ["Vue.js", "Slim", "MySQL"],
    repoLink: "https://github.com/dedenko1/lms-b-fe",
    isPrivate: true,
    tone: "#B89A5A",
  },
  {
    title: "Portofolio",
    shortTitle: "Personal Portfolio",
    number: "04",
    role: "Frontend Developer",
    description: "A personal digital space where interaction, performance, and storytelling work together to present selected projects and experience.",
    image: projectPortfolioImage,
    tags: ["Next.js", "TypeScript", "Tailwind CSS"],
    repoLink: "https://github.com/rafaelevan-k/Evan-Portfolio",
    isPrivate: false,
    tone: "#50614A",
  },
  {
    title: "E-Catalog Maha Laptop",
    shortTitle: "Maha Laptop",
    number: "05",
    role: "Full-Stack Developer",
    description: "A laptop catalog with separate admin and customer journeys, product management, search, and a practical content workflow.",
    image: "/project_mahalaptop.webp",
    tags: ["Laravel", "Tailwind CSS", "MySQL"],
    repoLink: "https://github.com/rafaelevan-k/E-Catalog-Maha-Laptop",
    isPrivate: true,
    tone: "#77584B",
  },
  {
    title: "Yuna Personal Assistant",
    shortTitle: "Yuna AI",
    number: "06",
    role: "Full-Stack Developer",
    description: "An AI coding assistant for Laravel powered by local Deepseek Coder and Llama 3 models, with Google Web Search integration.",
    image: "/project_yuna.webp",
    tags: ["Vue.js", "Python", "Tailwind CSS"],
    repoLink: "https://github.com/rafaelevan-k/Yuna-Personal-AI-Assistant",
    isPrivate: false,
    tone: "#5E4775",
  },
];

const certifications = [
  {
    title: "Belajar Dasar Pemrograman Web",
    displayTitle: "Web Programming Fundamentals",
    issuer: "Dicoding",
    date: "2026",
    pdf: "/documents/Dicoding_Sertifikat_Belajar-Dasar-Pemrograman-Web.pdf",
    mark: "網",
  },
  {
    title: "Belajar Dasar Pemrograman JavaScript",
    displayTitle: "JavaScript Programming Fundamentals",
    issuer: "Dicoding",
    date: "2026",
    pdf: "/documents/Dicoding_Sertifikat_Belajar-Dasar-Pemrograman-JavaScript.pdf",
    mark: "動",
  },
  {
    title: "Belajar Membuat Frontend Web untuk Pemula",
    displayTitle: "Building Front-End Web for Beginners",
    issuer: "Dicoding",
    date: "2026",
    pdf: "/documents/Dicoding_Sertifikat_Belajar-Membuat-Front-End-Web-untuk-Pemula.pdf",
    mark: "形",
  },
];

const navItems = [
  { href: "#about", label: "Profile", jp: "人物" },
  { href: "#projects", label: "Works", jp: "作品" },
  { href: "#certifications", label: "Study", jp: "学習" },
  { href: "#archive", label: "Archive", jp: "記録" },
  { href: "#contact", label: "Contact", jp: "連絡" },
];

const specialties = ["Full-Stack Engineering", "Interaction Design", "AI-assisted Systems"];

const WA_NUMBER = "6282279551837";
const WA_MESSAGE = encodeURIComponent("Hello, we are interested in your portfolio and would like to contact you further...");
const WA_LINK = `https://wa.me/${WA_NUMBER}?text=${WA_MESSAGE}`;
const EMAIL_ADDRESS = "rafaelevan2005@gmail.com";
const GMAIL_SUBJECT = encodeURIComponent("Portfolio inquiry");
const GMAIL_BODY = encodeURIComponent("Hello Rafael, I found your portfolio and would like to discuss an opportunity with you.");
const GMAIL_LINK = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(EMAIL_ADDRESS)}&su=${GMAIL_SUBJECT}&body=${GMAIL_BODY}`;

export default function Home() {
  const prefersReducedMotion = useReducedMotion();
  const { scrollY, scrollYProgress } = useScroll();
  const smoothScrollY = useSpring(scrollY, {
    stiffness: 95,
    damping: 28,
    mass: 0.32,
    restDelta: 0.5,
  });
  const smoothScrollProgress = useSpring(scrollYProgress, {
    stiffness: 82,
    damping: 26,
    mass: 0.34,
    restDelta: 0.001,
  });
  const scrollTopVisibleRef = useRef(false);
  const gameModeSwitchRef = useRef<HTMLButtonElement>(null);
  const [selectedProjectIndex, setSelectedProjectIndex] = useState(0);
  const [specialtyIndex, setSpecialtyIndex] = useState(0);
  const [activeSection, setActiveSection] = useState("about");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isEnteringArchive, setIsEnteringArchive] = useState(false);
  const [isGameMode, setIsGameMode] = useState(false);
  const ambientMotionPaused = prefersReducedMotion || isGameMode;

  const cursorX = useMotionValue(-400);
  const cursorY = useMotionValue(-400);
  const smoothCursorX = useSpring(cursorX, { stiffness: 100, damping: 26, mass: 0.4 });
  const smoothCursorY = useSpring(cursorY, { stiffness: 100, damping: 26, mass: 0.4 });

  const portraitX = useMotionValue(0);
  const portraitY = useMotionValue(0);
  const portraitRotateX = useSpring(useTransform(portraitY, [-0.5, 0.5], [5, -5]), {
    stiffness: 170,
    damping: 24,
  });
  const portraitRotateY = useSpring(useTransform(portraitX, [-0.5, 0.5], [-5, 5]), {
    stiffness: 170,
    damping: 24,
  });
  const portraitShiftX = useTransform(portraitX, [-0.5, 0.5], [-12, 12]);
  const portraitShiftY = useTransform(portraitY, [-0.5, 0.5], [-12, 12]);

  const previewX = useMotionValue(0);
  const previewY = useMotionValue(0);
  const previewRotateX = useSpring(useTransform(previewY, [-0.5, 0.5], [3, -3]), {
    stiffness: 180,
    damping: 25,
  });
  const previewRotateY = useSpring(useTransform(previewX, [-0.5, 0.5], [-3, 3]), {
    stiffness: 180,
    damping: 25,
  });

  const heroTextY = useTransform(smoothScrollY, [0, 850], [0, 150]);
  const heroTextOpacity = useTransform(smoothScrollY, [0, 600], [1, 0.16]);
  const sunY = useTransform(smoothScrollProgress, [0, 1], [-120, 520]);
  const sunScale = useTransform(smoothScrollProgress, [0, 0.45, 1], [0.85, 1.08, 0.76]);
  const transitY = useTransform(smoothScrollProgress, [0, 1], [0, -340]);
  const transitRotate = useTransform(smoothScrollProgress, [0, 1], [-3, 5]);
  const verticalTypeY = useTransform(smoothScrollProgress, [0, 1], [100, -620]);
  const tickerX = useTransform(smoothScrollProgress, [0, 1], ["0%", "-35%"]);
  const archiveRotate = useTransform(smoothScrollProgress, [0.55, 0.85], [-35, 70]);
  const selectedProject = projects[selectedProjectIndex];
  const selectedProjectHref = selectedProject.repoLink ? (selectedProject.isPrivate ? `/private-repo?repo=${encodeURIComponent(selectedProject.repoLink)}` : selectedProject.repoLink) : undefined;

  useEffect(() => {
    if (prefersReducedMotion || isGameMode) return;
    const intervalId = window.setInterval(() => {
      setSpecialtyIndex((current) => (current + 1) % specialties.length);
    }, 2600);
    return () => window.clearInterval(intervalId);
  }, [isGameMode, prefersReducedMotion]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting);
        if (visible) setActiveSection(visible.target.id);
      },
      { rootMargin: "-38% 0px -52% 0px" },
    );

    navItems.forEach(({ href }) => {
      const section = document.querySelector(href);
      if (section) observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const nextVisibility = latest > 0.14;
    if (nextVisibility !== scrollTopVisibleRef.current) {
      scrollTopVisibleRef.current = nextVisibility;
      setShowScrollTop(nextVisibility);
    }
  });

  const scrollToSection = (href: string) => {
    document.querySelector(href)?.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth" });
    setMobileMenuOpen(false);
  };

  const enterGameMode = useCallback(() => {
    setMobileMenuOpen(false);
    setIsGameMode(true);
  }, []);

  const exitGameMode = useCallback(() => {
    setIsGameMode(false);
    window.requestAnimationFrame(() => gameModeSwitchRef.current?.focus());
  }, []);

  const enterArchiveFromGame = useCallback(() => {
    setIsGameMode(false);
    setIsEnteringArchive(true);
  }, []);

  const updatePointer = (event: React.PointerEvent<HTMLElement>, xValue: ReturnType<typeof useMotionValue<number>>, yValue: ReturnType<typeof useMotionValue<number>>) => {
    if (prefersReducedMotion || event.pointerType === "touch") return;
    const bounds = event.currentTarget.getBoundingClientRect();
    xValue.set((event.clientX - bounds.left) / bounds.width - 0.5);
    yValue.set((event.clientY - bounds.top) / bounds.height - 0.5);
  };

  return (
    <MotionConfig reducedMotion="user">
      <div
        className="relative isolate overflow-x-hidden bg-[#eeeae0] text-[#181816] selection:bg-[#d94b35] selection:text-white dark:bg-[#0c0c0b] dark:text-[#eeeae0]"
        onPointerMove={(event) => {
          if (isGameMode || prefersReducedMotion || event.pointerType === "touch") return;
          cursorX.set(event.clientX);
          cursorY.set(event.clientY);
        }}
      >
        <div className={isGameMode ? "invisible" : undefined} aria-hidden={isGameMode || undefined} inert={isGameMode || undefined}>
          <Entrance />
          <ArchiveEntranceTransition isTriggered={isEnteringArchive} />

        {/* Washi grain and scroll-reactive Tokyo transit field */}
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden="true">
          <div
            className="absolute inset-0 opacity-[0.04] dark:invert dark:opacity-[0.045]"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.72' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.8'/%3E%3C/svg%3E\")",
            }}
          />

          <motion.div
            style={prefersReducedMotion ? undefined : { y: sunY, scale: sunScale }}
            className="absolute -right-28 top-20 h-[28rem] w-[28rem] transform-gpu rounded-full bg-[#d94b35]/10 blur-[1px] will-change-transform dark:bg-[#d94b35]/8 md:right-[8vw] md:h-[40rem] md:w-[40rem]"
          />

          <motion.svg
            viewBox="0 0 1440 1200"
            preserveAspectRatio="xMidYMin slice"
            style={prefersReducedMotion ? undefined : { y: transitY, rotate: transitRotate }}
            className="absolute -left-[12vw] -top-20 h-[150vh] w-[125vw] transform-gpu opacity-[0.24] will-change-transform dark:opacity-[0.16]"
          >
            <path d="M-40 210 H240 Q300 210 300 270 V520 Q300 590 370 590 H820 Q890 590 890 660 V1240" fill="none" stroke="#D94B35" strokeWidth="2" />
            <path d="M180 -40 V290 Q180 350 240 350 H680 Q740 350 740 410 V840 Q740 900 800 900 H1490" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="8 14" />
            <path d="M1480 130 H1050 Q990 130 990 190 V440 Q990 500 930 500 H560 Q500 500 500 560 V1220" fill="none" stroke="#26324A" strokeWidth="2" />
            <g fill="#EEEAE0" stroke="#D94B35" strokeWidth="2">
              {[
                [180, 210],
                [300, 350],
                [300, 590],
                [500, 590],
                [740, 590],
                [890, 660],
                [990, 500],
                [740, 900],
                [500, 840],
              ].map(([cx, cy], index) => (
                <circle key={index} cx={cx} cy={cy} r={index % 3 === 0 ? 8 : 5} />
              ))}
            </g>
          </motion.svg>

          <motion.p
            style={prefersReducedMotion ? undefined : { y: verticalTypeY }}
            className="absolute right-4 top-[80vh] hidden transform-gpu text-[clamp(4rem,9vw,9rem)] font-semibold leading-none tracking-[-0.08em] text-[#181816]/[0.035] will-change-transform [writing-mode:vertical-rl] dark:text-white/[0.035] md:block"
          >
            設計・開発・体験
          </motion.p>
        </div>

        <motion.div
          aria-hidden="true"
          style={prefersReducedMotion ? undefined : { x: smoothCursorX, y: smoothCursorY }}
          className="fixed -left-48 -top-48 z-[1] hidden h-96 w-96 transform-gpu rounded-full bg-[radial-gradient(circle,rgba(217,75,53,0.11),transparent_66%)] pointer-events-none will-change-transform lg:block"
        />

        <motion.div className="fixed inset-x-0 top-0 z-[80] h-[3px] origin-left transform-gpu bg-[#d94b35] will-change-transform" style={{ scaleX: smoothScrollProgress }} />

        {/* Navigation */}
        <header className="fixed inset-x-0 top-0 z-[70] px-4 pt-4 sm:px-6">
          <div className="mx-auto flex max-w-7xl items-center justify-between border border-black/10 bg-[#eeeae0]/85 px-4 py-3 shadow-[0_10px_40px_rgba(24,24,22,0.06)] backdrop-blur-xl dark:border-white/10 dark:bg-[#0c0c0b]/85">
            <button type="button" onClick={() => scrollToSection("#about")} className="group flex items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d94b35]">
              <span className="flex h-9 w-9 items-center justify-center bg-[#d94b35] text-sm font-bold text-white transition-transform duration-300 group-hover:rotate-6">礼</span>
              <span className="text-left leading-none">
                <span className="block font-display text-sm font-semibold tracking-tight">RAFAEL EVAN KRISTANTO</span>
                <span className="mt-1 block font-mono text-[8px] uppercase tracking-[0.24em] opacity-50">Full-Stack Developer</span>
              </span>
            </button>

            <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary navigation">
              {navItems.map((item) => {
                const active = activeSection === item.href.slice(1);
                return (
                  <button
                    type="button"
                    key={item.href}
                    onClick={() => scrollToSection(item.href)}
                    aria-current={active ? "page" : undefined}
                    className={`group relative px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d94b35] ${active ? "text-[#d94b35]" : "opacity-55 hover:opacity-100"}`}
                  >
                    <span className="mr-2 font-normal opacity-50">{item.jp}</span>
                    {item.label}
                    <span className={`absolute inset-x-4 -bottom-0.5 h-px origin-left bg-[#d94b35] transition-transform duration-300 ${active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"}`} />
                  </button>
                );
              })}
            </nav>

            <div className="flex items-center gap-1">
              <button
                ref={gameModeSwitchRef}
                type="button"
                role="switch"
                aria-checked={isGameMode}
                aria-label="Enter Rafael Line Night Shift mode"
                onPointerEnter={preloadGamifiedPortfolio}
                onPointerDown={preloadGamifiedPortfolio}
                onFocus={preloadGamifiedPortfolio}
                onClick={enterGameMode}
                className="group mr-1 flex h-9 items-center gap-2 border border-black/12 px-2 text-[8px] font-semibold uppercase tracking-[0.14em] transition-colors hover:border-[#d94b35]/55 hover:bg-[#d94b35]/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d94b35] dark:border-white/15 dark:hover:bg-white/5 sm:px-2.5"
              >
                <Gamepad2 className="h-4 w-4 text-[#d94b35]" />
                <span className="hidden xl:inline">Night Shift</span>
                <span className="relative h-4 w-7 bg-black/12 transition-colors group-hover:bg-black/20 dark:bg-white/15 dark:group-hover:bg-white/25">
                  <span className="absolute left-0.5 top-0.5 h-3 w-3 bg-[#181816] transition-transform dark:bg-[#eeeae0]" />
                </span>
              </button>
              <ThemeToggle className="rounded-none hover:bg-black/5 dark:hover:bg-white/10" />
              <button
                type="button"
                aria-label="Toggle menu"
                aria-expanded={mobileMenuOpen}
                onClick={() => setMobileMenuOpen((open) => !open)}
                className="flex h-9 w-9 items-center justify-center border-l border-black/10 lg:hidden dark:border-white/10"
              >
                {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.nav
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="mx-auto mt-2 grid max-w-7xl border border-black/10 bg-[#eeeae0]/95 p-2 backdrop-blur-xl dark:border-white/10 dark:bg-[#0c0c0b]/95 lg:hidden"
              >
                {navItems.map((item) => (
                  <button key={item.href} type="button" onClick={() => scrollToSection(item.href)} className="flex items-center justify-between border-b border-black/10 px-4 py-3 text-left text-sm last:border-0 dark:border-white/10">
                    <span>{item.label}</span>
                    <span className="text-[#d94b35]">{item.jp}</span>
                  </button>
                ))}
              </motion.nav>
            )}
          </AnimatePresence>
        </header>

        {/* Hero */}
        <section id="about" className="relative z-10 flex min-h-screen items-center px-6 pb-16 pt-32 lg:px-10">
          <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-14 lg:grid-cols-12 lg:gap-8">
            <motion.div style={{ y: heroTextY, opacity: heroTextOpacity }} className="relative z-10 lg:col-span-7">
              <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }} className="mb-8 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.28em]">
                <span className="h-px w-10 bg-[#d94b35]" />
                <span>Yogyakarta · Indonesia</span>
              </motion.div>

              <h1 className="font-display text-[clamp(4rem,10vw,9.5rem)] font-semibold uppercase leading-[0.78] tracking-[-0.075em]">
                <motion.span initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }} className="block">
                  Rafael
                </motion.span>
                <motion.span initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.08, duration: 0.8, ease: [0.22, 1, 0.36, 1] }} className="ml-[0.18em] block text-[#d94b35]">
                  Evan
                </motion.span>
              </h1>

              <div className="mt-10 grid gap-8 border-t border-black/15 pt-6 dark:border-white/15 sm:grid-cols-[1fr_auto] sm:items-end">
                <div>
                  <p className="max-w-xl text-base leading-relaxed opacity-65 md:text-lg">Information Systems student crafting useful digital products with a sharp frontend eye, full-stack thinking, and deliberate motion.</p>
                  <button
                    type="button"
                    onClick={() => setSpecialtyIndex((current) => (current + 1) % specialties.length)}
                    className="mt-5 flex items-center gap-3 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d94b35]"
                    aria-label="Show next specialty"
                  >
                    <span className="font-mono text-[9px] uppercase tracking-[0.2em] opacity-45">Current focus</span>
                    <span className="h-4 w-px bg-[#d94b35]" />
                    <span className="min-w-[150px] text-left text-[#d94b35]" aria-live="polite">
                      <AnimatePresence mode="wait" initial={false}>
                        <motion.span key={specialties[specialtyIndex]} initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -8, opacity: 0 }} transition={{ duration: prefersReducedMotion ? 0 : 0.2 }} className="block">
                          {specialties[specialtyIndex]}
                        </motion.span>
                      </AnimatePresence>
                    </span>
                  </button>
                </div>

                <button type="button" onClick={() => scrollToSection("#projects")} className="group flex items-center gap-3 justify-self-start text-xs font-semibold uppercase tracking-[0.18em] sm:justify-self-end">
                  Explore works
                  <span className="flex h-12 w-12 items-center justify-center rounded-full border border-black/20 transition-all duration-300 group-hover:border-[#d94b35] group-hover:bg-[#d94b35] group-hover:text-white dark:border-white/20">
                    <ArrowDown className="h-4 w-4 transition-transform duration-300 group-hover:translate-y-1" />
                  </span>
                </button>
              </div>
            </motion.div>

            <div className="relative mx-auto w-full max-w-lg lg:col-span-5 lg:mx-0 lg:justify-self-end">
              <div className="absolute -left-7 top-1/2 z-20 hidden -translate-y-1/2 text-[10px] tracking-[0.4em] opacity-50 [writing-mode:vertical-rl] sm:block">インターフェースを設計する</div>
              <motion.div
                onPointerMove={(event) => updatePointer(event, portraitX, portraitY)}
                onPointerLeave={() => {
                  portraitX.set(0);
                  portraitY.set(0);
                }}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                style={{ perspective: 1000 }}
                className="relative aspect-[4/5] cursor-crosshair"
              >
                <motion.div
                  style={prefersReducedMotion ? undefined : { rotateX: portraitRotateX, rotateY: portraitRotateY }}
                  className="absolute inset-[8%] overflow-hidden bg-[#181816] [clip-path:polygon(13%_0,100%_0,100%_88%,87%_100%,0_100%,0_13%)]"
                >
                  <motion.div style={prefersReducedMotion ? undefined : { x: portraitShiftX, y: portraitShiftY }} className="absolute -inset-4">
                    <Image src="/foto-profil.webp" alt="Rafael Evan Kristanto" fill priority className="object-cover grayscale-[18%] contrast-[1.04]" />
                  </motion.div>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#181816]/50 via-transparent to-transparent" />
                  <div className="absolute bottom-5 left-5 font-mono text-[9px] uppercase tracking-[0.2em] text-white/70">Portrait / 2026</div>
                </motion.div>

                <motion.svg
                  viewBox="0 0 400 400"
                  animate={ambientMotionPaused ? undefined : { rotate: 360 }}
                  transition={{ duration: 34, ease: "linear", repeat: Infinity }}
                  className="absolute inset-0 h-full w-full overflow-visible text-[#d94b35]"
                >
                  <circle cx="200" cy="200" r="178" fill="none" stroke="currentColor" strokeWidth="7" strokeLinecap="round" pathLength="150" strokeDasharray="118 32" opacity="0.9" />
                  <circle cx="200" cy="200" r="190" fill="none" stroke="currentColor" strokeWidth="1" pathLength="150" strokeDasharray="2 8" opacity="0.45" />
                </motion.svg>

                <motion.div
                  animate={ambientMotionPaused ? undefined : { y: [0, -8, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute right-0 top-[12%] bg-[#d94b35] px-3 py-5 text-xs font-semibold tracking-[0.25em] text-white [writing-mode:vertical-rl]"
                >
                  創造する
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Scroll-linked ticker */}
        <div className="relative z-20 overflow-hidden border-y border-black/15 bg-[#181816] py-4 text-[#eeeae0] dark:border-white/15" aria-hidden="true">
          <motion.div style={prefersReducedMotion ? undefined : { x: tickerX }} className="flex w-max transform-gpu items-center gap-7 whitespace-nowrap font-display text-sm font-semibold uppercase tracking-[0.28em] will-change-transform">
            {[...Array(3)].flatMap((_, repeat) =>
              ["Frontend Engineering", "Motion with purpose", "Full-stack thinking", "設計と開発", "Yogyakarta / 2026"].map((item) => (
                <span key={`${repeat}-${item}`} className="flex items-center gap-7">
                  {item}
                  <span className="text-[#d94b35]">●</span>
                </span>
              )),
            )}
          </motion.div>
        </div>

        {/* Selected works */}
        <section id="projects" className="relative z-10 px-6 py-28 lg:px-10 lg:py-40">
          <div className="mx-auto max-w-7xl">
            <div className="mb-16 grid gap-8 lg:grid-cols-12 lg:items-end">
              <div className="lg:col-span-8">
                <p className="mb-5 font-mono text-[10px] uppercase tracking-[0.3em] text-[#d94b35]">作品集 / Selected works</p>
                <h2 className="font-display text-[clamp(3.5rem,8vw,7.5rem)] font-semibold uppercase leading-[0.82] tracking-[-0.065em]">
                  Proof in
                  <br />
                  the making
                </h2>
              </div>
              <p className="max-w-md border-l border-[#d94b35] pl-5 text-sm leading-relaxed opacity-60 lg:col-span-4">Choose a project from the index. Each piece records a different problem, role, and technical approach.</p>
            </div>

            <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
              <div className="lg:col-span-4">
                <div className="border-t border-black/20 dark:border-white/20" role="list" aria-label="Project index">
                  {projects.map((project, index) => {
                    const active = selectedProjectIndex === index;
                    return (
                      <motion.button
                        layout
                        type="button"
                        key={project.title}
                        onClick={() => setSelectedProjectIndex(index)}
                        onFocus={() => setSelectedProjectIndex(index)}
                        aria-pressed={active}
                        whileHover={prefersReducedMotion ? undefined : { x: 8 }}
                        className={`group grid w-full grid-cols-[2.5rem_1fr_auto] items-center gap-2 border-b border-black/20 py-5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#d94b35] dark:border-white/20 ${active ? "text-[#d94b35]" : "opacity-55 hover:opacity-100"}`}
                      >
                        <span className="font-mono text-[9px]">{project.number}</span>
                        <span className="font-display text-base font-semibold">{project.shortTitle}</span>
                        <motion.span animate={{ rotate: active ? 45 : 0 }}>
                          <ArrowRight className="h-4 w-4" />
                        </motion.span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              <div className="lg:col-span-8">
                <AnimatePresence mode="wait">
                  <motion.article key={selectedProject.title} initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: prefersReducedMotion ? 0 : 0.38, ease: [0.22, 1, 0.36, 1] }}>
                    <motion.div
                      onPointerMove={(event) => updatePointer(event, previewX, previewY)}
                      onPointerLeave={() => {
                        previewX.set(0);
                        previewY.set(0);
                      }}
                      style={{ perspective: 1100 }}
                      className="relative mb-8 aspect-[16/10]"
                    >
                      <motion.div
                        style={prefersReducedMotion ? undefined : { rotateX: previewRotateX, rotateY: previewRotateY }}
                        className="absolute inset-0 overflow-hidden bg-[#181816] shadow-[0_30px_80px_rgba(24,24,22,0.14)] [clip-path:polygon(0_0,94%_0,100%_10%,100%_100%,6%_100%,0_90%)]"
                      >
                        <Image src={selectedProject.image} alt={selectedProject.title} fill className="object-cover transition-transform duration-700 hover:scale-[1.03]" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                        <div className="absolute left-5 top-5 flex items-center gap-2 bg-[#eeeae0] px-3 py-2 font-mono text-[9px] uppercase tracking-[0.18em] text-[#181816]">
                          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: selectedProject.tone }} />
                          Case {selectedProject.number} / 06
                        </div>
                      </motion.div>
                    </motion.div>

                    <div className="grid gap-8 md:grid-cols-[1.35fr_0.65fr]">
                      <div>
                        <p className="mb-3 font-mono text-[9px] uppercase tracking-[0.22em] text-[#d94b35]">{selectedProject.role}</p>
                        <h3 className="font-display text-3xl font-semibold tracking-tight md:text-5xl">{selectedProject.title}</h3>
                        <p className="mt-5 max-w-2xl text-sm leading-7 opacity-60 md:text-base">{selectedProject.description}</p>
                      </div>
                      <div className="flex flex-col items-start justify-between gap-8 border-l border-black/15 pl-5 dark:border-white/15">
                        <div className="flex flex-wrap gap-x-4 gap-y-2">
                          {selectedProject.tags.map((tag) => (
                            <span key={tag} className="font-mono text-[9px] uppercase tracking-[0.16em] opacity-55">
                              {tag}
                            </span>
                          ))}
                        </div>
                        {selectedProjectHref && (
                          <a
                            href={selectedProjectHref}
                            target={selectedProject.isPrivate ? undefined : "_blank"}
                            rel={selectedProject.isPrivate ? undefined : "noopener noreferrer"}
                            className="group inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em]"
                          >
                            View repository
                            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#181816] text-[#eeeae0] transition-transform group-hover:-translate-y-1 group-hover:translate-x-1 dark:bg-[#eeeae0] dark:text-[#181816]">
                              <ArrowUpRight className="h-4 w-4" />
                            </span>
                          </a>
                        )}
                      </div>
                    </div>
                  </motion.article>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </section>

        {/* Certifications */}
        <section id="certifications" className="relative z-10 border-y border-black/15 bg-[#e5dfd2]/80 px-6 py-28 dark:border-white/15 dark:bg-[#151512]/90 lg:px-10 lg:py-36">
          <div className="mx-auto max-w-7xl">
            <div className="mb-16 flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <div>
                <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.3em] text-[#d94b35]">学習 / Continuous study</p>
                <h2 className="font-display text-5xl font-semibold uppercase tracking-[-0.055em] md:text-7xl">
                  Certification
                  <br />
                  marks
                </h2>
              </div>
              <p className="max-w-sm text-sm leading-relaxed opacity-55">Formal checkpoints in an ongoing practice of learning, testing, and making.</p>
            </div>

            <div className="grid border-t border-black/20 dark:border-white/20 md:grid-cols-3">
              {certifications.map((certificate, index) => (
                <motion.a
                  key={certificate.title}
                  href={certificate.pdf}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ delay: index * 0.08, duration: 0.5 }}
                  whileHover={prefersReducedMotion ? undefined : { y: -10 }}
                  className="group relative min-h-80 overflow-hidden border-b border-black/20 p-7 transition-colors hover:bg-[#eeeae0]/70 dark:border-white/20 dark:hover:bg-white/[0.03] md:border-r"
                >
                  <div className="flex items-start justify-between">
                    <span className="font-mono text-[9px] uppercase tracking-[0.2em] opacity-45">Certificate / 0{index + 1}</span>
                    <span className="flex h-14 w-14 rotate-3 items-center justify-center border-2 border-[#d94b35] font-display text-2xl font-semibold text-[#d94b35] transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110">
                      {certificate.mark}
                    </span>
                  </div>
                  <div className="absolute inset-x-7 bottom-7">
                    <h3 className="max-w-xs font-display text-2xl font-semibold leading-tight">{certificate.title}</h3>
                    <div className="mt-6 flex items-center justify-between border-t border-black/15 pt-4 text-xs dark:border-white/15">
                      <span>{certificate.issuer}</span>
                      <span className="font-mono opacity-45">{certificate.date}</span>
                    </div>
                  </div>
                  <ArrowUpRight className="absolute right-7 top-1/2 h-5 w-5 translate-y-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100" />
                </motion.a>
              ))}
            </div>
          </div>
        </section>

        {/* Archive portal */}
        <section id="archive" className="relative z-10 overflow-hidden bg-[#181816] px-6 py-32 text-[#eeeae0] lg:px-10 lg:py-48">
          <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(to_right,#eeeae0_1px,transparent_1px),linear-gradient(to_bottom,#eeeae0_1px,transparent_1px)] [background-size:64px_64px]" />
          <div className="absolute left-1/2 top-1/2 h-[38rem] w-[38rem] -translate-x-1/2 -translate-y-1/2 md:h-[52rem] md:w-[52rem]">
            <motion.div style={prefersReducedMotion ? undefined : { rotate: archiveRotate }} className="relative h-full w-full transform-gpu rounded-full border border-dashed border-white/20 will-change-transform">
              <span className="absolute left-1/2 top-0 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#d94b35]" />
            </motion.div>
          </div>

          <div className="relative mx-auto flex max-w-5xl flex-col items-center text-center">
            <p className="mb-7 font-mono text-[10px] uppercase tracking-[0.35em] text-[#d94b35]">記録保管所 / The archive</p>
            <h2 className="font-display text-[clamp(4rem,11vw,10rem)] font-semibold uppercase leading-[0.78] tracking-[-0.075em]">
              Enter the
              <br />
              unknown
            </h2>
            <p className="mt-10 max-w-xl text-sm leading-7 text-white/50 md:text-base">Step into an interactive 3D room containing my CV, detailed credentials, organizational work, volunteer activities, and awards.</p>
            <motion.button
              type="button"
              onClick={() => setIsEnteringArchive(true)}
              whileHover={prefersReducedMotion ? undefined : { scale: 1.06, rotate: -2 }}
              whileTap={{ scale: 0.96 }}
              className="group mt-12 flex h-36 w-36 items-center justify-center rounded-full bg-[#d94b35] text-center text-xs font-semibold uppercase tracking-[0.18em] text-white shadow-[0_0_0_0_rgba(217,75,53,0.3)] transition-shadow duration-500 hover:shadow-[0_0_0_22px_rgba(217,75,53,0.12)]"
            >
              Enter
              <br />
              archive
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </motion.button>
          </div>
        </section>

        {/* Contact */}
        <section id="contact" className="relative z-10 px-6 py-28 lg:px-10 lg:py-40">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-14 lg:grid-cols-12">
              <div className="lg:col-span-8">
                <p className="mb-5 font-mono text-[10px] uppercase tracking-[0.3em] text-[#d94b35]">連絡 / Contact</p>
                <h2 className="font-display text-[clamp(4.5rem,10vw,9rem)] font-semibold uppercase leading-[0.78] tracking-[-0.075em]">
                  Let&apos;s make
                  <br />
                  <span className="text-[#d94b35]">it real</span>
                </h2>
              </div>
              <div className="flex flex-col justify-end lg:col-span-4">
                <p className="mb-8 text-sm leading-7 opacity-60">Have a role, project, or idea worth exploring? Send a message and tell me what you are building.</p>
                <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="group flex items-center justify-between border-y border-black/20 py-5 dark:border-white/20">
                  <span className="flex items-center gap-3">
                    <SiWhatsapp className="h-5 w-5 text-[#d94b35]" />
                    <span className="font-semibold">WhatsApp</span>
                  </span>
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
                </a>
                <a
                  href={GMAIL_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Compose an email to ${EMAIL_ADDRESS} in Gmail`}
                  className="group flex items-center justify-between border-b border-black/20 py-5 dark:border-white/20"
                >
                  <span className="flex items-center gap-3">
                    <SiGmail className="h-5 w-5 text-[#d94b35]" />
                    <span>
                      <span className="block font-semibold">Gmail</span>
                      <span className="mt-1 block font-mono text-[9px] tracking-[0.08em] opacity-55">{EMAIL_ADDRESS}</span>
                    </span>
                  </span>
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
                </a>
                <a href="https://github.com/rafaelevan-k" target="_blank" rel="noopener noreferrer" className="group flex items-center justify-between border-b border-black/20 py-5 dark:border-white/20">
                  <span className="flex items-center gap-3">
                    <SiGithub className="h-5 w-5" />
                    <span className="font-semibold">GitHub</span>
                  </span>
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
                </a>
              </div>
            </div>

            <div className="mt-28 flex flex-col justify-between gap-5 border-t border-black/20 pt-6 font-mono text-[9px] uppercase tracking-[0.2em] opacity-50 dark:border-white/20 sm:flex-row">
              <span>Rafael Evan Kristanto © {new Date().getFullYear()}</span>
              <span>Designed &amp; engineered in Yogyakarta</span>
              <span>07.7697° S / 110.2939° E</span>
            </div>
          </div>
        </section>

        <AnimatePresence>
          {showScrollTop && (
            <motion.button
              type="button"
              aria-label="Back to top"
              onClick={() => window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" })}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              whileHover={prefersReducedMotion ? undefined : { y: -5 }}
              className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center border border-black/15 bg-[#eeeae0]/90 shadow-lg backdrop-blur-lg dark:border-white/15 dark:bg-[#181816]/90"
            >
              <ChevronUp className="h-4 w-4" />
            </motion.button>
          )}
        </AnimatePresence>
        </div>

        <AnimatePresence>
          {isGameMode && (
            <GamifiedPortfolio
              projects={projects}
              certifications={certifications}
              whatsappLink={WA_LINK}
              emailAddress={EMAIL_ADDRESS}
              onExit={exitGameMode}
              onEnterArchive={enterArchiveFromGame}
            />
          )}
        </AnimatePresence>
      </div>
    </MotionConfig>
  );
}
