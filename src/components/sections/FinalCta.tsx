"use client";

import { Container } from "@/components/ui/Container";
import { LinkButton } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { useLanguage } from "@/i18n/LanguageContext";

export function FinalCta() {
  const { dict } = useLanguage();

  return (
    <section className="bg-olive-dark py-20 text-cream sm:py-24">
      <Container className="text-center">
        <Reveal>
          <h2 className="mx-auto max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
            {dict.finalCta.title}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-cream/80 sm:text-lg">{dict.finalCta.text}</p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <LinkButton href="/#booking" variant="secondary">
              {dict.finalCta.ctaPrimary}
            </LinkButton>
            <LinkButton href="/#booking" variant="outlineLight">
              {dict.finalCta.ctaSecondary}
            </LinkButton>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
