"use client";

import { motion } from "framer-motion";
import {
  Archive,
  BedDouble,
  ChefHat,
  Flame,
  Layers,
  Microwave,
  Refrigerator,
  ShowerHead,
  Sparkles,
  Table2,
  Thermometer,
  UtensilsCrossed,
  WashingMachine,
  Wifi,
  Zap,
} from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { useLanguage } from "@/i18n/LanguageContext";
import { siteConfig } from "@/config/site";

const icons = [
  BedDouble,
  Layers,
  Wifi,
  Thermometer,
  Zap,
  ChefHat,
  Refrigerator,
  Flame,
  Microwave,
  UtensilsCrossed,
  Table2,
  ShowerHead,
  WashingMachine,
  Archive,
  Sparkles,
];

export function Included() {
  const { dict } = useLanguage();

  return (
    <section id="included" className="bg-cream py-20 sm:py-28">
      <Container>
        <SectionHeading eyebrow={dict.included.eyebrow} title={dict.included.title} />

        <div className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {dict.included.items.map((item, i) => {
            const Icon = icons[i] ?? Sparkles;
            return (
              <motion.div
                key={item}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.4, delay: (i % 8) * 0.04 }}
                className="flex flex-col items-center gap-3 rounded-2xl border border-ink/8 bg-white/50 px-4 py-6 text-center shadow-soft"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-wood/10 text-wood">
                  <Icon size={20} />
                </div>
                <p className="text-sm font-medium text-ink/80">{item}</p>
              </motion.div>
            );
          })}
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
