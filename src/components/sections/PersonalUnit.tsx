"use client";

import { motion } from "framer-motion";
import { Reveal } from "@/components/ui/Reveal";
import { useLanguage } from "@/i18n/LanguageContext";

const dotPositions = [
  { x: 150, y: 55 }, // curtain rod
  { x: 60, y: 150 }, // curtain
  { x: 300, y: 90 }, // lamp
  { x: 330, y: 150 }, // outlet/usb
  { x: 300, y: 180 }, // shelf
  { x: 140, y: 300 }, // under-bed drawers
  { x: 430, y: 200 }, // locker
  { x: 430, y: 320 }, // extra storage note
];

export function PersonalUnit() {
  const { dict } = useLanguage();
  const features = dict.personalUnit.features;

  return (
    <section className="bg-cream py-20 sm:py-28">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 sm:px-8 lg:grid-cols-2 lg:gap-16">
        <Reveal>
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-wood">
            {dict.personalUnit.eyebrow}
          </span>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            {dict.personalUnit.title}
          </h2>
          <p className="mt-4 max-w-lg text-base leading-relaxed text-ink/70 sm:text-lg">
            {dict.personalUnit.text}
          </p>

          <ul className="mt-8 grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
            {features.map((feature, i) => (
              <motion.li
                key={feature}
                initial={{ opacity: 0, x: -8 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="flex items-center gap-3 text-sm text-ink/80"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-olive-dark text-[11px] font-semibold text-cream">
                  {i + 1}
                </span>
                {feature}
              </motion.li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="relative rounded-3xl bg-beige/50 p-6 shadow-soft sm:p-10">
            <svg viewBox="0 0 520 400" className="mx-auto w-full max-w-md" role="img" aria-hidden="true">
              {/* wall shelf */}
              <rect x="270" y="150" width="90" height="14" rx="4" fill="#A9784E" />
              {/* lamp */}
              <circle cx="300" cy="110" r="16" fill="#59624F" opacity="0.85" />
              <line x1="300" y1="126" x2="300" y2="150" stroke="#59624F" strokeWidth="3" />
              {/* curtain rod + curtain */}
              <line x1="30" y1="55" x2="270" y2="55" stroke="#1E1F1C" strokeOpacity="0.3" strokeWidth="4" />
              <path
                d="M40 55 C 20 120, 20 200, 45 260 L 90 260 C 65 200, 65 120, 85 55 Z"
                fill="#D8D5CE"
                opacity="0.8"
              />
              {/* bed frame */}
              <rect x="60" y="260" width="260" height="90" rx="14" fill="#A9784E" opacity="0.85" />
              <rect x="50" y="200" width="280" height="70" rx="18" fill="#E8DDCC" />
              <rect x="60" y="180" width="60" height="46" rx="10" fill="#F7F4EE" />
              {/* under-bed drawers */}
              <rect x="90" y="330" width="80" height="30" rx="6" fill="#59624F" opacity="0.9" />
              <rect x="190" y="330" width="80" height="30" rx="6" fill="#59624F" opacity="0.9" />
              {/* outlet / usb */}
              <rect x="322" y="230" width="20" height="28" rx="4" fill="#1E1F1C" opacity="0.7" />
              {/* locker */}
              <rect x="380" y="90" width="110" height="260" rx="14" fill="#59624F" />
              <line x1="435" y1="100" x2="435" y2="340" stroke="#1E1F1C" strokeOpacity="0.2" strokeWidth="2" />
              <circle cx="425" cy="220" r="3" fill="#E8DDCC" />
              <circle cx="445" cy="220" r="3" fill="#E8DDCC" />

              {dotPositions.map((d, i) => (
                <g key={i}>
                  <circle cx={d.x} cy={d.y} r="11" fill="#1E1F1C" />
                  <text x={d.x} y={d.y + 4} textAnchor="middle" fontSize="11" fill="#F7F4EE" fontWeight="600">
                    {i + 1}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
