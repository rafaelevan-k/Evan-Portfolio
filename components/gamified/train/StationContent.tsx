"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Archive as ArchiveIcon,
  ArrowRight,
  ArrowUpRight,
  Award,
  BookOpen,
  Check,
  FileText,
  MapPin,
  Radio,
  Send,
  Users,
} from "lucide-react";
import Image from "next/image";
import { memo, useMemo, useState } from "react";
import { SiGithub, SiGmail, SiWhatsapp } from "react-icons/si";

import type { GameCertification, GameProject, TrainStation } from "./types";

type StationContentProps = {
  station: TrainStation;
  projects: GameProject[];
  certifications: GameCertification[];
  whatsappLink: string;
  emailAddress: string;
  onEnterArchive: () => void;
};

type FocusId = "systems" | "interaction" | "ai";

const focusLenses: ReadonlyArray<{
  id: FocusId;
  label: string;
  description: string;
}> = [
  {
    id: "systems",
    label: "Full-Stack Systems",
    description: "Interfaces, application logic, and data models shaped into one dependable workflow.",
  },
  {
    id: "interaction",
    label: "Interface and Interaction",
    description: "Clear journeys, purposeful motion, and frontend details that help people stay oriented.",
  },
  {
    id: "ai",
    label: "AI-Assisted Products",
    description: "Local models and useful automation applied to practical developer-facing tools.",
  },
];

const englishCertificateTitles: Record<string, string> = {
  "Belajar Dasar Pemrograman Web": "Web Programming Fundamentals",
  "Belajar Dasar Pemrograman JavaScript": "JavaScript Programming Fundamentals",
  "Belajar Membuat Front-End Web untuk Pemula": "Building Front-End Web for Beginners",
};

const contactPurposes = [
  {
    id: "role",
    label: "A role",
    message: "Hello Rafael, I found your portfolio and would like to discuss a role with you.",
  },
  {
    id: "website",
    label: "A website",
    message: "Hello Rafael, I found your portfolio and would like to discuss a website project with you.",
  },
  {
    id: "product",
    label: "A product idea",
    message: "Hello Rafael, I found your portfolio and would like to discuss a product idea with you.",
  },
] as const;

type ContactPurpose = (typeof contactPurposes)[number]["id"];

const archiveGroups = [
  { title: "Curriculum Vitae", detail: "1 document", icon: FileText },
  { title: "Certifications", detail: "3 documents", icon: BookOpen },
  { title: "Volunteer and Organization", detail: "3 documents", icon: Users },
  { title: "Awards", detail: "1 document", icon: Award },
] as const;

function getProjectHref(project: GameProject) {
  if (!project.repoLink) return undefined;
  return project.isPrivate
    ? `/private-repo?repo=${encodeURIComponent(project.repoLink)}`
    : project.repoLink;
}

function getCertificateTitle(certificate: GameCertification) {
  return certificate.displayTitle ?? englishCertificateTitles[certificate.title] ?? "Web Development Credential";
}

function getCertificateCode(title: string) {
  const normalizedTitle = title.toLowerCase();
  if (normalizedTitle.includes("javascript")) return "JS";
  if (normalizedTitle.includes("front-end") || normalizedTitle.includes("frontend")) return "FE";
  return "WEB";
}

function getFocusProjects(focus: FocusId, projects: GameProject[]) {
  if (focus === "systems") {
    return projects.filter((project) => project.role.toLowerCase().includes("full-stack"));
  }

  if (focus === "ai") {
    return projects.filter(
      (project) =>
        project.shortTitle.toLowerCase().includes("yuna") ||
        project.tags.some((tag) => tag.toLowerCase() === "python"),
    );
  }

  return projects.filter(
    (project) =>
      project.role.toLowerCase().includes("frontend") ||
      project.shortTitle.toLowerCase().includes("portfolio"),
  );
}

function buildWhatsappLink(whatsappLink: string, message: string) {
  try {
    const url = new URL(whatsappLink);
    url.searchParams.set("text", message);
    return url.toString();
  } catch {
    const baseLink = whatsappLink.split("?")[0];
    return `${baseLink}?text=${encodeURIComponent(message)}`;
  }
}

function buildGmailLink(emailAddress: string, subject: string, message: string) {
  const params = new URLSearchParams({
    view: "cm",
    fs: "1",
    to: emailAddress,
    su: subject,
    body: message,
  });

  return `https://mail.google.com/mail/?${params.toString()}`;
}

function StationHeading({ station, title, copy }: { station: TrainStation; title: string; copy: string }) {
  return (
    <div className="mb-8 grid gap-6 border-b border-black/20 pb-7 lg:grid-cols-[minmax(0,1fr)_minmax(17rem,0.38fr)] lg:items-end">
      <div>
        <div className="mb-4 flex flex-wrap items-center gap-2 font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-black/65 sm:text-[11px]">
          <span className="px-2.5 py-1.5 text-white" style={{ backgroundColor: station.accent }}>
            {station.code}
          </span>
          <span>{station.platform}</span>
          <span aria-hidden="true" className="text-black/30">/</span>
          <span>{station.name}</span>
          <span aria-hidden="true" className="text-black/30">/</span>
          <span>{station.label}</span>
          <span className="border border-black/20 px-2 py-1 text-black/70">{station.xp} XP</span>
        </div>
        <h2
          id={`train-station-${station.id}`}
          className="max-w-4xl font-display text-[clamp(2.8rem,7vw,6.5rem)] font-semibold uppercase leading-[0.82] tracking-[-0.065em]"
        >
          {title}
        </h2>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-black/65 sm:text-base">{copy}</p>
      </div>

      <div className="border-l-2 pl-4" style={{ borderColor: station.accent }}>
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-black/55">Shift objective</p>
        <p className="mt-2 text-sm leading-6 text-black/70">{station.objective}</p>
      </div>
    </div>
  );
}

function ProfileStation({ station, projects }: { station: TrainStation; projects: GameProject[] }) {
  const reducedMotion = useReducedMotion() ?? false;
  const [activeFocus, setActiveFocus] = useState<FocusId>("systems");
  const selectedLens = focusLenses.find((lens) => lens.id === activeFocus) ?? focusLenses[0];
  const evidenceProjects = useMemo(() => getFocusProjects(activeFocus, projects), [activeFocus, projects]);

  return (
    <>
      <StationHeading
        station={station}
        title="Meet the operator."
        copy="Rafael combines an Information Systems foundation with a sharp frontend eye, full-stack thinking, and deliberate interaction."
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(17rem,0.72fr)_minmax(0,1.28fr)]">
        <div className="relative min-h-80 overflow-hidden bg-[#181816] [clip-path:polygon(0_0,92%_0,100%_9%,100%_100%,8%_100%,0_91%)] lg:min-h-[34rem]">
          <Image
            src="/foto-profil.webp"
            alt="Portrait of Rafael Evan Kristanto"
            fill
            loading="lazy"
            quality={76}
            className="object-cover grayscale-[12%]"
            sizes="(max-width: 1024px) 100vw, 38vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
          <span className="absolute bottom-5 left-5 font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-white/80">
            Rafael / Yogyakarta
          </span>
        </div>

        <div className="flex min-w-0 flex-col gap-6">
          <div className="border border-black/20 bg-[#e4dccf] p-5 sm:p-6">
            <div className="flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-black/65">
              <MapPin className="h-4 w-4 text-[#d94b35]" /> Yogyakarta, Indonesia
            </div>
            <p className="mt-5 max-w-3xl font-display text-2xl font-semibold leading-tight sm:text-3xl lg:text-4xl">
              Building useful digital products where technical structure and human experience meet.
            </p>
            <p className="mt-5 max-w-3xl text-sm leading-7 text-black/70 sm:text-base">
              Explore a focus lens to see which shipped projects provide the evidence. Every connection below comes from the work shown on this line.
            </p>
          </div>

          <div>
            <p className="mb-3 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-black/60">Choose a focus lens</p>
            <div className="grid gap-2 sm:grid-cols-3" aria-label="Rafael's focus lenses">
              {focusLenses.map((lens) => {
                const selected = lens.id === activeFocus;
                return (
                  <button
                    key={lens.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setActiveFocus(lens.id)}
                    className={`min-h-12 border px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.11em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d94b35] focus-visible:ring-offset-2 focus-visible:ring-offset-[#eee8dc] ${
                      selected
                        ? "border-[#181816] bg-[#181816] text-white"
                        : "border-black/20 bg-transparent text-black/70 hover:bg-black/[0.045]"
                    }`}
                  >
                    {lens.label}
                  </button>
                );
              })}
            </div>
          </div>

          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={selectedLens.id}
              initial={{ opacity: 0, y: reducedMotion ? 0 : 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: reducedMotion ? 0 : -6 }}
              transition={{ duration: reducedMotion ? 0 : 0.2 }}
              className="border-l-4 bg-[#f4eee3] p-5 sm:p-6"
              style={{ borderColor: station.accent }}
              aria-live="polite"
            >
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-black/55">Active lens</p>
              <h3 className="mt-2 font-display text-2xl font-semibold">{selectedLens.label}</h3>
              <p className="mt-3 text-sm leading-6 text-black/70 sm:text-base">{selectedLens.description}</p>
              <div className="mt-5 flex flex-wrap gap-2" aria-label="Projects connected to this focus">
                {evidenceProjects.map((project) => (
                  <span key={project.number} className="border border-black/20 bg-white/45 px-3 py-2 text-xs font-medium text-black/75">
                    {project.shortTitle}
                  </span>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="grid grid-cols-3 border-y border-black/20 py-5 text-center">
            <div>
              <strong className="block font-display text-2xl">{projects.length}</strong>
              <span className="font-mono text-[10px] font-medium uppercase tracking-[0.13em] text-black/60">Projects</span>
            </div>
            <div className="border-x border-black/20 px-2">
              <strong className="block font-display text-2xl">3</strong>
              <span className="font-mono text-[10px] font-medium uppercase tracking-[0.13em] text-black/60">Focus lanes</span>
            </div>
            <div>
              <strong className="block font-display text-2xl">2026</strong>
              <span className="font-mono text-[10px] font-medium uppercase tracking-[0.13em] text-black/60">Current log</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function SignalBoard({ project, dispatchRun, isDispatching, onDelivered }: {
  project: GameProject;
  dispatchRun: number;
  isDispatching: boolean;
  onDelivered: () => void;
}) {
  const reducedMotion = useReducedMotion() ?? false;
  const isFullStack = project.role.toLowerCase().includes("full-stack");
  const roleY = isFullStack ? 88 : 192;
  const routePath = `M 54 140 C 128 140 148 ${roleY} 220 ${roleY} C 302 ${roleY} 320 140 400 140 H 706`;
  const signalPoints = [
    { x: 54, y: 140 },
    { x: 220, y: roleY },
    { x: 400, y: 140 },
    { x: 558, y: 140 },
    { x: 706, y: 140 },
  ];

  return (
    <div
      className="relative overflow-hidden border border-white/15 bg-[#142332] p-4 text-white sm:p-6"
      style={{
        backgroundImage:
          "linear-gradient(rgba(242,217,156,0.055) 1px, transparent 1px), linear-gradient(90deg, rgba(242,217,156,0.055) 1px, transparent 1px)",
        backgroundSize: "28px 28px",
      }}
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-[#f2d99c]">Live signal board</p>
        <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/65">Route {project.number} / Project Yard</p>
      </div>

      <svg
        viewBox="0 0 760 280"
        className="h-auto w-full"
        role="img"
        aria-labelledby="signal-board-title signal-board-description"
      >
        <title id="signal-board-title">Signal route for {project.shortTitle}</title>
        <desc id="signal-board-description">
          The route connects Rafael to the {project.role} track and the technologies {project.tags.join(", ")}.
        </desc>

        <path d="M 54 140 C 128 140 148 88 220 88 C 302 88 320 140 400 140 H 706" fill="none" stroke="rgba(255,255,255,0.13)" strokeWidth="3" />
        <path d="M 54 140 C 128 140 148 192 220 192 C 302 192 320 140 400 140 H 706" fill="none" stroke="rgba(255,255,255,0.13)" strokeWidth="3" />
        <path d={routePath} fill="none" stroke={project.tone} strokeWidth="6" strokeLinecap="round" opacity="0.85" />

        {isDispatching && (
          <motion.path
            key={`route-${dispatchRun}`}
            d={routePath}
            fill="none"
            stroke="#F2D99C"
            strokeWidth="7"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0.9 }}
            animate={{ pathLength: 1, opacity: [0.9, 1, 0.45] }}
            transition={{ duration: reducedMotion ? 0.01 : 0.82, ease: [0.22, 1, 0.36, 1] }}
          />
        )}

        <circle cx="54" cy="140" r="15" fill="#D94B35" stroke="#F2D99C" strokeWidth="4" />
        <circle cx="220" cy={roleY} r="13" fill="#142332" stroke={project.tone} strokeWidth="5" />
        {[400, 558].map((x) => (
          <circle key={x} cx={x} cy="140" r="10" fill="#142332" stroke="#F2D99C" strokeWidth="3" />
        ))}
        <rect x="686" y="120" width="40" height="40" fill="#F2D99C" stroke="#D94B35" strokeWidth="4" />

        {isDispatching && (
          <motion.circle
            key={`pulse-${dispatchRun}`}
            r="8"
            fill="#FFFFFF"
            initial={{ cx: signalPoints[0].x, cy: signalPoints[0].y, opacity: 0 }}
            animate={{
              cx: signalPoints.map((point) => point.x),
              cy: signalPoints.map((point) => point.y),
              opacity: [0, 1, 1, 1, 0],
            }}
            transition={{ duration: reducedMotion ? 0.01 : 0.82, ease: "linear" }}
            onAnimationComplete={onDelivered}
          />
        )}

        <g className="hidden sm:block" fill="rgba(255,255,255,0.72)" fontSize="12" fontFamily="ui-monospace, monospace" letterSpacing="1.2">
          <text x="24" y="184">RAFAEL</text>
          <text x="174" y={isFullStack ? 58 : 230}>{isFullStack ? "FULL-STACK" : "FRONTEND"}</text>
          <text x="362" y="180">TOOLS</text>
          <text x="524" y="180">EVIDENCE</text>
          <text x="678" y="184">CASE {project.number}</text>
        </g>
      </svg>

      <div className="grid gap-2 border-t border-white/15 pt-4 sm:grid-cols-[auto_1fr] sm:items-center sm:gap-5">
        <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-white/55">Active route</span>
        <div className="flex flex-wrap gap-2">
          <span className="border border-white/15 bg-white/[0.06] px-2.5 py-1.5 text-[11px] font-medium text-white/85">{project.role}</span>
          {project.tags.map((tag) => (
            <span key={tag} className="border border-white/15 bg-white/[0.06] px-2.5 py-1.5 text-[11px] font-medium text-white/85">{tag}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function WorksStation({ station, projects }: { station: TrainStation; projects: GameProject[] }) {
  const reducedMotion = useReducedMotion() ?? false;
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [dispatchRun, setDispatchRun] = useState(0);
  const [isDispatching, setIsDispatching] = useState(false);
  const [deliveredProject, setDeliveredProject] = useState<string | null>(null);

  if (projects.length === 0) {
    return (
      <>
        <StationHeading station={station} title="Signal board offline." copy="No project routes are available for this shift." />
        <p className="border border-black/20 p-6 text-sm text-black/70">Return later when a project route has been assigned.</p>
      </>
    );
  }

  const selectedProject = projects[Math.min(selectedIndex, projects.length - 1)];
  const selectedHref = getProjectHref(selectedProject);
  const delivered = deliveredProject === selectedProject.number;

  const selectProject = (index: number) => {
    setSelectedIndex(index);
    setIsDispatching(false);
    setDeliveredProject(null);
  };

  const dispatchSignal = () => {
    if (isDispatching) return;
    setDeliveredProject(null);
    setDispatchRun((current) => current + 1);
    setIsDispatching(true);
  };

  const finishDispatch = () => {
    setIsDispatching(false);
    setDeliveredProject(selectedProject.number);
  };

  return (
    <>
      <StationHeading
        station={station}
        title="Dispatch the proof."
        copy="Select a build, inspect its real role and stack, then send one signal through Rafael's project network."
      />

      <div className="grid gap-5 xl:grid-cols-[minmax(13rem,0.34fr)_minmax(0,1fr)]">
        <aside className="border border-black/20 bg-[#e4dccf] p-3 sm:p-4" aria-label="Project routes">
          <div className="mb-3 flex items-center justify-between gap-3 px-1">
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-black/60">Select a route</p>
            <span className="font-mono text-[10px] text-black/55">{String(projects.length).padStart(2, "0")} cases</span>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
            {projects.map((project, index) => {
              const selected = index === selectedIndex;
              return (
                <button
                  key={project.number}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => selectProject(index)}
                  className={`group grid min-h-14 grid-cols-[2.25rem_1fr_auto] items-center gap-2 border px-3 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d94b35] focus-visible:ring-offset-2 focus-visible:ring-offset-[#e4dccf] ${
                    selected
                      ? "border-[#181816] bg-[#181816] text-white"
                      : "border-black/20 bg-[#eee8dc] text-black/75 hover:border-black/40"
                  }`}
                >
                  <span className={`font-mono text-[11px] font-semibold ${selected ? "text-[#f2d99c]" : "text-black/55"}`}>{project.number}</span>
                  <span className="font-display text-base font-semibold leading-tight">{project.shortTitle}</span>
                  <span className="h-2.5 w-2.5 rounded-full border border-current" style={{ backgroundColor: project.tone }} aria-hidden="true" />
                </button>
              );
            })}
          </div>
        </aside>

        <div className="min-w-0 space-y-5">
          <SignalBoard
            project={selectedProject}
            dispatchRun={dispatchRun}
            isDispatching={isDispatching}
            onDelivered={finishDispatch}
          />

          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
            <p className="min-h-6 text-sm font-medium text-black/70" role="status" aria-live="polite">
              {isDispatching
                ? `Signal in transit to ${selectedProject.shortTitle}.`
                : delivered
                  ? `Signal delivered. Evidence for ${selectedProject.shortTitle} is ready.`
                  : `Route ready for ${selectedProject.shortTitle}. Evidence remains available without dispatching.`}
            </p>
            <button
              type="button"
              onClick={dispatchSignal}
              disabled={isDispatching}
              aria-label={`Dispatch signal to ${selectedProject.shortTitle}`}
              className="group inline-flex min-h-12 items-center justify-center gap-3 bg-[#d94b35] px-5 text-xs font-semibold uppercase tracking-[0.14em] text-white transition-colors hover:bg-[#bd3d2a] disabled:cursor-wait disabled:bg-[#817d75] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#181816] focus-visible:ring-offset-2 focus-visible:ring-offset-[#eee8dc]"
            >
              <Radio className={`h-4 w-4 ${isDispatching && !reducedMotion ? "animate-pulse" : ""}`} />
              {isDispatching ? "Dispatching" : delivered ? "Dispatch again" : "Dispatch signal"}
            </button>
          </div>

          <article className="grid overflow-hidden border border-black/20 bg-[#e5ded1] [content-visibility:auto] [contain-intrinsic-size:420px] md:grid-cols-[minmax(15rem,0.82fr)_minmax(0,1.18fr)]">
            <div className="relative min-h-64 bg-[#181816] md:min-h-80">
              <Image
                src={selectedProject.image}
                alt={`${selectedProject.shortTitle} project preview`}
                fill
                loading="lazy"
                quality={70}
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 42vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <span className="absolute bottom-4 left-4 bg-[#eee8dc] px-3 py-2 font-mono text-[10px] font-semibold uppercase tracking-[0.15em] text-[#181816]">
                Evidence {selectedProject.number}
              </span>
            </div>

            <div className="flex min-w-0 flex-col justify-between p-5 sm:p-7">
              <div>
                <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-[#9f3828]">{selectedProject.role}</p>
                <h3 className="mt-3 font-display text-3xl font-semibold leading-tight">{selectedProject.shortTitle}</h3>
                <p className="mt-4 text-sm leading-7 text-black/70 sm:text-base">{selectedProject.description}</p>
              </div>
              <div className="mt-7 flex flex-wrap items-end justify-between gap-5 border-t border-black/20 pt-5">
                <div className="flex flex-wrap gap-2">
                  {selectedProject.tags.map((tag) => (
                    <span key={tag} className="border border-black/20 bg-white/35 px-2.5 py-1.5 text-[11px] font-medium text-black/70">{tag}</span>
                  ))}
                </div>

                {selectedHref ? (
                  <a
                    href={selectedHref}
                    target={selectedProject.isPrivate ? undefined : "_blank"}
                    rel={selectedProject.isPrivate ? undefined : "noopener noreferrer"}
                    aria-label={`View the ${selectedProject.shortTitle} repository${selectedProject.isPrivate ? "" : " in a new tab"}`}
                    className="group inline-flex min-h-11 items-center gap-2 text-xs font-semibold uppercase tracking-[0.13em] text-[#9f3828] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d94b35] focus-visible:ring-offset-2 focus-visible:ring-offset-[#e5ded1]"
                  >
                    View repository <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </a>
                ) : (
                  <span className="text-xs font-medium text-black/55">Repository details are not published.</span>
                )}
              </div>
            </div>
          </article>
        </div>
      </div>
    </>
  );
}

function StudyStation({ station, certifications }: { station: TrainStation; certifications: GameCertification[] }) {
  return (
    <>
      <StationHeading
        station={station}
        title="Learning, validated."
        copy="Three Dicoding credentials mark Rafael's continued practice across web foundations, JavaScript, and frontend implementation."
      />

      <div className="mb-5 flex items-start gap-3 border border-[#b38a37]/45 bg-[#f2d99c]/30 p-4 text-sm leading-6 text-black/70">
        <BookOpen className="mt-0.5 h-5 w-5 shrink-0 text-[#8a6726]" />
        <p>Credential titles are translated here for clarity. Each link opens the official document in its original language.</p>
      </div>

      <div className="grid border-t border-black/20 md:grid-cols-3">
        {certifications.map((certificate, index) => {
          const displayTitle = getCertificateTitle(certificate);
          const code = getCertificateCode(displayTitle);

          return (
            <a
              key={certificate.title}
              href={certificate.pdf}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Open ${displayTitle} certificate in a new tab`}
              className="group relative flex min-h-80 flex-col justify-between border-b border-black/20 p-6 transition-colors hover:bg-black/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#d94b35] md:border-r [content-visibility:auto] [contain-intrinsic-size:320px]"
            >
              <div className="flex items-start justify-between gap-4">
                <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.17em] text-black/55">Credential / {String(index + 1).padStart(2, "0")}</span>
                <span className="flex h-14 w-14 rotate-2 items-center justify-center border-2 border-[#b38a37] font-mono text-sm font-bold text-[#805e20] transition-transform duration-300 group-hover:-rotate-3">{code}</span>
              </div>

              <div className="mt-12">
                <h3 className="font-display text-2xl font-semibold leading-tight">{displayTitle}</h3>
                <div className="mt-6 flex items-center justify-between gap-4 border-t border-black/20 pt-4 text-sm">
                  <span className="font-medium">{certificate.issuer}</span>
                  <span className="font-mono text-[11px] text-black/60">{certificate.date}</span>
                </div>
                <span className="mt-5 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#8a6726]">
                  Open credential <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </span>
              </div>
            </a>
          );
        })}
      </div>
    </>
  );
}

function ArchiveStation({ station, onEnterArchive }: { station: TrainStation; onEnterArchive: () => void }) {
  return (
    <>
      <StationHeading
        station={station}
        title="Records beyond the line."
        copy="Preview the collection before choosing whether to load Rafael's navigable three-dimensional archive."
      />

      <div
        className="relative overflow-hidden bg-[#181816] p-5 text-[#eee8dc] sm:p-8 lg:p-10"
        style={{
          backgroundImage:
            "linear-gradient(rgba(238,232,220,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(238,232,220,0.06) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      >
        <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(19rem,0.72fr)] lg:items-end">
          <div>
            <div className="flex items-center gap-3 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-[#f2d99c]">
              <ArchiveIcon className="h-4 w-4" /> Archive inventory
            </div>
            <h3 className="mt-5 max-w-2xl font-display text-4xl font-semibold uppercase leading-[0.88] tracking-[-0.045em] sm:text-5xl lg:text-6xl">
              Four record groups.<br />One deeper room.
            </h3>
            <p className="mt-6 max-w-2xl text-sm leading-7 text-white/70 sm:text-base">
              The archive contains Rafael&apos;s CV, formal credentials, organization and volunteer records, and an award document. The 3D room loads only when you request it.
            </p>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            {archiveGroups.map((group, index) => {
              const Icon = group.icon;
              return (
                <div key={group.title} className="border border-white/15 bg-white/[0.055] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <Icon className="h-5 w-5 text-[#f2d99c]" />
                    <span className="font-mono text-[10px] text-white/55">0{index + 1}</span>
                  </div>
                  <h4 className="mt-7 font-display text-lg font-semibold">{group.title}</h4>
                  <p className="mt-1 text-xs text-white/60">{group.detail}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="relative mt-8 flex flex-col gap-4 border-t border-white/15 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-xl text-xs leading-5 text-white/60">Desktop devices enter the interactive room. Mobile devices receive the lightweight archive view.</p>
          <button
            type="button"
            onClick={onEnterArchive}
            className="group inline-flex min-h-12 items-center justify-center gap-3 bg-[#f2d99c] px-5 text-xs font-semibold uppercase tracking-[0.14em] text-[#181816] transition-colors hover:bg-[#ffe6aa] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-3 focus-visible:ring-offset-[#181816]"
          >
            Load the 3D archive <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </>
  );
}

function ContactStation({ station, whatsappLink, emailAddress }: { station: TrainStation; whatsappLink: string; emailAddress: string }) {
  const [purpose, setPurpose] = useState<ContactPurpose>("role");
  const selectedPurpose = contactPurposes.find((item) => item.id === purpose) ?? contactPurposes[0];
  const preparedWhatsappLink = useMemo(
    () => buildWhatsappLink(whatsappLink, selectedPurpose.message),
    [selectedPurpose.message, whatsappLink],
  );
  const preparedGmailLink = useMemo(
    () => buildGmailLink(emailAddress, `Portfolio inquiry: ${selectedPurpose.label}`, selectedPurpose.message),
    [emailAddress, selectedPurpose.label, selectedPurpose.message],
  );

  return (
    <>
      <StationHeading
        station={station}
        title="Start the next route."
        copy="Choose what you want to discuss. Rafael's direct contact and code remain available at every stage of the journey."
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.12fr)_minmax(18rem,0.88fr)]">
        <div className="bg-[#181816] p-5 text-[#eee8dc] sm:p-8">
          <div className="flex items-center gap-3 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8eb8a8]">
            <span className="h-2.5 w-2.5 rounded-full bg-[#6ea28d]" aria-hidden="true" /> Direct line open
          </div>
          <h3 className="mt-6 max-w-2xl font-display text-3xl font-semibold leading-tight sm:text-5xl">Good products usually begin with a clear conversation.</h3>

          <div className="mt-9">
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-white/60">I want to discuss</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-3" aria-label="Conversation purpose">
              {contactPurposes.map((item) => {
                const selected = item.id === purpose;
                return (
                  <button
                    key={item.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setPurpose(item.id)}
                    className={`min-h-12 border px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.11em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f2d99c] ${
                      selected
                        ? "border-[#f2d99c] bg-[#f2d99c] text-[#181816]"
                        : "border-white/20 text-white/75 hover:bg-white/[0.07]"
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-6 border-l-2 border-[#6ea28d] bg-white/[0.055] p-4" aria-live="polite">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-white/55">Prepared message</p>
            <p className="mt-2 text-sm leading-6 text-white/80">{selectedPurpose.message}</p>
          </div>

          <div className="mt-6 grid gap-2 sm:grid-cols-2">
            <a
              href={preparedWhatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open the prepared WhatsApp message in a new tab"
              className="group inline-flex min-h-14 items-center justify-between bg-[#3f6e61] px-5 text-xs font-semibold uppercase tracking-[0.12em] text-white transition-colors hover:bg-[#345b50] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f2d99c]"
            >
              <span className="flex items-center gap-3"><SiWhatsapp className="h-5 w-5" /> Open WhatsApp</span>
              <Send className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </a>
            <a
              href={preparedGmailLink}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Compose the prepared message to ${emailAddress} in Gmail`}
              className="group inline-flex min-h-14 items-center justify-between bg-[#eee8dc] px-5 text-[#181816] transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f2d99c]"
            >
              <span className="flex min-w-0 items-center gap-3">
                <SiGmail className="h-5 w-5 shrink-0 text-[#d94b35]" />
                <span className="min-w-0 text-left">
                  <span className="block text-xs font-semibold uppercase tracking-[0.12em]">Open Gmail</span>
                  <span className="mt-1 block truncate font-mono text-[10px] font-normal normal-case tracking-normal text-black/60">{emailAddress}</span>
                </span>
              </span>
              <ArrowUpRight className="h-4 w-4 shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a>
          </div>
        </div>

        <div className="flex flex-col justify-between border border-black/20 bg-[#e4dccf] p-5 sm:p-7">
          <div>
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.17em] text-black/55">Code connection</p>
            <h3 className="mt-4 font-display text-3xl font-semibold">Inspect the work directly.</h3>
            <p className="mt-4 text-sm leading-7 text-black/70">Browse Rafael&apos;s public repositories without completing the route or earning every station stamp.</p>
          </div>

          <a
            href="https://github.com/rafaelevan-k"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Open Rafael's GitHub profile in a new tab"
            className="group mt-10 flex min-h-16 items-center justify-between border-y border-black/20 py-4 font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d94b35] focus-visible:ring-offset-2 focus-visible:ring-offset-[#e4dccf]"
          >
            <span className="flex items-center gap-4"><SiGithub className="h-6 w-6" /> GitHub profile</span>
            <ArrowUpRight className="h-5 w-5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </a>

          <div className="mt-8 flex items-center gap-3 text-xs font-medium text-black/60">
            <Check className="h-4 w-4 text-[#3f6e61]" /> No completion lock. Choose any connection now.
          </div>
        </div>
      </div>
    </>
  );
}

function StationContentInner({ station, projects, certifications, whatsappLink, emailAddress, onEnterArchive }: StationContentProps) {
  switch (station.id) {
    case "profile":
      return <ProfileStation station={station} projects={projects} />;
    case "works":
      return <WorksStation station={station} projects={projects} />;
    case "study":
      return <StudyStation station={station} certifications={certifications} />;
    case "archive":
      return <ArchiveStation station={station} onEnterArchive={onEnterArchive} />;
    case "contact":
      return <ContactStation station={station} whatsappLink={whatsappLink} emailAddress={emailAddress} />;
  }
}

export const StationContent = memo(StationContentInner);
