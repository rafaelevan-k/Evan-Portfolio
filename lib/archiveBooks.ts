export type BookCategory = "cv" | "certifications" | "volunteer" | "awards";

export type ArchiveDocument = {
  title: string;
  path: string;
};

export type ArchiveBook = {
  id: string;
  title: string;
  category: BookCategory;
  color: string;
  documents: ArchiveDocument[];
  separateDocuments?: boolean; // If true, each document starts on a new physical left page.
};

export const archiveBooks: Record<BookCategory, ArchiveBook> = {
  cv: {
    id: "cv",
    title: "Curriculum Vitae",
    category: "cv",
    color: "#8B0000",
    documents: [{ title: "CV", path: "/documents/CV_Rafael_Evan_Kristanto_compressed.pdf" }],
  },
  certifications: {
    id: "certifications",
    title: "Certifications",
    category: "certifications",
    color: "#1E3A8A",
    separateDocuments: true,
    documents: [
      { title: "Belajar Dasar Pemrograman JavaScript", path: "/documents/Dicoding_Sertifikat_Belajar-Dasar-Pemrograman-JavaScript.pdf" },
      { title: "Belajar Dasar Pemrograman Web", path: "/documents/Dicoding_Sertifikat_Belajar-Dasar-Pemrograman-Web.pdf" },
      { title: "Belajar Membuat Frontend Web untuk Pemula", path: "/documents/Dicoding_Sertifikat_Belajar-Membuat-Front-End-Web-untuk-Pemula.pdf" },
    ],
  },
  volunteer: {
    id: "volunteer",
    title: "Volunteer & Organization",
    category: "volunteer",
    color: "#B8860B",
    separateDocuments: false, // Pack documents side-by-side
    documents: [
      { title: "Sertifikat ISC", path: "/documents/Sertifikat ISC.pdf" },
      { title: "Sertifikat HMSI", path: "/documents/Sertifikat HMSI Rafael Evan Kristanto.pdf" },
      { title: "Sertifikat BEM FTI", path: "/documents/Sertifikat BEM FTI Rafael Evan Kristanto.pdf" },
    ],
  },
  awards: {
    id: "awards",
    title: "Awards",
    category: "awards",
    color: "#2E8B57",
    separateDocuments: false, // Pack documents side-by-side
    documents: [{ title: "Pengabdian Masyarakat", path: "/documents/Sertifikat Program Kreativitas Mahasiswa-Pengabdian Masyarakat.pdf" }],
  },
};
