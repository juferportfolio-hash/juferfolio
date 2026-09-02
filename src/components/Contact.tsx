"use client";

import Image from "next/image";
import { useState } from "react";
import { SITE } from "@/lib/data";
import { SECTION_X } from "@/lib/ui";

export default function Contact() {
  const [message, setMessage] = useState("");
  const [waving, setWaving] = useState(false);

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;
    const email = SITE.contact.email || "";
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(
      "Hello from your portfolio site"
    )}&body=${encodeURIComponent(message)}`;
  }

  function handleWaveClick() {
    if (waving) return;
    setWaving(true);
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(200);
    }
    window.setTimeout(() => setWaving(false), 400);
  }

  return (
    <section className={`py-10 md:py-16 ${SECTION_X}`}>
      <h2 className="hover-roman font-caslon text-[30px] font-bold md:text-[40px]">
        say hello :)
      </h2>

      <p className="mt-6 font-archivo text-[14px] font-medium leading-[1.32] md:text-[17px]">
        I am excited to collab with you.
        <br />
        Hit me up and tell me about your ideas.
      </p>

      <form onSubmit={handleSend} className="mt-6 flex flex-col gap-4 md:mt-8 md:flex-row md:items-end md:gap-10">
        <div className="flex-1">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Your message to me..."
            rows={6}
            className="w-full resize-none border border-gray bg-transparent p-4 font-archivo text-[14px] font-medium placeholder:text-gray focus:outline-none md:text-[17px]"
          />
          <div className="mt-3 flex justify-end">
            <button
              type="submit"
              className="rounded-[6px] bg-ink px-6 py-2 font-archivo text-[14px] font-medium text-bg md:text-[16px]"
            >
              send
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={handleWaveClick}
          aria-label="wave hello"
          className={`w-[160px] shrink-0 self-center md:w-[220px] md:self-end md:pb-14 ${
            waving ? "animate-vibrate" : ""
          }`}
        >
          <Image
            src="/images/illustrations/wave-hand.png"
            alt=""
            width={1458}
            height={1209}
            className="h-auto w-full"
            aria-hidden="true"
          />
        </button>
      </form>
    </section>
  );
}
