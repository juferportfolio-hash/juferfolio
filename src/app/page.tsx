import Hero from "@/components/Hero";
import ProjectsSection from "@/components/ProjectsSection";
import AboutMe from "@/components/AboutMe";
import Contact from "@/components/Contact";
import { getActiveProjects, getSite } from "@/lib/store";

// Project and site-text data now live in /data/*.json and are edited from
// /admin, so this page reads fresh on every request instead of being
// statically generated at build time.
export const dynamic = "force-dynamic";

export default async function Home() {
  const projects = await getActiveProjects();
  const site = await getSite();

  return (
    <main>
      <Hero site={site} />
      <ProjectsSection projects={projects} />
      <AboutMe site={site} />
      <Contact site={site} />
    </main>
  );
}
