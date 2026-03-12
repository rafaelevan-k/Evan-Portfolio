import Image from "next/image";
import Navbar from "@/components/Navbar";

const projects = [
  {
    title: "Sistem Informasi Inventory",
    role: "Full-Stack Developer",
    description: "Membangun sistem informasi pencatatan inventory multi-user untuk manajemen data dan monitoring barang suatu universitas yang memiliki fitur CRUD, pencarian, filter data, serta form pengaduan barang rusak.",
    image: "/project_inventory.png",
    tags: ["Next.js", "TypeScript", "MySQL"],
  },
  {
    title: "CyberShark LMS",
    role: "Frontend Developer",
    description: "Menjadi seorang Frontend Developer dalam project CyberShark LMS, sebuah platform LMS untuk bimbel yang memiliki fitur video dan text learning, quiz assessment, dan tracking nilai siswa.",
    image: "/project_cybershark.png",
    tags: ["Laravel", "CSS", "MySQL"],
  },
  {
    title: "Sinau Matika",
    role: "Frontend Developer",
    description: "Menjadi seorang Frontend Developer dalam project Sinau Matika, sebuah platform LMS dengan gamifikasi yang interaktif dan menarik untuk mata pelajaran Matematika siswa SD Kanisius Sorowajan.",
    image: "/project_sinaumatika.png",
    tags: ["Vue.js", "Slim", "MySQL"],
  },
  {
    title: "Portofolio",
    role: "Frontend Developer",
    description: "Menjadi seorang Frontend Developer dalam project Portofolio, sebuah platform untuk menampilkan portofolio saya.",
    image: "/project_porto.png",
    tags: ["Next.js", "TypeScript", "Tailwind CSS"],
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

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* ==================== HERO / ABOUT SECTION ==================== */}
      <section id="about" className="relative min-h-screen flex items-center pt-20 overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 dot-pattern opacity-50" />
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-accent/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 -right-32 w-80 h-80 bg-accent-light/8 rounded-full blur-[100px]" />

        <div className="relative max-w-6xl mx-auto px-6 py-20 w-full">
          <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-20">
            {/* Profile Image */}
            <div className="animate-fade-in-up flex-shrink-0">
              <div className="relative">
                {/* Glow ring */}
                <div className="absolute -inset-4 bg-gradient-to-br from-accent/30 via-accent-light/20 to-transparent rounded-full blur-2xl animate-pulse-glow" />
                {/* Image container */}
                <div className="relative w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 rounded-full overflow-hidden border-2 border-accent/20 glow">
                  <Image src="/foto-profil.jpeg" alt="Rafael Evan Kristanto" fill className="object-cover" priority />
                </div>
                {/* Status badge */}
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-1.5 rounded-full glass-card text-xs font-medium text-accent-light whitespace-nowrap">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  Available for hire
                </div>
              </div>
            </div>

            {/* Text Content */}
            <div className="animate-fade-in-up stagger-2 text-center lg:text-left flex-1">
              <p className="text-accent-light text-sm font-semibold tracking-widest uppercase mb-4">Welcome to my portfolio</p>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                Hi, I&apos;m <span className="gradient-text">Rafael Evan Kristanto</span>
              </h1>
              <p className="text-muted text-lg md:text-xl leading-relaxed max-w-xl mb-8">
                Seorang <span className="text-foreground font-medium">Mahasiswa Sistem Informasi</span> yang tertarik dalam membangun Frontend Web yang modern, fungsional, dan user-friendly.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <a
                  href="#projects"
                  className="btn-shine inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-accent hover:bg-accent/90 text-white font-semibold rounded-full transition-all duration-300 hover:shadow-lg hover:shadow-accent/25"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  Lihat Projek
                </a>
                <a
                  href="#contact"
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 border border-border rounded-full text-foreground font-semibold hover:bg-surface-hover hover:border-accent/30 transition-all duration-300"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Hubungi Saya
                </a>
              </div>

              {/* Stats */}
              <div className="flex gap-10 mt-12 justify-center lg:justify-start">
                {[
                  { value: "4", label: "Projects" },
                  { value: "3.64", label: "GPA" },
                  { value: "100%", label: "Dedication" },
                ].map((stat) => (
                  <div key={stat.label} className="text-center">
                    <p className="text-2xl md:text-3xl font-bold gradient-text">{stat.value}</p>
                    <p className="text-muted text-xs mt-1 uppercase tracking-wider">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Divider */}
      <div className="section-divider max-w-6xl mx-auto" />

      {/* ==================== FEATURED PROJECTS SECTION ==================== */}
      <section id="projects" className="relative py-28 overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[150px]" />

        <div className="relative max-w-6xl mx-auto px-6">
          {/* Section Header */}
          <div className="text-center mb-16">
            <p className="text-accent-light text-sm font-semibold tracking-widest uppercase mb-4">Portfolio</p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              Featured <span className="gradient-text">Projects</span>
            </h2>
            <p className="text-muted text-lg max-w-2xl mx-auto">Beberapa projek terbaik yang telah saya kerjakan, mencakup berbagai teknologi dan solusi digital.</p>
          </div>

          {/* Projects Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project, index) => (
              <div key={project.title} className={`glass-card rounded-2xl flex flex-col overflow-hidden group animate-fade-in-up stagger-${index + 1}`}>
                {/* Project Image */}
                <div className="relative aspect-video overflow-hidden">
                  <Image src={project.image} alt={project.title} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 image-overlay opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  {/* Role badge overlay */}
                  <div className="absolute top-3 left-3">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-accent/90 text-white backdrop-blur-sm">{project.role}</span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-xl font-bold mb-2 group-hover:text-accent-light transition-colors duration-300">{project.title}</h3>
                  <p className="text-muted text-sm leading-relaxed mb-4">{project.description}</p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mt-auto">
                    {project.tags.map((tag) => (
                      <span key={tag} className="px-3 py-1 text-xs font-medium rounded-full bg-accent/10 text-accent-light border border-accent/10">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section Divider */}
      <div className="section-divider max-w-6xl mx-auto" />

      {/* ==================== CERTIFICATIONS SECTION ==================== */}
      <section id="certifications" className="relative py-28 overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-0 right-1/4 w-80 h-80 bg-accent/5 rounded-full blur-[100px]" />

        <div className="relative max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-accent-light text-sm font-semibold tracking-widest uppercase mb-4">Achievements</p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              My <span className="gradient-text">Certifications</span>
            </h2>
            <p className="text-muted text-lg max-w-2xl mx-auto">Beberapa sertifikasi yang telah saya peroleh untuk memvalidasi keahlian di bidang Frontend Web Development.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certifications.map((cert, index) => (
              <a
                href={cert.pdf}
                target="_blank"
                rel="noopener noreferrer"
                key={cert.title}
                className={`glass-card rounded-2xl p-6 flex flex-col items-center text-center group animate-fade-in-up stagger-${index + 1} hover:border-accent/40`}
              >
                <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mb-6 text-accent-light group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-bold mb-2 group-hover:text-accent-light transition-colors">{cert.title}</h3>
                <p className="text-foreground font-medium text-sm mb-1">{cert.issuer}</p>
                <p className="text-muted text-xs">{cert.date}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Section Divider */}
      <div className="section-divider max-w-6xl mx-auto" />

      {/* ==================== CONTACT SECTION ==================== */}
      <section id="contact" className="relative py-28 overflow-hidden">
        {/* Background decorations */}
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-accent/8 rounded-full blur-[120px]" />
        <div className="absolute top-0 right-1/4 w-64 h-64 bg-accent-light/5 rounded-full blur-[100px]" />

        <div className="relative max-w-6xl mx-auto px-6">
          {/* Section Header */}
          <div className="text-center mb-16">
            <p className="text-accent-light text-sm font-semibold tracking-widest uppercase mb-4">Get In Touch</p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              Let&apos;s <span className="gradient-text">Connect</span>
            </h2>
            <p className="text-muted text-lg max-w-2xl mx-auto">Tertarik untuk berkolaborasi atau memiliki pertanyaan? Jangan ragu untuk menghubungi saya.</p>
          </div>

          {/* Contact Card */}
          <div className="max-w-xl mx-auto">
            <div className="glass-card rounded-3xl p-10 text-center relative overflow-hidden">
              {/* Decorative gradient */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-accent to-transparent" />

              {/* Email icon */}
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-accent/10 flex items-center justify-center animate-float">
                <svg className="w-9 h-9 text-accent-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>

              <h3 className="text-2xl font-bold mb-3">Send Me an Email</h3>
              <p className="text-muted mb-8 max-w-sm mx-auto">Kirimkan email kepada saya dan saya akan segera merespons pesan Anda.</p>

              <a
                href="mailto:rafaelevankristanto@gmail.com"
                className="btn-shine inline-flex items-center justify-center gap-3 px-10 py-4 bg-accent hover:bg-accent/90 text-white font-semibold rounded-full transition-all duration-300 hover:shadow-lg hover:shadow-accent/25 text-base"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                rafaelevan2005@gmail.com
              </a>

              {/* Decorative circles */}
              <div className="absolute -top-10 -right-10 w-32 h-32 border border-accent/5 rounded-full" />
              <div className="absolute -bottom-16 -left-16 w-48 h-48 border border-accent/5 rounded-full" />
            </div>
          </div>
        </div>
      </section>

      {/* ==================== FOOTER ==================== */}
      <footer className="border-t border-border py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-muted text-sm">
            &copy; {new Date().getFullYear()} <span className="gradient-text font-semibold">Rafael Evan Kristanto</span>. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

const navFooterLinks = [
  { label: "About", href: "#about" },
  { label: "Projects", href: "#projects" },
  { label: "Contact", href: "#contact" },
];
