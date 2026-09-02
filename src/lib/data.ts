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
}

const descriptions: Record<string, string> = {
  "river-clearing": "A quiet clearing where a stream cuts through tall grass, painted as a study in light and reflection.",
  "forest-shrine": "A traveler rests beside a weathered torii gate on the edge of the woods.",
  "library-study": "Three students share a table in the library, heads bent low over the evening's reading.",
  "quiet-bedroom": "Early morning light slips through the blinds of a sleeper's room.",
  "yellow-door": "Sunlight and shadow play across the yellow door of a quiet house.",
  "ivy-wall": "Ivy climbs a sunlit courtyard wall, framed in soft midday light.",
  "night-alley": "A figure walks home through a narrow, lantern-lit alley at night.",
  "snow-house": "Snow settles on the eaves of a small house as its windows glow warm against the cold.",
  "countryside-train": "A local train winds along power lines through open countryside.",
  "station-bench": "An old wooden bench waits in the quiet hall of a traditional train station.",
  "vending-machine-street": "A backstreet corner with a glowing vending machine, painted in the last light of evening.",
  "still-waters": "A commissioned character study, submerged in still, shadowed water.",
  "hero-duo": "Two heroes brace for action beneath a bright sky, painted for a client's original characters.",
  "character-turnaround": "A full character turnaround sheet built for reference across multiple poses.",
  "streetlight-friends": "Two friends share a laugh on a tree-lined street corner, commissioned as a birthday gift.",
  "red-curtain-dance": "A commissioned portrait of two dancers caught mid-step before heavy red curtains.",
  "formal-portrait": "A clean, minimal commission portrait dressed for a formal evening.",
  "branch-over-ocean": "A couple commissioned together, perched on a branch above the open sea.",
  "split-portrait": "A two-panel commissioned portrait set against blooming cherry blossoms.",
  "bridge-friends": "A group of friends pause on a bridge in their school uniforms, commissioned as a keepsake.",
  "plaid-skirt-character": "An original character commission, rendered clean against a plain backdrop.",
  "crouching-portrait": "A minimal, moody character study commissioned in a limited palette.",
  "dock-with-family": "A family commission spent together at the edge of a lily-covered pond.",
  "forest-vignette": "A vignette commission of a quiet moment shared in the forest.",
  "orange-scarf-hug": "A warm commissioned portrait of a couple wrapped up together against the cold.",
  "cherry-blossom-trio": "Three friends commissioned together beneath the cherry blossoms.",
  "kitchen-couple": "A commissioned everyday moment, shared over coffee in the kitchen.",
  "sailing-couple": "A commissioned couple portrait out on the water, sails catching the wind.",
  "laptop-silhouette": "A quiet commissioned study of two people working side by side.",
};

const raw: (Omit<Project, "description" | "images"> & {
  width: number;
  height: number;
})[] = [
  { slug: "river-clearing", title: "Riverside Clearing", tags: ["concept", "landscape"], tool: "Digital Painting", date: "2025", time: "4 hours", width: 2000, height: 1133 },
  { slug: "forest-shrine", title: "Forest Shrine Path", tags: ["concept", "landscape"], tool: "Clip Studio Paint", date: "2021", time: "6 hours", width: 2000, height: 986 },
  { slug: "library-study", title: "Late Study Session", tags: ["concept", "digital"], tool: "Clip Studio Paint", date: "2025", time: "8 hours", width: 1765, height: 2000 },
  { slug: "quiet-bedroom", title: "Quiet Bedroom", tags: ["concept", "digital"], tool: "Procreate", date: "2021", time: "5 hours", width: 2000, height: 1133 },
  { slug: "yellow-door", title: "Yellow Door No. 1", tags: ["concept", "landscape"], tool: "Clip Studio Paint", date: "2022", time: "3 hours", width: 2000, height: 1133 },
  { slug: "ivy-wall", title: "Ivy Wall", tags: ["concept", "landscape"], tool: "Procreate", date: "2021", time: "2 hours", width: 2000, height: 1133 },
  { slug: "night-alley", title: "Night Alley", tags: ["concept", "landscape"], tool: "Clip Studio Paint", date: "2026", time: "5 hours", width: 2000, height: 1133 },
  { slug: "snow-house", title: "Snow House", tags: ["concept", "landscape"], tool: "Clip Studio Paint", date: "2021", time: "6 hours", width: 2000, height: 1133 },
  { slug: "countryside-train", title: "Countryside Train", tags: ["concept", "landscape"], tool: "Clip Studio Paint", date: "2023", time: "4 hours", width: 2000, height: 1133 },
  { slug: "station-bench", title: "Station Bench", tags: ["concept", "traditional"], tool: "Clip Studio Paint", date: "2023", time: "5 hours", width: 1502, height: 2000 },
  { slug: "vending-machine-street", title: "Vending Machine Street", tags: ["concept", "landscape"], tool: "Clip Studio Paint", date: "2026", time: "7 hours", width: 2000, height: 1133 },
  { slug: "still-waters", title: "Still Waters", tags: ["comission", "digital"], tool: "Clip Studio Paint", date: "2026", time: "6 hours", width: 2000, height: 1133 },
  { slug: "hero-duo", title: "Hero Duo", tags: ["comission", "digital"], tool: "Clip Studio Paint", date: "2026", time: "10 hours", width: 2000, height: 1133 },
  { slug: "character-turnaround", title: "Character Turnaround", tags: ["comission", "sketch"], tool: "Clip Studio Paint", date: "2026", time: "3 hours", width: 2000, height: 1443 },
  { slug: "streetlight-friends", title: "Streetlight Friends", tags: ["comission", "digital"], tool: "Clip Studio Paint", date: "2026", time: "9 hours", width: 2000, height: 1133 },
  { slug: "red-curtain-dance", title: "Red Curtain Dance", tags: ["comission", "digital"], tool: "Clip Studio Paint", date: "2026", time: "8 hours", width: 1460, height: 2000 },
  { slug: "formal-portrait", title: "Formal Portrait", tags: ["comission", "sketch"], tool: "Procreate", date: "2025", time: "2 hours", width: 1360, height: 2000 },
  { slug: "branch-over-ocean", title: "Branch Over Ocean", tags: ["comission", "digital"], tool: "Procreate", date: "2025", time: "5 hours", width: 2000, height: 1546 },
  { slug: "split-portrait", title: "Split Portrait", tags: ["comission", "digital"], tool: "Procreate", date: "2025", time: "4 hours", width: 1765, height: 2000 },
  { slug: "bridge-friends", title: "Bridge Friends", tags: ["comission", "digital"], tool: "Procreate", date: "2025", time: "7 hours", width: 1353, height: 2000 },
  { slug: "plaid-skirt-character", title: "Plaid Skirt Character", tags: ["comission", "digital"], tool: "Procreate", date: "2025", time: "3 hours", width: 1496, height: 2000 },
  { slug: "crouching-portrait", title: "Crouching Portrait", tags: ["comission", "sketch"], tool: "Procreate", date: "2025", time: "2 hours", width: 1687, height: 2000 },
  { slug: "dock-with-family", title: "Dock With Family", tags: ["comission", "digital"], tool: "Procreate", date: "2025", time: "6 hours", width: 2000, height: 1321 },
  { slug: "forest-vignette", title: "Forest Vignette", tags: ["comission", "digital"], tool: "Procreate", date: "2025", time: "4 hours", width: 1593, height: 2000 },
  { slug: "orange-scarf-hug", title: "Orange Scarf Hug", tags: ["comission", "digital"], tool: "Procreate", date: "2025", time: "3 hours", width: 1209, height: 2000 },
  { slug: "cherry-blossom-trio", title: "Cherry Blossom Trio", tags: ["comission", "digital"], tool: "Procreate", date: "2026", time: "8 hours", width: 1692, height: 2000 },
  { slug: "kitchen-couple", title: "Kitchen Couple", tags: ["comission", "digital"], tool: "Procreate", date: "2026", time: "4 hours", width: 2000, height: 1139 },
  { slug: "sailing-couple", title: "Sailing Couple", tags: ["comission", "digital"], tool: "Procreate", date: "2026", time: "6 hours", width: 2000, height: 1455 },
  { slug: "laptop-silhouette", title: "Laptop Silhouette", tags: ["comission", "digital"], tool: "Procreate", date: "2026", time: "3 hours", width: 2000, height: 1539 },
];

export const PROJECTS: Project[] = raw.map((p) => ({
  ...p,
  description: descriptions[p.slug] ?? "",
  images: [{ src: `/images/projects/${p.slug}.jpg`, width: p.width, height: p.height }],
}));

export function getProject(slug: string): Project | undefined {
  return PROJECTS.find((p) => p.slug === slug);
}

export function getAdjacentProjects(slug: string): { prev: Project | null; next: Project | null } {
  const i = PROJECTS.findIndex((p) => p.slug === slug);
  if (i === -1) return { prev: null, next: null };
  const prev = PROJECTS[(i - 1 + PROJECTS.length) % PROJECTS.length];
  const next = PROJECTS[(i + 1) % PROJECTS.length];
  return { prev, next };
}

export const SITE = {
  name: "Júlia Ferreira",
  heroLead:
    "Júlia Ferreira is a experienced and talented illustrator and designer based in Rio de Janeiro.",
  heroSecondary: "Her works range from mural art over digital drawings to brand design.",
  about: [
    "Júlia Ferreira is a experienced and talented illustrator and designer based in Rio de Janeiro, Brazil. Her works range from mural art over digital drawings to brand design.  Júlia Ferreira is a experienced and talented illustrator and designer based in Rio de Janeiro, Brazil.",
    "Her works range from mural art over digital drawings to brand design. Júlia Ferreira is a experienced and talented illustrator and designer based in Rio de Janeiro, Brazil. Her works range from mural art over digital drawings to brand design.  Júlia Ferreira is a experienced and talented illustrator and designer based in Rio de Janeiro, Brazil. Her works range from mural art over digital drawings to brand design.  Júlia Ferreira is a experienced and talented illustrator and designer based in Rio de Janeiro, Brazil.",
  ],
  contact: {
    tel: "",
    email: "",
    instagram: "",
    linkedin: "",
    cvUrl: "",
  },
};
