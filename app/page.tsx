import Image from "next/image";
import Navbar from "@/components/Navbar";
import AnimateOnScroll from "@/components/AnimateOnScroll";

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
  },
  {
    title: "Sinau Matika",
    role: "Frontend Developer",
    description: "Worked as a Frontend Developer on Sinau Matika, an interactive and engaging gamified LMS platform for Mathematics for elementary school students at SD Kanisius Sorowajan.",
    image: "/project_sinaumatika.webp",
    tags: ["Vue.js", "Slim", "MySQL"],
  },
  {
    title: "Portofolio",
    role: "Frontend Developer",
    description: "Worked as a Frontend Developer on Portfolio, a personal platform to showcase my projects and skills.",
    image: "/project_porto2.webp",
    tags: ["Next.js", "TypeScript", "Tailwind CSS"],
  },
  {
    title: "E-Catalog Maha Laptop",
    role: "Full-Stack Developer",
    description: "Worked as a Full-Stack Developer on E-Catalog Maha Laptop, a platform showcasing laptop product catalogs, complete with CRUD and search features for both Admins and Customers.",
    image: "/project_mahalaptop.webp",
    tags: ["Laravel", "Tailwind CSS", "MySQL"],
  },
  {
    title: "Yuna Personal Assistant",
    role: "Full-Stack Developer",
    description:
      "Worked as a Full-Stack Developer building Yuna Personal Assistant, an AI chatbot and AI Agent for the Laravel coding framework. Utilized local LLM models (Deepseek Coder and Llama3) and integrated Google's Web Search API technology.",
    image: "/project_yuna.webp",
    tags: ["Vue.js", "Python", "Tailwind CSS"],
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

// Shared glass card class
const glassCard = "bg-white/80 backdrop-blur-sm border border-black/10 rounded-xl";
const glassCardHover = `${glassCard} hover:bg-white/92 hover:border-black/18 transition-all duration-200`;

export default function Home() {
  return (
    <div className="min-h-screen text-ink">
      <Navbar />

      {/* ==================== HERO / ABOUT ==================== */}
      <section id="about" className="min-h-screen flex items-center pt-14">
        <div className="max-w-5xl mx-auto px-6 py-12 w-full">
          <div className="flex flex-col lg:flex-row items-center lg:items-start justify-center gap-12 lg:gap-20">
            {/* Profile Image & Tech Stack */}
            <div className="animate-fade-in-up flex-shrink-0 lg:mt-8 flex flex-col items-center">
              <div className="relative">
                {/* Ring border around photo */}
                <div className="relative w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 rounded-full overflow-hidden border-4 border-white/60 shadow-xl ring-1 ring-black/10">
                  <Image src="/foto-profil.webp" alt="Rafael Evan Kristanto" fill className="object-cover" priority />
                </div>
                {/* Status badge */}
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-5 py-2 rounded-full bg-white/90 backdrop-blur-sm border border-black/10 text-sm font-medium text-charcoal whitespace-nowrap shadow-md">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                  Available for hire
                </div>
              </div>

              {/* Tech Stack Icons */}
              <div className="flex gap-4 sm:gap-6 mt-8 justify-center items-center">
                {/* Vue.js */}
                <div className="w-12 h-12 flex items-center justify-center rounded-full bg-white/80 border border-black/10 shadow-sm transition-transform hover:scale-110" title="Vue.js">
                  <svg className="w-6 h-6 text-[#4FC08D]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24,1.61H14.06L12,5.16,9.94,1.61H0L12,22.39ZM12,14.08,5.16,2.23H9.59L12,6.41l2.41-4.18h4.43Z" />
                  </svg>
                </div>
                {/* Laravel */}
                <div className="w-12 h-12 flex items-center justify-center rounded-full bg-white/80 border border-black/10 shadow-sm transition-transform hover:scale-110" title="Laravel">
                  <svg className="w-6 h-6 text-[#FF2D20]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.618 6.452L12.75.753a1.51 1.51 0 00-1.5 0L1.382 6.452A1.493 1.493 0 00.63 7.747v11.396c0 .546.295 1.05.752 1.314l9.868 5.699a1.51 1.51 0 001.5 0l9.868-5.699a1.495 1.495 0 00.752-1.314V7.747a1.494 1.494 0 00-.752-1.295zm-1.026 12.355l-9.155 5.287a.5.5 0 01-.482 0l-9.146-5.287a.494.494 0 01-.252-.429v-5.234l4.982 2.876V19.49l4.414 2.548V13.88l-9.15-5.28 9.15-5.282a.5.5 0 01.482 0l9.15 5.282-9.15 5.28v8.158l4.415-2.548v-3.473l4.982-2.876v5.234a.494.494 0 01-.24.42zm-9.35-7.072L3.087 6.453l9.155-5.287 9.155 5.287-9.155 5.282z" />
                  </svg>
                </div>
                {/* Next.js */}
                <div className="w-12 h-12 flex items-center justify-center rounded-full bg-white/80 border border-black/10 shadow-sm transition-transform hover:scale-110" title="Next.js">
                  <svg className="w-6 h-6 text-ink" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 22.75C6.06294 22.75 1.25 17.9371 1.25 12C1.25 6.06294 6.06294 1.25 12 1.25C17.9371 1.25 22.75 6.06294 22.75 12C22.75 17.9371 17.9371 22.75 12 22.75ZM20.0888 18.0645C21.758 16.4259 22.75 14.3315 22.75 12C22.75 6.06294 17.9371 1.25 12 1.25C6.06294 1.25 1.25 6.06294 1.25 12C1.25 17.9371 6.06294 22.75 12 22.75C14.316 22.75 16.4022 21.7744 18.04 20.116L17.9897 20.0483L9.17646 8.35821H6.70296V16.3262H8.38459V10.1552L16.4862 20.897C16.8924 20.5292 17.2721 20.1264 17.6185 19.6917L17.7554 19.8973H20.0888V18.0645ZM16.0378 16.3262H17.7194V7.55529H16.0378V16.3262Z" />
                  </svg>
                </div>
                {/* MySQL */}
                <div className="w-12 h-12 flex items-center justify-center rounded-full bg-white/80 border border-black/10 shadow-sm transition-transform hover:scale-110" title="MySQL">
                  <svg className="w-6 h-6 text-[#4479A1]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.14 13.91C23.14 13.91 22.38 15.65 20.52 16.89C18.66 18.13 15.63 19.24 12 19.24C8.37 19.24 5.34 18.13 3.48 16.89C1.62 15.65 .86 13.91 .86 13.91M11.96 4.79C13.25 4.79 14.33 4.96 15.11 5.25L15.34 5.34L15.02 5.58C14.6 5.89 14.24 6.2 13.95 6.47L13.82 6.59L13.67 6.51C13.2 6.28 12.63 6.13 11.96 6.13C10.74 6.13 9.77 6.44 9.17 7.02L8.91 7.27L8.65 7.03C7.94 6.37 6.84 5.92 5.53 5.75L5.15 5.7M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Text Content */}
            <div className="animate-fade-in-up stagger-2 flex flex-col items-center lg:items-start text-center lg:text-left flex-1 max-w-2xl">
              <p className="text-body-text text-sm font-semibold tracking-widest uppercase mb-4">Welcome to my portfolio</p>
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 text-ink">
                Hi, I&apos;m <span className="text-ink">Rafael Evan Kristanto</span>
              </h1>
              <p className="text-body-text text-base md:text-lg leading-relaxed mb-8">
                An <span className="text-ink font-medium">Information System student</span> with a strong passion for crafting modern, functional, and user-friendly web interfaces. I specialize in building engaging frontend experiences that
                not only look great but also deliver seamless usability. With a keen eye for design and a problem-solving mindset, I aim to create digital products that provide real value to users.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start w-full sm:w-auto">
                <a
                  href="#projects"
                  id="cta-projects"
                  className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-ink text-white text-sm font-semibold rounded-full transition-colors duration-200 hover:bg-ink-deep w-full sm:w-auto"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  View Projects
                </a>
                <a
                  href="#contact"
                  id="cta-contact"
                  className="inline-flex items-center justify-center gap-2 px-8 py-3 border border-black/18 text-ink text-sm font-semibold rounded-full bg-white/70 backdrop-blur-sm transition-all duration-200 hover:bg-white/90 w-full sm:w-auto"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Contact Me
                </a>
              </div>

              {/* Stats */}
              <div className="flex gap-10 sm:gap-14 mt-12 justify-center lg:justify-start">
                {[
                  { value: "6", label: "Projects" },
                  { value: "3.64", label: "GPA" },
                  { value: "100%", label: "Dedication" },
                ].map((stat) => (
                  <div key={stat.label} className="text-center">
                    <p className="font-display text-3xl md:text-4xl font-bold text-ink">{stat.value}</p>
                    <p className="text-body-text text-xs md:text-sm mt-1 uppercase tracking-wider font-medium">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <hr className="border-t border-black/10 max-w-5xl mx-auto" />

      {/* ==================== FEATURED PROJECTS ==================== */}
      <section id="projects" className="py-[88px]">
        <div className="max-w-5xl mx-auto px-6">
          <AnimateOnScroll className="text-center mb-16">
            <p className="text-body-text text-xs font-medium tracking-widest uppercase mb-4">Portfolio</p>
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-ink mb-4">Featured Projects</h2>
            <p className="text-body-text text-base max-w-2xl mx-auto">Some of the best projects I have worked on, covering various technologies and digital solutions.</p>
          </AnimateOnScroll>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects.map((project, index) => (
              <AnimateOnScroll key={project.title} delay={index * 80} className={`${glassCardHover} flex flex-col overflow-hidden`}>
                {/* Project Image */}
                <div className="relative aspect-video overflow-hidden rounded-t-xl bg-black/5">
                  <Image src={project.image} alt={project.title} fill className="object-cover" />
                  {/* Role badge */}
                  <div className="absolute top-3 left-3">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-ink/90 backdrop-blur-sm text-white">{project.role}</span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-5 flex flex-col flex-grow">
                  <h3 className="font-display text-base font-semibold text-ink mb-2">{project.title}</h3>
                  <p className="text-body-text text-sm leading-relaxed mb-4">{project.description}</p>
                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mt-auto">
                    {project.tags.map((tag) => (
                      <span key={tag} className="px-3 py-1 text-xs font-medium rounded-full bg-black/5 border border-black/8 text-charcoal">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* Divider */}
      <hr className="border-t border-black/10 max-w-5xl mx-auto" />

      {/* ==================== CERTIFICATIONS ==================== */}
      <section id="certifications" className="py-[88px]">
        <div className="max-w-5xl mx-auto px-6">
          <AnimateOnScroll className="text-center mb-16">
            <p className="text-body-text text-xs font-medium tracking-widest uppercase mb-4">Achievements</p>
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-ink mb-4">My Certifications</h2>
            <p className="text-body-text text-base max-w-2xl mx-auto">Several certifications I have obtained to validate my skills in Frontend Web Development.</p>
          </AnimateOnScroll>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {certifications.map((cert, index) => (
              <AnimateOnScroll key={cert.title} delay={index * 80}>
                <a href={cert.pdf} target="_blank" rel="noopener noreferrer" className={`${glassCardHover} p-8 flex flex-col items-center text-center h-full block`}>
                  {/* Icon */}
                  <div className="w-14 h-14 rounded-full bg-white/70 border border-black/10 flex items-center justify-center mb-5">
                    <svg className="w-6 h-6 text-ink" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                      />
                    </svg>
                  </div>
                  <h3 className="font-display text-base font-semibold text-ink mb-2">{cert.title}</h3>
                  <p className="text-ink text-sm font-medium mb-1">{cert.issuer}</p>
                  <p className="text-body-text text-xs">{cert.date}</p>
                </a>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* Divider */}
      <hr className="border-t border-black/10 max-w-5xl mx-auto" />

      {/* ==================== CONTACT ==================== */}
      <section id="contact" className="py-[88px]">
        <div className="max-w-5xl mx-auto px-6">
          <AnimateOnScroll className="text-center mb-16">
            <p className="text-body-text text-xs font-medium tracking-widest uppercase mb-4">Get In Touch</p>
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-ink mb-4">Let&apos;s Connect</h2>
            <p className="text-body-text text-base max-w-2xl mx-auto">Interested in collaborating or have a question? Don't hesitate to contact me.</p>
          </AnimateOnScroll>

          {/* Contact Cards Grid */}
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* WhatsApp Card */}
            <AnimateOnScroll delay={100} className="h-full">
              <div className={`${glassCard} p-10 text-center h-full flex flex-col items-center justify-center`}>
                {/* WhatsApp icon */}
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-white/70 border border-black/10 flex items-center justify-center animate-float">
                  <svg className="w-8 h-8 text-ink" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                </div>

                <h3 className="font-display text-xl font-semibold text-ink mb-2">Chat via WhatsApp</h3>
                <p className="text-body-text text-sm mb-8 max-w-xs mx-auto">Send me a WhatsApp message and I will respond shortly.</p>

                <a
                  id="whatsapp-contact"
                  href={WA_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-auto inline-flex items-center justify-center gap-2 px-8 py-2.5 bg-ink text-white text-sm font-medium rounded-full transition-colors duration-200 hover:bg-ink-deep"
                >
                  <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  +62 822-7955-1837
                </a>
              </div>
            </AnimateOnScroll>

            {/* GitHub Card */}
            <AnimateOnScroll delay={200} className="h-full">
              <div className={`${glassCard} p-10 text-center h-full flex flex-col items-center justify-center`}>
                {/* GitHub icon */}
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-white/70 border border-black/10 flex items-center justify-center animate-float" style={{ animationDelay: "1s" }}>
                  <svg className="w-8 h-8 text-ink" fill="currentColor" viewBox="0 0 24 24">
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.866-.013-1.699-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.418 22 12c0-5.523-4.477-10-10-10z"
                    />
                  </svg>
                </div>

                <h3 className="font-display text-xl font-semibold text-ink mb-2">Visit my GitHub</h3>
                <p className="text-body-text text-sm mb-8 max-w-xs mx-auto">Check out my repositories, open-source contributions, and the code behind my projects.</p>

                <a
                  id="github-contact"
                  href="https://github.com/rafaelevan-k"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-auto inline-flex items-center justify-center gap-2 px-8 py-2.5 bg-ink text-white text-sm font-medium rounded-full transition-colors duration-200 hover:bg-ink-deep"
                >
                  <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.866-.013-1.699-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.418 22 12c0-5.523-4.477-10-10-10z"
                    />
                  </svg>
                  View GitHub
                </a>
              </div>
            </AnimateOnScroll>
          </div>
        </div>
      </section>

      {/* ==================== FOOTER ==================== */}
      <footer className="border-t border-black/10 py-8 bg-white/60 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <p className="text-body-text text-xs">&copy; {new Date().getFullYear()} Rafael Evan Kristanto. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
