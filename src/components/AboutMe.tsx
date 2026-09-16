import Image from "next/image";
import type { Site } from "@/lib/data";
import { SECTION_X } from "@/lib/ui";

function SmallHeadline({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-archivo text-[14px] font-light text-gray">{children}</p>
  );
}

function SocialLink({ label, href, text }: { label: string; href: string; text: string }) {
  if (!href) {
    return (
      <>
        <p className="mt-2 font-archivo text-[14px] font-medium md:text-[17px]">{label}:</p>
        <p className="font-archivo text-[14px] font-medium md:text-[17px]"> </p>
      </>
    );
  }
  return (
    <>
      <p className="mt-2 font-archivo text-[14px] font-medium md:text-[17px]">{label}:</p>
      <p className="font-archivo text-[14px] font-medium underline md:text-[17px]">
        <a href={href} target="_blank" rel="noopener noreferrer">
          {text}
        </a>
      </p>
    </>
  );
}

export default function AboutMe({ site }: { site: Site }) {
  const { contact } = site;

  return (
    <section id="about-me" className={`border-b border-gray py-10 md:py-16 ${SECTION_X}`}>
      <h2 className="hover-roman inline-block font-caslon text-[30px] font-bold md:text-[40px]">
        about me
      </h2>

      {/* md:flex-row with default (stretch) cross-axis alignment makes the text
          and image columns the same height, so the contact grid's md:mt-auto
          below lands flush with the image's bottom edge. The image column is
          md:flex-1 against the text's md:flex-[2] — with the same md:gap-[30px]
          used by the 3-column project grid, that's a 1-of-3 share of the same
          content width, so the image ends up exactly one project-card-column
          wide. */}
      <div className="mt-8 flex flex-col gap-8 md:mt-10 md:flex-row md:gap-[30px]">
        <div className="order-2 flex flex-col md:order-1 md:flex-[2]">
          <div className="space-y-6">
            {site.about.map((p, i) => (
              <p
                key={i}
                className="font-archivo text-[14px] font-medium leading-[1.32] md:text-[17px]"
              >
                {p}
              </p>
            ))}
          </div>

          <div className="contact-info-grid mt-12 md:mt-auto">
            <div style={{ gridArea: "contact" }}>
              <SmallHeadline>Contact</SmallHeadline>
              <p className="mt-2 font-archivo text-[14px] font-medium md:text-[17px]">
                Tel:
              </p>
              <p className="font-archivo text-[14px] font-medium md:text-[17px]">
                {contact.tel || " "}
              </p>
              <p className="mt-2 font-archivo text-[14px] font-medium md:text-[17px]">
                E-Mail:
              </p>
              <p className="font-archivo text-[14px] font-medium md:text-[17px]">
                {contact.email || " "}
              </p>
            </div>
            <div style={{ gridArea: "socials" }}>
              <SmallHeadline>Socials</SmallHeadline>
              <SocialLink label="Instagram" href={contact.instagram} text="@ophelontheshore" />
              <SocialLink label="Behance" href={contact.behance} text="jliaferreira28" />
              <SocialLink label="LinkedIn" href={contact.linkedin} text="júlia ferreira" />
            </div>
            <div style={{ gridArea: "cv" }}>
              <SmallHeadline>CV:</SmallHeadline>
              <p className="mt-2 font-archivo text-[14px] font-medium md:text-[17px]">
                Download my
              </p>
              <p className="font-archivo text-[14px] font-medium underline md:text-[17px]">
                <a href={contact.cvUrl || "#"}>CV here</a>
              </p>
            </div>
          </div>
        </div>

        <div className="order-1 overflow-hidden rounded-[7px] md:order-2 md:flex-1">
          <Image
            src="/images/about/painting.jpg"
            alt="Júlia Ferreira painting a mural"
            width={1174}
            height={1600}
            className="h-auto w-full"
          />
        </div>
      </div>
    </section>
  );
}
