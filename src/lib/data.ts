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

// Every commission piece shares this description (per Júlia's own text: "template
// for every commission, changing only year and duration") — only the tool name
// changes, pulled from each project's own `tool` field below.
function commissionDescription(tool: string): string {
  return `Created with ${tool} and commissioned by a customer via Instagram page @nor.ophelia. Some of the characters portrayed in the artwork are owned by authors of the respective source inspiration animation and/or media.`;
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
  "spring-in-the-floating-world": "Crafted during my second semester of a year-long academic exchange in Darmstadt, Germany, Spring in the Floating World is the first illustrated book I had the opportunity to work on. It's idea was created amidst the weekly encounters of the course Entwurf III/IV by Sabine Zimmermann at the Hochschule Darmstadt's Design Faculty. The course had the theme \"geist\", or \"ghost\", as a starting point, which I've decided to portray as memories displayed through the observation and painting of daily life landscapes and fragments.",
  "mural-painting": "Inspired by the university's setting and the fostering of education and innovation, this mural painting was commissioned by Pontifícia Universidade Católica to ornate the wall of PIUES's office. Work with the collaboration of the visual artists Pedro Padilha and Mateu Velasco.",
  "daad-illustrations": "Following my one year stay in Germany, of which's first five months were supported by DAAD's STIBET grant, I had the opportunity to join the DAAD Brasil team at its regional office in Rio de Janeiro as an intern working with communication and design. Creating illustrations for DAAD Brasil's pages on social media was part of my job, amongst other daily tasks that allowed me to explore design and art through image and text juxtaposition.",
  "pattern-design": "This pattern design was created in collaboration with the textile designer Patrícia Bomeny and commissioned by Shopping Leblon and Lenny Niemeyer's collaborative campaign in celebration of their 30 and 35 year anniversary respectively. Besides its application on fabric for clothing, the pattern was later used to ornate Shopping Leblon's 275sqm glass front and inspire Lenny Niemeyer's store display painting, also created by Patrícia and I.",
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
  { slug: "spring-in-the-floating-world", title: "Spring in the Floating World", tags: ["traditional", "concept"], tool: "", date: "2025", time: "3 months", width: 1525, height: 965 },
  { slug: "mural-painting", title: "Mural painting", tags: ["traditional", "comission"], tool: "", date: "2026", time: "20 hours", width: 2000, height: 1334 },
  { slug: "daad-illustrations", title: "Illustrations for social media", tags: ["digital", "concept"], tool: "", date: "2026", time: "-", width: 2000, height: 1125 },
  { slug: "pattern-design", title: "Pattern design", tags: ["digital", "comission"], tool: "", date: "2026", time: "20 hours", width: 1618, height: 2000 },
];

export const PROJECTS: Project[] = raw.map((p) => ({
  ...p,
  description:
    descriptions[p.slug] ??
    (p.tags.includes("comission") ? commissionDescription(p.tool) : ""),
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
    "5th year design bachelor at PUC-Rio working by mixing graphic design and visual arts. Inspired by nature, society and literature, landscapes, human figure and visual narratives is what I like best about art.",
  heroSecondary:
    "This portfolio features analog and digital processes, ranging from mural artwork to pattern design and concept art.",
  about: [
    "Born in Salvador, in Brazil, Júlia moved to Rio de Janeiro in 2020 and has lived, studied and worked there ever since. It was through studying design with emphasis in arts and multissensorial communications at PUC-Rio that she's grown into identifying herself as an illustrator, despite having drawn her whole life as a hobby. In the early pandemics months she created the instagram account under the name nor.ophelia that quickly grew its following and made possible for her to work on more than eighty commission artworks since it's creation.",
  ],
  contact: {
    tel: "",
    email: "",
    instagram: "https://www.instagram.com/ophelontheshore?igsi=YzA4dTIyaTBzaHVq&utm_source=qr",
    behance: "https://www.behance.net/jliaferreira28",
    linkedin: "https://www.linkedin.com/in/j%C3%BAlia-ferreira-262747382/",
    cvUrl: "",
  },
};
