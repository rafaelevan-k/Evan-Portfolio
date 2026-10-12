"use client";

import Image from "next/image";
import { ArrowRight, ArrowUpRight, BookOpen, FileDown, Mail, X } from "lucide-react";
import { useEffect, useRef } from "react";
import { archiveBooks } from "@/lib/archiveBooks";
import { CV_PATH, education, experiences, skillCategories } from "@/lib/portfolioJourney";
import type { GameCertification, GameProject } from "../train/types";
import { CARRIAGES, type CarriageId, type PayloadId } from "./world";

type Props = {
  panel: PayloadId;
  projects: GameProject[];
  certifications: GameCertification[];
  emailAddress: string;
  whatsappLink: string;
  visited: CarriageId[];
  onClose: () => void;
  onTravel: (destination: CarriageId | "station") => void;
  onExit: () => void;
  onEnterArchive: () => void;
};

const titles: Partial<Record<PayloadId, string>> = {
  guide: "A little journey, at your own pace.", navigation: "Where would you like to go?", about: "Hi, I'm Rafael.", education: "Where the journey began.", experience: "Learning. Leading. Working together.", certifications: "A few learning milestones.", contact: "Let's start the next chapter.", cv: "Take the story with you.", archive: "The document archive.", return: "Back to the portfolio?",
};

function ExternalLink({ href, children, download }: { href: string; children: React.ReactNode; download?: boolean }) {
  return <a className="journey-link" href={href} target="_blank" rel="noopener noreferrer" download={download || undefined}>{children}{download ? <FileDown size={16} /> : <ArrowUpRight size={16} />}</a>;
}

export function JourneyDialog(props: Props) {
  const { panel, projects, certifications, emailAddress, whatsappLink, visited, onClose, onTravel, onExit, onEnterArchive } = props;
  const ref = useRef<HTMLDialogElement>(null);
  const project = panel.startsWith("project:") ? projects[Number(panel.split(":")[1])] : null;
  const skill = panel.startsWith("skill:") ? skillCategories[Number(panel.split(":")[1])] : null;
  const title = project?.shortTitle ?? skill?.title ?? titles[panel] ?? "Explore the portfolio";
  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    return () => { if (dialog?.open) dialog.close(); };
  }, []);

  return (
    <dialog ref={ref} className={`journey-dialog ${panel === "guide" ? "journey-dialog-guide" : ""}`} aria-labelledby="journey-dialog-title" onCancel={(event) => { event.preventDefault(); onClose(); }} onClick={(event) => {
      if (event.target !== event.currentTarget) return;
      const rect = event.currentTarget.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) onClose();
    }}>
      <div className="journey-dialog-heading">
        <span className="journey-eyebrow">RAFAEL LINE / FIELD NOTES</span>
        <button className="journey-icon-button" type="button" aria-label="Close detail panel" onClick={onClose}><X size={20} /></button>
      </div>
      <div className="journey-dialog-body">
        {panel === "guide" && <div className="journey-ticket-art" aria-hidden="true"><span>REK</span><i /> <span>YOU</span><small>ONE TICKET · EVERY CARRIAGE</small></div>}
        <h2 id="journey-dialog-title">{title}</h2>
        {panel === "guide" && <>
          <p>Welcome aboard. This is Rafael&apos;s portfolio, told through a little pixel train. Wander through five carriages and stop at anything that catches your eye.</p>
          <div className="journey-guide-grid">
            <div><span className="journey-key-art" aria-hidden="true">W A S D</span><h3>Take a walk</h3><p>WASD or arrow keys. On touch screens, tap the floor or use the direction pad.</p></div>
            <div><span className="journey-key-art" aria-hidden="true">E / TAP</span><h3>Take a closer look</h3><p>Walk near a labeled object and press E. Tap an object to walk to it and open its notes.</p></div>
          </div>
          <p className="journey-note">No quests. No locked doors. The route map takes you straight to any carriage, and “Read portfolio” returns to the regular site.</p>
          <div className="journey-actions"><button type="button" className="journey-button-primary" onClick={onClose}>Explore the platform <ArrowRight size={17} /></button><button type="button" className="journey-button-text" onClick={() => onTravel("about")}>Skip tutorial &amp; board</button></div>
        </>}
        {panel === "navigation" && <>
          <p>All five carriages are open. Pick a destination to arrive there immediately.</p>
          <div className="journey-destination-list">{CARRIAGES.map((car, index) => <button key={car.id} type="button" onClick={() => onTravel(car.id)} style={{ "--car-color": car.color } as React.CSSProperties}><span className="journey-car-number">{String(index + 1).padStart(2, "0")}</span><span><strong>{car.label}</strong><small>{car.description}</small></span><span className="journey-destination-end">{visited.includes(car.id) ? "Visited" : "Open"}<ArrowRight size={18} /></span></button>)}</div>
          <button className="journey-button-text" type="button" onClick={() => onTravel("station")}>Return to Yogyakarta Station</button>
        </>}
        {panel === "about" && <>
          <div className="journey-profile"><Image src="/foto-profil.webp" alt="Rafael Evan Kristanto" width={148} height={176} sizes="148px" className="journey-portrait" /><div><span className="journey-eyebrow">YOGYAKARTA, INDONESIA</span><h3>Rafael Evan Kristanto</h3><p>Information Systems student and full-stack web developer. I build useful digital products with a sharp frontend eye, full-stack thinking, and deliberate interaction.</p></div></div>
          <div className="journey-note">From inventory systems and learning platforms to AI assistants, my projects connect technical structure with the people who use it.</div>
          <h3>Education</h3><p><strong>{education.institution}</strong><br />{education.degree} · {education.period}<br />GPA {education.gpa}</p>
          <ExternalLink href={CV_PATH}>Read the full CV</ExternalLink>
        </>}
        {panel === "education" && <>
          <span className="journey-eyebrow">{education.period}</span><h3>{education.institution}</h3><p>{education.degree}<br />GPA {education.gpa}</p>
          <p>Academic and personal projects put this foundation into practice through learning management systems, inventory tools, and e-catalogs.</p><ExternalLink href={CV_PATH}>Read the education record</ExternalLink>
        </>}
        {project && <>
          <span className="journey-eyebrow">PROJECT {project.number} / {project.role}</span>
          <div className="journey-project-image"><Image src={project.image} alt={`${project.shortTitle} interface preview`} fill sizes="(max-width: 700px) 90vw, 650px" className="object-contain" /></div>
          <p>{project.description}</p><div className="journey-tags">{project.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
          <div className="journey-actions">{project.repoLink && <ExternalLink href={project.isPrivate ? `/private-repo?repo=${encodeURIComponent(project.repoLink)}` : project.repoLink}>{project.isPrivate ? "Repository access details" : "View GitHub repository"}</ExternalLink>}{project.liveLink && <ExternalLink href={project.liveLink}>Open live demo</ExternalLink>}</div>
          {!project.repoLink && <p className="journey-note">This project&apos;s repository is not publicly listed. Contact Rafael for more details.</p>}
        </>}
        {panel === "experience" && <><p>Teaching and organizational experience, from Rafael&apos;s existing CV.</p><ol className="journey-timeline">{experiences.map((experience) => <li key={`${experience.title}-${experience.organization}`}><span className="journey-eyebrow">{experience.period} / {experience.category}</span><h3>{experience.title}</h3><strong>{experience.organization}</strong><p>{experience.description}</p></li>)}</ol><ExternalLink href={CV_PATH}>Read the full experience record</ExternalLink></>}
        {panel === "certifications" && <><p>Web foundations, JavaScript, and frontend implementation, issued by Dicoding.</p><div className="journey-record-list">{certifications.map((certificate) => <ExternalLink key={certificate.title} href={certificate.pdf}><span><strong>{certificate.displayTitle ?? certificate.title}</strong><small>{certificate.issuer} · {certificate.date}</small></span></ExternalLink>)}</div></>}
        {skill && <><p>{skill.description}</p><div className="journey-tags journey-tags-large">{skill.items.map((item) => <span key={item}>{item}</span>)}</div><p className="journey-note">Explore the Projects carriage to see these tools in real builds.</p><button type="button" className="journey-button-primary" onClick={() => onTravel("projects")}>Visit the workshop <ArrowRight size={17} /></button></>}
        {panel === "contact" && <><p>Have a project, an internship, or a role in mind? Here are Rafael&apos;s direct lines.</p><div className="journey-record-list"><ExternalLink href={`mailto:${emailAddress}`}><span><strong><Mail size={17} /> Email Rafael</strong><small>{emailAddress}</small></span></ExternalLink><ExternalLink href={whatsappLink}>Open WhatsApp</ExternalLink><ExternalLink href="https://github.com/rafaelevan-k">Browse GitHub</ExternalLink><ExternalLink href={CV_PATH}>Read the CV</ExternalLink></div></>}
        {panel === "cv" && <><p>Education, technical skills, project experience, teaching, and leadership in one document.</p><div className="journey-actions"><ExternalLink href={CV_PATH}>Open the CV</ExternalLink><ExternalLink href={CV_PATH} download>Download the CV</ExternalLink></div></>}
        {panel === "archive" && <><p>Browse the original documents here, or step into the portfolio&apos;s 3D archive.</p><div className="journey-record-list">{Object.values(archiveBooks).flatMap((book) => book.documents.map((document) => <ExternalLink key={document.path} href={document.path}>{document.title}</ExternalLink>))}</div><button type="button" className="journey-button-primary" onClick={onEnterArchive}><BookOpen size={18} /> Enter the 3D archive</button></>}
        {panel === "return" && <><p>The regular portfolio has every section ready to read. You can reopen this journey whenever you like.</p><div className="journey-actions"><button className="journey-button-primary" type="button" onClick={onExit}>Read the portfolio <ArrowRight size={17} /></button><button className="journey-button-text" type="button" onClick={onClose}>Keep exploring</button></div></>}
      </div>
      <footer className="journey-dialog-footer"><span>YOUR JOURNEY · YOUR PACE</span><button type="button" onClick={onClose}>Close <kbd>Esc</kbd></button></footer>
    </dialog>
  );
}
