"use client";

import Image from "next/image";
import { Check, MapPin } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { LinkButton } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { useLanguage } from "@/i18n/LanguageContext";
import { siteConfig } from "@/config/site";

export function Location() {
  const { dict } = useLanguage();

  return (
    <section id="location" className="bg-beige/40 py-20 sm:py-28">
      <Container className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <Reveal>
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-wood">
            {dict.location.eyebrow}
          </span>
          <h2 className="mt-3 flex items-center gap-2 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            <MapPin className="text-olive-dark" size={28} />
            {dict.location.title}
          </h2>

          <ul className="mt-6 space-y-3">
            {dict.location.highlights.map((h) => (
              <li key={h} className="flex items-start gap-3 text-sm text-ink/75 sm:text-base">
                <Check size={18} className="mt-0.5 shrink-0 text-wood" />
                {h}
              </li>
            ))}
          </ul>

          <LinkButton
            href={siteConfig.location.googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8"
          >
            {dict.location.mapButton}
          </LinkButton>
        </Reveal>

        <Reveal delay={0.1}>
          <a
            href={siteConfig.location.googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative block aspect-[4/3] w-full overflow-hidden rounded-3xl shadow-card sm:aspect-[16/11]"
          >
            <Image
              src="/images/location/map-placeholder.svg"
              alt="Lokacija BJ Residence — Braće Jerković 112, Beograd"
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            />
          </a>
        </Reveal>
      </Container>
    </section>
  );
}
