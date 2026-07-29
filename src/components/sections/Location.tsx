"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { Check, MapPin } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { LinkButton } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { useLanguage } from "@/i18n/LanguageContext";
import { siteConfig } from "@/config/site";
import { LocationAerial } from "./LocationAerial";

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

          <div className="mt-6 max-w-xs">
            <LocationAerial caption={dict.location.aerialCaption} />
          </div>

          <LinkButton
            href={siteConfig.location.googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6"
          >
            {dict.location.mapButton}
          </LinkButton>
        </Reveal>

        <Reveal delay={0.1}>
          <TransitDiagram
            title={dict.location.transit.title}
            note={dict.location.transit.note}
            destinations={dict.location.transit.destinations}
          />
        </Reveal>
      </Container>

      <Container className="mt-12">
        <Reveal delay={0.15}>
          <div className="relative aspect-[21/9] w-full overflow-hidden rounded-3xl shadow-card">
            <Image
              src="/images/belgrade/beograd-na-vodi.jpg"
              alt="Beograd na vodi — silueta Beogradske kule i obala Save"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 1152px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-ink/5 to-transparent" />
            <p className="absolute bottom-4 left-5 text-sm font-medium text-cream sm:bottom-5 sm:left-6 sm:text-base">
              Beograd na vodi
            </p>
          </div>
        </Reveal>
        <p className="mt-3 text-right text-[11px] text-ink/35">
          Foto: Lošmi, Kallerna / Wikimedia Commons (CC BY-SA)
        </p>
      </Container>
    </section>
  );
}

// Origin pin sits south of the river confluence (Voždovac); endpoints are placed
// in roughly the right compass direction from it — a stylized illustration, not a
// literal survey map.
const ARCS = [
  { d: "M90,240 C 130,150 150,90 150,55", endX: 150, endY: 55 }, // Novi Beograd — across the river, NW
  { d: "M90,240 C 170,190 220,120 258,80", endX: 258, endY: 80 }, // Centar grada — near the confluence
  { d: "M90,240 C 200,220 270,150 305,108", endX: 305, endY: 108 }, // Beograd na vodi — riverside, close to centar
];

function TransitDiagram({
  title,
  note,
  destinations,
}: {
  title: string;
  note: string;
  destinations: readonly { name: string; line: string; time: string }[];
}) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="rounded-3xl bg-white/60 p-6 shadow-card sm:p-8">
      <p className="text-sm font-semibold uppercase tracking-wide text-ink/50">{title}</p>

      <div className="relative mt-4 h-56 w-full overflow-hidden rounded-2xl bg-cream/70 sm:h-64">
        {/* real photo of the Sava/Dunav confluence, low opacity — adds texture without pretending to be a survey map */}
        <Image
          src="/images/belgrade/sava-danube-confluence.jpg"
          alt=""
          fill
          aria-hidden="true"
          className="object-cover opacity-30"
          sizes="(max-width: 1024px) 100vw, 576px"
        />
        <div className="absolute inset-0 bg-cream/50" />
        <svg viewBox="0 0 400 300" className="absolute inset-0 h-full w-full" role="img" aria-hidden="true">
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
            cx={90}
            cy={240}
            r={22}
            fill="#59624F"
            style={{ transformOrigin: "90px 240px" }}
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
          <circle cx={90} cy={240} r={11} fill="#59624F" />
          <circle cx={90} cy={240} r={4} fill="#F7F4EE" />

          {/* endpoints */}
          {ARCS.map((arc, i) => (
            <motion.circle
              key={i}
              cx={arc.endX}
              cy={arc.endY}
              r={9}
              fill="#A9784E"
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
        {destinations.map((d, i) => (
          <motion.li
            key={d.name}
            initial={{ opacity: 0, x: -8 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            className="flex items-center justify-between gap-3 text-sm text-ink/80"
          >
            <span className="flex items-center gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-olive-dark text-[11px] font-bold text-cream">
                {d.line.split(" ")[0]}
              </span>
              {d.name}
            </span>
            <span className="shrink-0 font-semibold text-wood">{d.time}</span>
          </motion.li>
        ))}
      </ul>

      <p className="mt-4 text-xs text-ink/45">{note}</p>
    </div>
  );
}
