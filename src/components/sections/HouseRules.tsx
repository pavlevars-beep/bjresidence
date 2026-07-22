"use client";

import { motion } from "framer-motion";
import { CigaretteOff, ClipboardCheck, Handshake, ShieldCheck, Volume1 } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { useLanguage } from "@/i18n/LanguageContext";

const icons = [Handshake, ShieldCheck, Volume1, CigaretteOff, ClipboardCheck];

export function HouseRules() {
  const { dict } = useLanguage();

  return (
    <section className="bg-beige/40 py-20 sm:py-28">
      <Container>
        <SectionHeading eyebrow={dict.rules.eyebrow} title={dict.rules.title} />

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {dict.rules.items.map((rule, i) => {
            const Icon = icons[i] ?? ShieldCheck;
            return (
              <motion.div
                key={rule}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="flex items-center gap-4 rounded-2xl bg-white/60 p-5 shadow-soft"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-olive-dark/10 text-olive-dark">
                  <Icon size={18} />
                </div>
                <p className="text-sm text-ink/80">{rule}</p>
              </motion.div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
