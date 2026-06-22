"use client";

import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, MessageSquare, Download } from "lucide-react";
import { SiNextdotjs, SiTailwindcss, SiVuedotjs, SiLaravel, SiMysql, SiPython, SiGithub, SiWhatsapp } from "react-icons/si";

import { Entrance } from "@/components/entrance/Entrance";
import Navbar from "@/components/Navbar";
import { ProjectCard } from "@/components/ui/ProjectCard";
import { CertificationCard } from "@/components/ui/CertificationCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { ArchiveEntranceTransition } from "@/components/archive/ArchiveEntranceTransition";
import { useState } from "react";

const projects = [
  {
    title: "Sistem Informasi Inventory",
    role: "Full-Stack Developer",
    description: "Built a multi-user inventory tracking information system for university data management and goods monitoring, featuring CRUD, search, data filtering, and a damaged goods reporting form.",
    image: "/project_inventory.webp",
    tags: ["Next.js", "TypeScript", "MySQL"],
  },
  {
    title: "CyberShark LMS",
    role: "Frontend Developer",
    description: "Worked as a Frontend Developer on CyberShark LMS, a tutoring platform featuring video and text-based learning, quiz assessments, and student grade tracking.",
    image: "/project_cybershark.webp",
    tags: ["Laravel", "CSS", "MySQL"],
    repoLink: "https://github.com/Jhonhil/cyber-shark",
    isPrivate: true,
  },
  {
    title: "Sinau Matika",
    role: "Frontend Developer",
    description: "Worked as a Frontend Developer on Sinau Matika, an interactive and engaging gamified LMS platform for Mathematics for elementary school students at SD Kanisius Sorowajan.",
    image: "/project_sinaumatika.webp",
    tags: ["Vue.js", "Slim", "MySQL"],
    repoLink: "https://github.com/dedenko1/lms-b-fe",
    isPrivate: true,
  },
  {
    title: "Portofolio",
    role: "Frontend Developer",
    description: "Worked as a Frontend Developer on Portfolio, a personal platform to showcase my projects and skills.",
    image: "/project_porto2.webp",
    tags: ["Next.js", "TypeScript", "Tailwind CSS"],
    repoLink: "https://github.com/rafaelevan-k/Evan-Portfolio",
    isPrivate: false,
  },
  {
    title: "E-Catalog Maha Laptop",
    role: "Full-Stack Developer",
    description: "Worked as a Full-Stack Developer on E-Catalog Maha Laptop, a platform showcasing laptop product catalogs, complete with CRUD and search features for both Admins and Customers.",
    image: "/project_mahalaptop.webp",
    tags: ["Laravel", "Tailwind CSS", "MySQL"],
    repoLink: "https://github.com/rafaelevan-k/E-Catalog-Maha-Laptop",
    isPrivate: true,
  },
  {
    title: "Yuna Personal Assistant",
    role: "Full-Stack Developer",
    description:
      "Worked as a Full-Stack Developer building Yuna Personal Assistant, an AI chatbot and AI Agent for the Laravel coding framework. Utilized local LLM models (Deepseek Coder and Llama3) and integrated Google's Web Search API technology.",
    image: "/project_yuna.webp",
    tags: ["Vue.js", "Python", "Tailwind CSS"],
    repoLink: "https://github.com/rafaelevan-k/Yuna-Personal-AI-Assistant",
    isPrivate: false,
  },
];

const certifications = [
  {
    title: "Belajar Dasar Pemrograman Web",
    issuer: "Dicoding",
    date: "2026",
    pdf: "/Dicoding_Sertifikat_Belajar-Dasar-Pemrograman-Web.pdf",
  },
  {
    title: "Belajar Dasar Pemrograman JavaScript",
    issuer: "Dicoding",
    date: "2026",
    pdf: "/Dicoding_Sertifikat_Belajar-Dasar-Pemrograman-JavaScript.pdf",
  },
  {
    title: "Belajar Membuat Frontend Web untuk Pemula",
    issuer: "Dicoding",
    date: "2026",
    pdf: "/Dicoding_Sertifikat_Belajar-Membuat-Front-End-Web-untuk-Pemula.pdf",
  },
];

const WA_NUMBER = "6282279551837";
const WA_MESSAGE = encodeURIComponent("Hello, we are interested in your portfolio and would like to contact you further...");
const WA_LINK = `https://wa.me/${WA_NUMBER}?text=${WA_MESSAGE}`;

export default function Home() {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 150]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);
  const [isEnteringArchive, setIsEnteringArchive] = useState(false);

  const handleEnterArchive = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isEnteringArchive) return;
    setIsEnteringArchive(true);
  };

  return (
    <div className="relative overflow-x-hidden selection:bg-ink selection:text-on-dark">
      <ArchiveEntranceTransition isTriggered={isEnteringArchive} />
      <Entrance />
      <Navbar />

      {/* ==================== HERO / ABOUT ==================== */}
      <section id="about" className="relative min-h-screen flex items-center pt-20 overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 py-12 w-full relative z-10">
          <div className="flex flex-col-reverse lg:flex-row items-center lg:items-start justify-between gap-16 lg:gap-8">
            
            {/* Text Content */}
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col items-center lg:items-start text-center lg:text-left flex-1 max-w-2xl lg:pt-12"
            >
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-hairline bg-surface-soft text-xs font-medium uppercase tracking-widest text-muted-text mb-8"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                Available for hire
              </motion.div>
              
              <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6 text-ink">
                Engineering <br className="hidden lg:block" />
                <span className="text-muted-text">digital</span> <br className="hidden lg:block" />
                experiences.
              </h1>
              
              <p className="text-body-text text-lg md:text-xl leading-relaxed mb-10 max-w-xl text-balance">
                Hi, I'm <strong className="text-ink font-semibold">Rafael Evan Kristanto</strong>. An Information System student specializing in building engaging, high-performance frontend interfaces with a problem-solving mindset.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <MagneticButton as="a" href="#projects" variant="primary">
                  View Projects
                  <ArrowRight className="w-4 h-4" />
                </MagneticButton>
                <MagneticButton as="a" href="#contact" variant="secondary">
                  Let's Connect
                </MagneticButton>
              </div>

              {/* Stats */}
              <div className="flex gap-8 sm:gap-12 mt-16 pt-8 border-t border-hairline w-full justify-center lg:justify-start">
                {[
                  { value: "6+", label: "Projects" },
                  { value: "3.64", label: "GPA" },
                  { value: "100%", label: "Dedication" },
                ].map((stat, i) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + (i * 0.1), duration: 0.5 }}
                    key={stat.label} 
                    className="flex flex-col"
                  >
                    <span className="font-display text-3xl md:text-4xl font-bold text-ink mb-1">{stat.value}</span>
                    <span className="text-xs font-medium uppercase tracking-wider text-muted-text">{stat.label}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Profile Image & Tech Stack */}
            <motion.div 
              style={{ y, opacity }}
              className="relative flex-shrink-0 lg:ml-auto w-full max-w-md lg:w-[480px] aspect-square"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-surface-soft to-transparent rounded-full blur-3xl opacity-50 dark:opacity-20" />
              
              {/* Main Photo container */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                className="relative w-full h-full rounded-[2.5rem] overflow-hidden border border-hairline bg-surface-soft shadow-2xl dark:shadow-white/5"
              >
                <Image 
                  src="/foto-profil.webp" 
                  alt="Rafael Evan Kristanto" 
                  fill 
                  className="object-cover scale-105" 
                  priority 
                />
              </motion.div>

              {/* Floating Tech Icons */}
              <div className="absolute inset-0 pointer-events-none">
                {[
                  { Icon: SiNextdotjs, top: "10%", left: "-5%", delay: 0.5 },
                  { Icon: SiTailwindcss, top: "40%", left: "-10%", delay: 0.6 },
                  { Icon: SiVuedotjs, top: "75%", left: "5%", delay: 0.7 },
                  { Icon: SiLaravel, top: "5%", left: "85%", delay: 0.8 },
                  { Icon: SiMysql, top: "45%", left: "95%", delay: 0.9 },
                  { Icon: SiPython, top: "80%", left: "80%", delay: 1.0 },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0, rotate: -20 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    transition={{ delay: item.delay, duration: 0.6, type: "spring" }}
                    className="absolute w-12 h-12 rounded-2xl glass-panel shadow-lg flex items-center justify-center text-ink pointer-events-auto transition-transform hover:scale-110"
                    style={{ top: item.top, left: item.left }}
                  >
                    <item.Icon className="w-5 h-5" />
                  </motion.div>
                ))}
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ==================== FEATURED PROJECTS ==================== */}
      <section id="projects" className="py-32 relative z-20 bg-canvas">
        <div className="max-w-6xl mx-auto px-6">
          <SectionHeader 
            title="Featured Projects" 
            subtitle="Portfolio" 
            description="A curated selection of software I've built, demonstrating full-stack capabilities, modern frontend architecture, and user-centric design."
          />

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project, index) => (
              <ProjectCard key={project.title} {...project} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* ==================== CERTIFICATIONS ==================== */}
      <section id="certifications" className="py-32 relative z-20 bg-surface-soft/30 border-y border-hairline">
        <div className="max-w-6xl mx-auto px-6">
          <SectionHeader 
            title="Professional Certifications" 
            subtitle="Achievements" 
            description="Continuous learning and skill validation through recognized industry standards in Web Development."
          />

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certifications.map((cert, index) => (
              <CertificationCard key={cert.title} {...cert} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* ==================== THE ARCHIVE CTA ==================== */}
      <section id="archive" className="py-32 relative z-20 bg-canvas text-ink border-b border-hairline overflow-hidden">
        {/* Stylized background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.03)_0%,transparent_70%)] dark:bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05)_0%,transparent_70%)]" />
        
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10 flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-surface-soft border border-hairline flex items-center justify-center mb-8 shadow-sm">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-ink/80">
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
            </svg>
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight mb-6">The Archive</h2>
          <p className="text-lg md:text-xl text-ink/60 mb-10 max-w-2xl text-balance">
            Explore a 3D interactive documentation space containing my complete Curriculum Vitae, detailed certifications, academic awards, and research publications.
          </p>
          <MagneticButton 
            as="button" 
            onClick={handleEnterArchive}
            variant="primary" 
          >
            Enter The Archive
            <ArrowRight className="w-4 h-4" />
          </MagneticButton>
        </div>
      </section>

      {/* ==================== CONTACT ==================== */}
      <section id="contact" className="py-32 relative z-20 bg-canvas">
        <div className="max-w-5xl mx-auto px-6">
          <SectionHeader 
            title="Let's build something together" 
            subtitle="Contact" 
            description="Currently open for new opportunities. Whether you have a question or just want to say hi, I'll try my best to get back to you!"
          />

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* WhatsApp */}
            <motion.a
              href={WA_LINK}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="group relative flex flex-col p-8 md:p-10 rounded-[2rem] glass-panel overflow-hidden transition-all duration-500 hover:border-ink/30 dark:hover:border-white/30"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="w-16 h-16 rounded-2xl bg-surface-soft border border-hairline flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
                <SiWhatsapp className="w-8 h-8 text-green-600 dark:text-green-500" />
              </div>
              
              <h3 className="font-display text-2xl font-bold text-ink mb-3">WhatsApp</h3>
              <p className="text-body-text mb-8 flex-grow">Send me a direct message and let's discuss your next project.</p>
              
              <div className="inline-flex items-center gap-2 text-sm font-semibold text-ink group-hover:translate-x-2 transition-transform duration-300">
                Start Conversation
                <ArrowRight className="w-4 h-4" />
              </div>
            </motion.a>

            {/* GitHub */}
            <motion.a
              href="https://github.com/rafaelevan-k"
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="group relative flex flex-col p-8 md:p-10 rounded-[2rem] glass-panel overflow-hidden transition-all duration-500 hover:border-ink/30 dark:hover:border-white/30"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-ink/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="w-16 h-16 rounded-2xl bg-surface-soft border border-hairline flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
                <SiGithub className="w-8 h-8 text-ink" />
              </div>
              
              <h3 className="font-display text-2xl font-bold text-ink mb-3">GitHub</h3>
              <p className="text-body-text mb-8 flex-grow">Check out my open-source contributions and the architecture behind my projects.</p>
              
              <div className="inline-flex items-center gap-2 text-sm font-semibold text-ink group-hover:translate-x-2 transition-transform duration-300">
                Explore Repositories
                <ArrowRight className="w-4 h-4" />
              </div>
            </motion.a>
          </div>
        </div>
      </section>

      {/* ==================== FOOTER ==================== */}
      <footer className="border-t border-hairline py-10 bg-surface-soft/50 backdrop-blur-sm relative z-20">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-ink flex items-center justify-center text-on-dark font-display font-bold text-[10px]">
              R
            </div>
            <span className="font-display font-semibold text-sm text-ink tracking-tight">
              Rafael Evan Kristanto
            </span>
          </div>
          <p className="text-muted-text text-sm font-medium">
            &copy; {new Date().getFullYear()} All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

