import type { ComponentType, CSSProperties } from "react";
import { Boxes, DatabaseZap, Layers, Users, Webhook } from "lucide-react";
import {
  SiCss,
  SiDotnet,
  SiGit,
  SiGithub,
  SiHtml5,
  SiJavascript,
  SiLaravel,
  SiMysql,
  SiNextdotjs,
  SiNodedotjs,
  SiPhp,
  SiPostgresql,
  SiPostman,
  SiPython,
  SiReact,
  SiTailwindcss,
  SiTypescript,
  SiVuedotjs,
} from "react-icons/si";
import { VscVscode } from "react-icons/vsc";

type IconComponent = ComponentType<{ className?: string; "aria-hidden"?: boolean }>;

/** A logo and its brand colour, tuned per theme so it stays readable on washi and on ink. */
type SkillLogo = { icon: IconComponent; light?: string; dark?: string };

const ACCENT = "#d94b35";

// Logos without a `light` colour (Next.js, GitHub) are black marks, so they follow the text colour.
const skillLogos: Record<string, SkillLogo> = {
  JavaScript: { icon: SiJavascript, light: "#C9A400", dark: "#F7DF1E" },
  TypeScript: { icon: SiTypescript, light: "#3178C6", dark: "#4F9BE8" },
  HTML5: { icon: SiHtml5, light: "#E34F26", dark: "#F06A45" },
  CSS3: { icon: SiCss, light: "#663399", dark: "#A66CDB" },
  React: { icon: SiReact, light: "#087EA4", dark: "#61DAFB" },
  "Next.js": { icon: SiNextdotjs },
  "Vue.js": { icon: SiVuedotjs, light: "#2F9C6A", dark: "#42B883" },
  "Tailwind CSS": { icon: SiTailwindcss, light: "#0891B2", dark: "#38BDF8" },
  PHP: { icon: SiPhp, light: "#777BB4", dark: "#9EA3D9" },
  Laravel: { icon: SiLaravel, light: "#FF2D20", dark: "#FF5A4F" },
  "Node.js": { icon: SiNodedotjs, light: "#5FA04E", dark: "#7CC36A" },
  "C# / .NET (WPF)": { icon: SiDotnet, light: "#512BD4", dark: "#8B6CF0" },
  MySQL: { icon: SiMysql, light: "#4479A1", dark: "#6BA3CF" },
  PostgreSQL: { icon: SiPostgresql, light: "#4169E1", dark: "#6E8EF0" },
  Python: { icon: SiPython, light: "#3776AB", dark: "#5A9FD4" },
  "RESTful APIs": { icon: Webhook, light: ACCENT, dark: ACCENT },
  Git: { icon: SiGit, light: "#F05032", dark: "#F05032" },
  GitHub: { icon: SiGithub },
  "VS Code": { icon: VscVscode, light: "#007ACC", dark: "#3EA6FF" },
  Postman: { icon: SiPostman, light: "#FF6C37", dark: "#FF6C37" },
  MVC: { icon: Layers, light: ACCENT, dark: ACCENT },
  CRUD: { icon: DatabaseZap, light: ACCENT, dark: ACCENT },
  "Object-oriented programming": { icon: Boxes, light: ACCENT, dark: ACCENT },
  "Team collaboration": { icon: Users, light: ACCENT, dark: ACCENT },
};

/** One toolkit tile: the logo in its brand colour, lifting and tinting on hover. */
export function SkillChip({ name }: { name: string }) {
  const logo = skillLogos[name];
  const Icon = logo?.icon;
  const style = {
    "--brand": logo?.light ?? "currentColor",
    "--brand-dark": logo?.dark ?? logo?.light ?? "currentColor",
  } as CSSProperties;

  return (
    <li
      style={style}
      className="group flex items-center gap-2 border border-black/15 px-3 py-2 font-mono text-[10px] transition duration-300 hover:-translate-y-0.5 hover:border-[var(--brand)] hover:bg-[color-mix(in_srgb,var(--brand)_8%,transparent)] motion-reduce:transition-none motion-reduce:hover:translate-y-0 dark:border-white/15 dark:hover:border-[var(--brand-dark)] dark:hover:bg-[color-mix(in_srgb,var(--brand-dark)_10%,transparent)]"
    >
      {Icon && (
        <Icon
          aria-hidden
          className="h-4 w-4 shrink-0 text-[var(--brand)] transition-transform duration-300 group-hover:scale-110 motion-reduce:transition-none dark:text-[var(--brand-dark)]"
        />
      )}
      {name}
    </li>
  );
}
