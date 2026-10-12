import { education, experiences, skillCategories } from "@/lib/portfolioJourney";

/** The same background and toolkit as the train, readable without gameplay. */
export function PortfolioBackground() {
  return (
    <section id="experience" className="relative z-20 scroll-mt-28 border-b border-black/15 px-6 py-20 dark:border-white/15 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#d94b35]">Background &amp; practice</span>
        <div className="mt-6 grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <h2 className="font-display text-3xl font-semibold">Education &amp; experience.</h2>
            <p className="mt-5 text-sm leading-7 opacity-70"><strong>{education.institution}</strong><br />{education.degree}<br />{education.period} · GPA {education.gpa}</p>
            <p className="mt-5 text-sm leading-7 opacity-65">Teaching, leadership, and organization complement the technical work. These roles are recorded in my CV.</p>
            <a href="/documents/CV_Rafael_Evan_Kristanto_compressed.pdf" target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex min-h-11 items-center text-sm font-semibold text-[#d94b35] underline underline-offset-4">Read the full CV ↗</a>
          </div>
          <div className="border-t border-black/20 dark:border-white/20">{experiences.map((experience) => <details key={`${experience.title}-${experience.organization}`} className="border-b border-black/20 py-3 dark:border-white/20"><summary className="cursor-pointer py-2 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-[#d94b35]">{experience.title}<span className="ml-2 font-normal opacity-60">/ {experience.organization}</span></summary><p className="mt-2 font-mono text-[10px] opacity-60">{experience.period}</p><p className="my-3 text-sm leading-6 opacity-70">{experience.description}</p></details>)}</div>
        </div>
        <div id="skills" className="mt-16 scroll-mt-28 border-t border-black/20 pt-8 dark:border-white/20">
          <h2 className="font-display text-2xl font-semibold">The toolkit.</h2>
          <div className="mt-6 grid gap-8 md:grid-cols-3">{skillCategories.map((category) => <div key={category.id}><h3 className="text-sm font-semibold">{category.title}</h3><p className="mt-2 text-xs leading-6 opacity-65">{category.description}</p><ul className="mt-4 flex list-none flex-wrap gap-2">{category.items.map((item) => <li key={item} className="border border-black/15 px-3 py-2 font-mono text-[10px] dark:border-white/15">{item}</li>)}</ul></div>)}</div>
        </div>
      </div>
    </section>
  );
}
