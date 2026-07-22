"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Check, Leaf, MapPin } from "lucide-react";
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
          <p className="mt-2 text-sm font-medium text-wood">{dict.location.distance}</p>

          <ul className="mt-6 space-y-3">
            {dict.location.highlights.map((h) => (
              <li key={h} className="flex items-start gap-3 text-sm text-ink/75 sm:text-base">
                <Check size={18} className="mt-0.5 shrink-0 text-wood" />
                {h}
              </li>
            ))}
          </ul>

          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-olive-dark/15 bg-olive-dark/5 p-4">
            <Leaf size={20} className="mt-0.5 shrink-0 text-olive-dark" />
            <div>
              <p className="text-sm font-semibold text-ink">{dict.location.courtyard.title}</p>
              <p className="mt-1 text-sm text-ink/65">{dict.location.courtyard.desc}</p>
            </div>
          </div>

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
          <TransitDiagram title={dict.location.transit.title} lines={dict.location.transit.lines} />
        </Reveal>
      </Container>
    </section>
  );
}

const ARCS = [
  { d: "M70,150 C 150,60 250,60 340,72", endX: 340, endY: 72 },
  { d: "M70,150 C 180,150 260,150 340,150", endX: 340, endY: 150 },
  { d: "M70,150 C 150,240 250,240 340,228", endX: 340, endY: 228 },
];

function TransitDiagram({
  title,
  lines,
}: {
  title: string;
  lines: readonly { number: string; desc: string }[];
}) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="rounded-3xl bg-white/60 p-6 shadow-card sm:p-8">
      <p className="text-sm font-semibold uppercase tracking-wide text-ink/50">{title}</p>

      <div className="relative mt-4 h-56 w-full overflow-hidden rounded-2xl bg-cream/70 sm:h-64">
        <svg viewBox="0 0 400 300" className="h-full w-full" role="img" aria-hidden="true">
          {ARCS.map((arc, i) => (
            <motion.path
              key={i}
              d={arc.d}
              fill="none"
              stroke="#A9784E"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeDasharray="7 7"
              initial={{ pathLength: shouldReduceMotion ? 1 : 0, opacity: shouldReduceMotion ? 0.9 : 0 }}
              whileInView={{ pathLength: 1, opacity: 0.9 }}
              viewport={{ once: true }}
              transition={{
                duration: shouldReduceMotion ? 0 : 1.1,
                delay: shouldReduceMotion ? 0 : 0.3 + i * 0.25,
                ease: "easeInOut",
              }}
            />
          ))}

          {/* central pin, pulsing */}
          <motion.circle
            cx={70}
            cy={150}
            r={22}
            fill="#59624F"
            style={{ transformOrigin: "70px 150px" }}
            initial={{ scale: 1, opacity: 0.25 }}
            animate={
              shouldReduceMotion
                ? { scale: 1, opacity: 0.25 }
                : { scale: [1, 1.7, 1], opacity: [0.3, 0, 0.3] }
            }
            transition={
              shouldReduceMotion ? { duration: 0 } : { duration: 2.6, repeat: Infinity, ease: "easeOut" }
            }
          />
          <circle cx={70} cy={150} r={11} fill="#59624F" />
          <circle cx={70} cy={150} r={4} fill="#F7F4EE" />

          {/* endpoints */}
          {ARCS.map((arc, i) => (
            <motion.circle
              key={i}
              cx={arc.endX}
              cy={arc.endY}
              r={9}
              fill="#59624F"
              initial={{ scale: shouldReduceMotion ? 1 : 0, opacity: shouldReduceMotion ? 1 : 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{
                duration: shouldReduceMotion ? 0 : 0.35,
                delay: shouldReduceMotion ? 0 : 1.1 + i * 0.25,
              }}
            />
          ))}
        </svg>
      </div>

      <ul className="mt-5 space-y-3">
        {lines.map((line, i) => (
          <motion.li
            key={line.number}
            initial={{ opacity: 0, x: -8 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            className="flex items-center gap-3 text-sm text-ink/80"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-olive-dark text-xs font-bold text-cream">
              {line.number}
            </span>
            {line.desc}
          </motion.li>
        ))}
      </ul>
    </div>
  );
}
