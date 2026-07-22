"use client";

import { motion } from "framer-motion";
import { Car, Home, MapPinned, Sparkles, TramFront, User } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { useLanguage } from "@/i18n/LanguageContext";

const icons = [User, MapPinned, TramFront, Home, Car, Sparkles];

export function WhyUs() {
  const { dict } = useLanguage();

  return (
    <section className="bg-cream py-20 sm:py-28">
      <Container>
        <SectionHeading eyebrow={dict.why.eyebrow} title={dict.why.title} subtitle={dict.why.subtitle} />

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {dict.why.cards.map((card, i) => {
            const Icon = icons[i] ?? Home;
            return (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: (i % 3) * 0.08, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -4 }}
                className="group rounded-2xl border border-ink/8 bg-white/60 p-7 shadow-soft transition-shadow duration-300 hover:shadow-card"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-olive-dark/10 text-olive-dark transition-colors duration-300 group-hover:bg-olive-dark group-hover:text-cream">
                  <Icon size={22} />
                </div>
                <h3 className="mt-5 text-lg font-semibold text-ink">{card.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink/65">{card.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
