import Image from "next/image";
import { SITE } from "@/lib/data";

export default function Hero() {
  return (
    <section className="flex flex-col-reverse items-start gap-8 border-b border-gray py-10 md:flex-row md:items-center md:gap-0 md:py-16">
      <div className="w-full shrink-0 px-5 md:w-[46%] md:px-0">
        <Image
          src="/images/illustrations/hero-sketch.png"
          alt="Sketch of Júlia Ferreira carrying a portfolio"
          width={3541}
          height={2995}
          priority
          className="h-auto w-full max-w-[560px]"
        />
      </div>
      <div className="px-5 md:flex-1 md:px-0 md:pl-[6%] md:pr-[30px]">
        <p className="font-archivo text-[14px] font-semibold leading-[1.32] md:text-[20px]">
          {SITE.heroLead}
        </p>
        <p className="mt-6 font-archivo text-[14px] font-semibold leading-[1.32] md:text-[20px]">
          {SITE.heroSecondary}
        </p>
      </div>
    </section>
  );
}
