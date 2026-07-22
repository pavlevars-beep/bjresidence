"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { useLanguage } from "@/i18n/LanguageContext";

export function LegalPage({ page }: { page: "privacy" | "terms" }) {
  const { dict } = useLanguage();
  const content = dict.legalPages[page];

  return (
    <section className="py-16 sm:py-24">
      <Container className="max-w-2xl">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-olive-dark hover:underline">
          <ArrowLeft size={16} /> {dict.common.backHome}
        </Link>
        <h1 className="mt-6 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">{content.title}</h1>
        <p className="mt-2 text-sm text-ink/50">{content.updated}: 2026-07-22</p>
        <div className="mt-8 space-y-5">
          {content.body.map((p, i) => (
            <p key={i} className="text-base leading-relaxed text-ink/75">
              {p}
            </p>
          ))}
        </div>
      </Container>
    </section>
  );
}
