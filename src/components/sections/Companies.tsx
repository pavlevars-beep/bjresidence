"use client";

import { Building2, Check } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { LinkButton } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { useLanguage } from "@/i18n/LanguageContext";

export function Companies() {
  const { dict } = useLanguage();

  return (
    <section id="for-companies" className="bg-ink py-20 text-cream sm:py-28">
      <Container className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <Reveal>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cream/10 text-wood">
            <Building2 size={24} />
          </div>
          <span className="mt-5 block text-xs font-semibold uppercase tracking-[0.18em] text-wood">
            {dict.companies.eyebrow}
          </span>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{dict.companies.title}</h2>
          <p className="mt-4 max-w-lg text-base leading-relaxed text-cream/70 sm:text-lg">
            {dict.companies.text}
          </p>
          <LinkButton href="/#booking" variant="secondary" className="mt-8">
            {dict.companies.cta}
          </LinkButton>
        </Reveal>

        <Reveal delay={0.1}>
          <ul className="grid gap-4 rounded-3xl bg-cream/5 p-8 sm:grid-cols-2">
            {dict.companies.highlights.map((h) => (
              <li key={h} className="flex items-start gap-3 text-sm text-cream/85 sm:text-base">
                <Check size={18} className="mt-0.5 shrink-0 text-wood" />
                {h}
              </li>
            ))}
          </ul>
        </Reveal>
      </Container>
    </section>
  );
}
