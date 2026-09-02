import Image from "next/image";
import { SITE } from "@/lib/data";
import { SECTION_X } from "@/lib/ui";

function SmallHeadline({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-archivo text-[14px] font-light text-gray">{children}</p>
  );
}

export default function AboutMe() {
  const { contact } = SITE;

  return (
    <section id="about-me" className={`border-b border-gray py-10 md:py-16 ${SECTION_X}`}>
      <h2 className="hover-roman font-caslon text-[30px] font-bold md:text-[40px]">
        about me
      </h2>

      <div className="mt-8 grid grid-cols-1 gap-8 md:mt-10 md:grid-cols-2 md:gap-16">
        <div className="order-2 md:order-1">
          <div className="space-y-6">
            {SITE.about.map((p, i) => (
              <p
                key={i}
                className="font-archivo text-[14px] font-medium leading-[1.32] md:text-[17px]"
              >
                {p}
              </p>
            ))}
          </div>

          <div className="mt-12 grid grid-cols-2 gap-x-6 gap-y-8 md:mt-20 md:grid-cols-3">
            <div>
              <SmallHeadline>Contact</SmallHeadline>
              <p className="mt-2 font-archivo text-[14px] font-medium md:text-[17px]">
                Tel:
              </p>
              <p className="font-archivo text-[14px] font-medium md:text-[17px]">
                {contact.tel || " "}
              </p>
              <p className="mt-1 font-archivo text-[14px] font-medium md:text-[17px]">
                E-Mail:
              </p>
              <p className="font-archivo text-[14px] font-medium md:text-[17px]">
                {contact.email || " "}
              </p>
            </div>
            <div>
              <SmallHeadline>Socials</SmallHeadline>
              <p className="mt-2 font-archivo text-[14px] font-medium md:text-[17px]">
                Instagram:
              </p>
              <p className="font-archivo text-[14px] font-medium md:text-[17px]">
                {contact.instagram || " "}
              </p>
              <p className="mt-1 font-archivo text-[14px] font-medium md:text-[17px]">
                LinkedIn:
              </p>
              <p className="font-archivo text-[14px] font-medium md:text-[17px]">
                {contact.linkedin || " "}
              </p>
            </div>
            <div>
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

        <div className="order-1 md:order-2">
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
