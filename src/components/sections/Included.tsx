"use client";

import { motion } from "framer-motion";
import {
  AirVent,
  BedDouble,
  Clapperboard,
  ChefHat,
  Footprints,
  RefreshCw,
  Sofa,
  Sparkles,
  ShowerHead,
  Trees,
  Wifi,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { useLanguage } from "@/i18n/LanguageContext";
import { siteConfig } from "@/config/site";

const groupIcons: LucideIcon[] = [BedDouble, ChefHat, ShowerHead, Footprints, Sofa, Trees];
const extraIcons: LucideIcon[] = [Zap, AirVent, Wifi, Clapperboard, RefreshCw, Sparkles];

export function Included() {
  const { dict } = useLanguage();

  return (
    <section id="included" className="bg-cream py-20 sm:py-28">
      <Container>
        <SectionHeading eyebrow={dict.included.eyebrow} title={dict.included.title} />

        <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {dict.included.groups.map((group, i) => {
            const Icon = groupIcons[i] ?? Sparkles;
            return (
              <motion.div
                key={group.title}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.4, delay: (i % 6) * 0.06 }}
                className="flex flex-col gap-3 rounded-2xl border border-ink/8 bg-white/50 p-6 shadow-soft"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-wood/10 text-wood">
                  <Icon size={20} />
                </div>
                <div>
                  <p className="font-semibold text-ink">{group.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-ink/60">{group.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-10">
          <p className="text-center text-xs font-semibold uppercase tracking-[0.18em] text-wood">
            {dict.included.extrasLabel}
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2.5">
            {dict.included.extras.map((extra, i) => {
              const Icon = extraIcons[i] ?? Sparkles;
              return (
                <span
                  key={extra}
                  className="flex items-center gap-2 rounded-full border border-ink/8 bg-white/60 px-4 py-2 text-sm text-ink/70"
                >
                  <Icon size={15} className="shrink-0 text-wood" />
                  {extra}
                </span>
              );
            })}
          </div>
        </div>

        <p className="mx-auto mt-12 max-w-xl text-center text-lg font-medium italic tracking-tight text-olive-dark sm:text-xl">
          {dict.included.positioning}
        </p>

        {siteConfig.pricing.showPrice && (
          <p className="mt-10 text-center text-lg font-semibold text-olive-dark">
            {dict.included.priceFrom} {siteConfig.pricing.amount}
            {siteConfig.pricing.currency}{" "}
            <span className="font-normal text-ink/60">{dict.included.priceUnit}</span>
          </p>
        )}

        <p className="mx-auto mt-6 max-w-xl text-center text-sm text-ink/55">{dict.included.note}</p>
        {!siteConfig.pricing.showPrice && (
          <p className="mx-auto mt-2 max-w-xl text-center text-sm text-ink/55">{dict.included.priceNote}</p>
        )}
      </Container>
    </section>
  );
}
