"use client";

import { motion } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { useLanguage } from "@/i18n/LanguageContext";

export function QuickDistances() {
  const { dict } = useLanguage();
  const { title, items, note } = dict.quickDistances;

  return (
    <section className="border-y border-ink/8 bg-cream py-6">
      <Container className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
        <p className="shrink-0 text-xs font-semibold uppercase tracking-[0.14em] text-ink/50">
          {title}
        </p>
        <ul className="flex flex-wrap gap-x-6 gap-y-2.5">
          {items.map((item, i) => (
            <motion.li
              key={item.name}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className="flex items-center gap-2 text-sm text-ink/80"
            >
              <span className="h-2 w-2 shrink-0 rounded-full bg-olive-dark" />
              <span className="font-medium">{item.name}</span>
              <span className="text-ink/40">·</span>
              <span className="font-semibold text-wood">{item.time}</span>
            </motion.li>
          ))}
        </ul>
        <p className="text-[11px] text-ink/35 sm:ml-auto">{note}</p>
      </Container>
    </section>
  );
}
