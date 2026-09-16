// Hard cap on images per project (enforced by the admin section's upload actions).
export const MAX_IMAGES_PER_PROJECT = 60;

export type TagId =
  | "digital"
  | "traditional"
  | "concept"
  | "sketch"
  | "comission"
  | "landscape";

export const TAGS: { id: TagId; label: string }[] = [
  { id: "digital", label: "digital" },
  { id: "traditional", label: "traditional" },
  { id: "concept", label: "concept" },
  { id: "sketch", label: "sketch" },
  { id: "comission", label: "comission" },
  { id: "landscape", label: "landscape" },
];

export interface ProjectImage {
  src: string;
  width: number;
  height: number;
}

export interface Project {
  slug: string;
  title: string;
  tags: TagId[];
  tool: string;
  date: string;
  time: string;
  description: string;
  images: ProjectImage[];
  // Inactive projects are kept in storage (and stay editable in the admin
  // section) but are hidden from the public site and excluded from static
  // params / adjacency so they can't be found via prev/next or filters.
  active: boolean;
}

export interface SiteContact {
  tel: string;
  email: string;
  instagram: string;
  behance: string;
  linkedin: string;
  cvUrl: string;
}

export interface Site {
  name: string;
  heroLead: string;
  heroSecondary: string;
  about: string[];
  contact: SiteContact;
}
