import Image from "next/image";
import Navbar from "@/components/Navbar";
import AnimateOnScroll from "@/components/AnimateOnScroll";

const projects = [
  {
    title: "Sistem Informasi Inventory",
    role: "Full-Stack Developer",
    description: "Membangun sistem informasi pencatatan inventory multi-user untuk manajemen data dan monitoring barang suatu universitas yang memiliki fitur CRUD, pencarian, filter data, serta form pengaduan barang rusak.",
    image: "/project_inventory.webp",
    tags: ["Next.js", "TypeScript", "MySQL"],
  },
  {
    title: "CyberShark LMS",
    role: "Frontend Developer",
    description: "Menjadi seorang Frontend Developer dalam project CyberShark LMS, sebuah platform LMS untuk bimbel yang memiliki fitur video dan text learning, quiz assessment, dan tracking nilai siswa.",
    image: "/project_cybershark.webp",
    tags: ["Laravel", "CSS", "MySQL"],
  },
  {
    title: "Sinau Matika",
    role: "Frontend Developer",
    description: "Menjadi seorang Frontend Developer dalam project Sinau Matika, sebuah platform LMS dengan gamifikasi yang interaktif dan menarik untuk mata pelajaran Matematika siswa SD Kanisius Sorowajan.",
    image: "/project_sinaumatika.webp",
    tags: ["Vue.js", "Slim", "MySQL"],
  },
  {
    title: "Portofolio",
    role: "Frontend Developer",
    description: "Menjadi seorang Frontend Developer dalam project Portofolio, sebuah platform untuk menampilkan portofolio saya.",
    image: "/project_portofolio.webp",
    tags: ["Next.js", "TypeScript", "Tailwind CSS"],
  },
  {
    title: "E-Catalog Maha Laptop",
    role: "Full-Stack Developer",
    description: "Menjadi seorang Fullstack Developer dalam project E-Catalog Maha Laptop, sebuah platform untuk menampilkan katalog produk laptop, lengkap dengan fitur CRUD dan fitur pencarian untuk Admin dan Customer.",
    image: "/project_mahalaptop.webp",
    tags: ["Laravel", "Tailwind CSS", "MySQL"],
  },
  {
    title: "Yuna Personal Assistant",
    role: "Full-Stack Developer",
    description:
      "Menjadi seorang Fullstack Developer dalam membangun Yuna Personal Assistant, sebuah AI chatbot sekaligus AI Agent untuk coding framework Laravel. Menggunakan model LLM local Deepseek Coder dan Llama3 dan integrasi teknologi Web Search API dari Google",
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
const WA_MESSAGE = encodeURIComponent("Halo, kami tertarik dengan portfolio yang Anda miliki dan berencana untuk menghubungi Anda lebih lanjut...");
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
            {/* Profile Image */}
            <div className="animate-fade-in-up flex-shrink-0 lg:mt-8">
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
                  Lihat Projek
                </a>
                <a
                  href="#contact"
                  id="cta-contact"
                  className="inline-flex items-center justify-center gap-2 px-8 py-3 border border-black/18 text-ink text-sm font-semibold rounded-full bg-white/70 backdrop-blur-sm transition-all duration-200 hover:bg-white/90 w-full sm:w-auto"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Hubungi Saya
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
            <p className="text-body-text text-base max-w-2xl mx-auto">Beberapa projek terbaik yang telah saya kerjakan, mencakup berbagai teknologi dan solusi digital.</p>
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
            <p className="text-body-text text-base max-w-2xl mx-auto">Beberapa sertifikasi yang telah saya peroleh untuk memvalidasi keahlian di bidang Frontend Web Development.</p>
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
            <p className="text-body-text text-base max-w-2xl mx-auto">Tertarik untuk berkolaborasi atau memiliki pertanyaan? Jangan ragu untuk menghubungi saya.</p>
          </AnimateOnScroll>

          {/* Contact Card */}
          <AnimateOnScroll className="max-w-md mx-auto" delay={100}>
            <div className={`${glassCard} p-10 text-center`}>
              {/* WhatsApp icon */}
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-white/70 border border-black/10 flex items-center justify-center animate-float">
                <svg className="w-8 h-8 text-ink" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </div>

              <h3 className="font-display text-xl font-semibold text-ink mb-2">Chat via WhatsApp</h3>
              <p className="text-body-text text-sm mb-8 max-w-xs mx-auto">Kirimkan pesan WhatsApp kepada saya dan saya akan segera merespons.</p>

              <a
                id="whatsapp-contact"
                href={WA_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-8 py-2.5 bg-ink text-white text-sm font-medium rounded-full transition-colors duration-200 hover:bg-ink-deep"
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                +62 822-7955-1837
              </a>
            </div>
          </AnimateOnScroll>
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
