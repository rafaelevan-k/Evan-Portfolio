import type { StaticImageData } from "next/image";

export type GameProject = {
  title: string;
  shortTitle: string;
  number: string;
  role: string;
  description: string;
  image: StaticImageData | string;
  tags: string[];
  repoLink?: string;
  isPrivate?: boolean;
  tone: string;
};

export type GameCertification = {
  title: string;
  displayTitle?: string;
  issuer: string;
  date: string;
  pdf: string;
  mark: string;
};

export const stationIds = ["profile", "works", "study", "archive", "contact"] as const;

export type StationId = (typeof stationIds)[number];

export type TrainStation = {
  id: StationId;
  code: string;
  platform: string;
  name: string;
  label: string;
  tagline: string;
  announcement: string;
  objective: string;
  accent: string;
  xp: number;
};

export const trainStations = [
  {
    id: "profile",
    code: "REK-01",
    platform: "Platform 1",
    name: "Origin",
    label: "Profile",
    tagline: "Meet the person, place, and disciplines behind the work.",
    announcement: "Now arriving at Origin. Meet Rafael and choose a focus lens.",
    objective: "Choose a focus lens and trace it to real project evidence.",
    accent: "#D94B35",
    xp: 20,
  },
  {
    id: "works",
    code: "REK-02",
    platform: "Platform 2",
    name: "Project Yard",
    label: "Projects",
    tagline: "Route six real builds through their roles, tools, and constraints.",
    announcement: "Now arriving at Project Yard. Select a build and dispatch its signal.",
    objective: "Dispatch a project signal and inspect the evidence behind the route.",
    accent: "#315F73",
    xp: 20,
  },
  {
    id: "study",
    code: "REK-03",
    platform: "Platform 3",
    name: "Learning Junction",
    label: "Learning",
    tagline: "Review formal checkpoints in an ongoing practice of building.",
    announcement: "Now arriving at Learning Junction. Three credentials are ready for review.",
    objective: "Review Rafael's verified web development credentials.",
    accent: "#B38A37",
    xp: 20,
  },
  {
    id: "archive",
    code: "REK-04",
    platform: "Archive Spur",
    name: "Archive Depot",
    label: "Archive",
    tagline: "Connect to the deeper three-dimensional record room.",
    announcement: "Now arriving at Archive Depot. The three-dimensional record room is available on request.",
    objective: "Preview the record groups, then choose whether to load the 3D archive.",
    accent: "#64536F",
    xp: 20,
  },
  {
    id: "contact",
    code: "REK-05",
    platform: "Terminus",
    name: "Open Line",
    label: "Contact",
    tagline: "Turn the final stop into a useful first conversation.",
    announcement: "Now arriving at Open Line. Choose a conversation and contact Rafael directly.",
    objective: "Choose a purpose and prepare a direct message to Rafael.",
    accent: "#3F6E61",
    xp: 20,
  },
] as const satisfies readonly TrainStation[];
