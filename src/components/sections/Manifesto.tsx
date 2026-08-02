"use client";

import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { useLanguage } from "@/i18n/LanguageContext";

export function Manifesto() {
  const { dict } = useLanguage();
  const m = dict.manifesto;

  return (
    <section className="bg-beige/50 py-20 sm:py-28">
      <Container>
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-wood">{m.eyebrow}</span>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">{m.title}</h2>

            <div className="mt-8 space-y-4">
              {m.intro.map((p) => (
                <p key={p} className="text-base leading-relaxed text-ink/70 sm:text-lg">
                  {p}
                </p>
              ))}
            </div>

            <p className="mt-10 text-base font-medium text-ink sm:text-lg">{m.needsIntro}</p>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
              {m.needs.map((word, i) => (
                <span key={word} className="flex items-center gap-3">
                  <span className="text-2xl font-semibold tracking-tight text-olive-dark sm:text-3xl">{word}</span>
                  {i < m.needs.length - 1 && <span className="h-1.5 w-1.5 rounded-full bg-wood/40" />}
                </span>
              ))}
            </div>

            <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-ink/70 sm:text-lg">{m.needsDesc}</p>

            <div className="mx-auto mt-10 h-px w-16 bg-ink/10" />

            <div className="mx-auto mt-10 max-w-xl space-y-4">
              {m.belief.map((p) => (
                <p key={p} className="text-base leading-relaxed text-ink/70 sm:text-lg">
                  {p}
                </p>
              ))}
            </div>

            <p className="mx-auto mt-10 max-w-xl text-base leading-relaxed text-ink/70 sm:text-lg">
              {m.closingIntro}
            </p>

            <p className="mt-4 text-base text-ink/50 sm:text-lg">{m.closing[0]}</p>
            <p className="mt-1 text-xl font-semibold text-ink sm:text-2xl">{m.closing[1]}</p>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
