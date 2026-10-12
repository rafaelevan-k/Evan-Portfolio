// Education and experience transcribed from the portfolio's existing CV.
export const education = {
  institution: "Universitas Kristen Duta Wacana",
  degree: "Bachelor of Information Systems",
  period: "2023 – present",
  gpa: "3.64 / 4.00",
};

export const experiences = [
  { title: "Teaching Assistant", organization: "UKDW · Introduction to Programming", period: "Aug – Dec 2025", description: "Supporting students in the Introduction to Programming course.", category: "Teaching" },
  { title: "Teaching Assistant", organization: "UKDW · Programming Logic Matriculation", period: "Aug – Dec 2024", description: "Supporting students in Programming Logic Matriculation.", category: "Teaching" },
  { title: "Head of Partnership & Relations", organization: "BEM FTI UKDW", period: "Feb 2025 – Jan 2026", description: "Leading the Partnership & Relations department of the Faculty of Information Technology student executive board.", category: "Leadership" },
  { title: "Chairperson", organization: "FTI FEST", period: "Aug – Dec 2025", description: "Leading the FTI FEST organizing team.", category: "Leadership" },
  { title: "Chairperson", organization: "Information System Competition (ISC)", period: "Sep – Nov 2024", description: "Leading the Information System Competition organizing team.", category: "Leadership" },
  { title: "Creative Economy Division Member", organization: "HMSI UKDW", period: "Feb 2024 – Jan 2025", description: "Contributing to the Information Systems student association's creative economy division.", category: "Organization" },
  { title: "Event Division Member", organization: "Studi Banding FTI", period: "Sep 2024 – Nov 2025", description: "Contributing to the event division for Studi Banding FTI.", category: "Organization" },
] as const;

export const skillCategories = [
  { id: "frontend", title: "Frontend", description: "Responsive interfaces and interactive web experiences.", items: ["JavaScript", "TypeScript", "HTML5", "CSS3", "React", "Next.js", "Vue.js", "Tailwind CSS"] },
  { id: "backend", title: "Backend & data", description: "Application structure, APIs, and data management.", items: ["PHP", "Laravel", "Node.js", "Slim Framework", "MySQL", "PostgreSQL", "Python", "RESTful APIs"] },
  { id: "tools", title: "Tools & practice", description: "A practical workflow for building and collaborating.", items: ["Git", "GitHub", "VS Code", "Postman", "MVC", "CRUD", "Object-oriented programming", "Team collaboration"] },
] as const;

export const CV_PATH = "/documents/CV_Rafael_Evan_Kristanto_compressed.pdf";
