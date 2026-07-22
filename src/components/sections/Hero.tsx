"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Bus, DoorClosed, Users, Utensils, Wifi, WashingMachine } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { LinkButton } from "@/components/ui/Button";
import { useLanguage } from "@/i18n/LanguageContext";

const factIcons = [Users, DoorClosed, Wifi, Utensils, WashingMachine, Bus] as const;

export function Hero() {
  const { dict } = useLanguage();
  const facts = Object.values(dict.hero.facts);

  return (
    <section id="home" className="relative overflow-hidden bg-cream">
      <Container className="grid items-center gap-10 pb-16 pt-10 sm:pb-20 sm:pt-14 lg:grid-cols-2 lg:gap-8 lg:pb-24 lg:pt-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-wood">
            {dict.hero.eyebrow}
          </span>
          <h1 className="mt-4 text-4xl font-bold leading-tight tracking-tight text-ink sm:text-5xl lg:text-[3.4rem]">
            {dict.hero.title}
          </h1>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-ink/70 sm:text-lg">
            {dict.hero.subtitle}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <LinkButton href="/#booking" variant="primary">
              {dict.hero.ctaPrimary}
            </LinkButton>
            <LinkButton href="/#accommodation" variant="outline">
              {dict.hero.ctaSecondary}
            </LinkButton>
          </div>

          <motion.ul
            className="mt-10 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3"
            initial="hidden"
            animate="show"
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.06, delayChildren: 0.4 } },
            }}
          >
            {facts.map((fact, i) => {
              const Icon = factIcons[i] ?? Users;
              return (
                <motion.li
                  key={fact}
                  variants={{
                    hidden: { opacity: 0, y: 10 },
                    show: { opacity: 1, y: 0 },
                  }}
                  className="flex items-center gap-2 text-sm text-ink/75"
                >
                  <Icon size={16} className="shrink-0 text-olive-dark" />
                  <span>{fact}</span>
                </motion.li>
              );
            })}
          </motion.ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
          className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl shadow-card sm:aspect-[16/11]"
        >
          <Image
            src="/images/hero/hero-main.svg"
            alt="Prikaz enterijera BJ Residence smeštaja"
            fill
            priority
            className="object-cover"
          />
        </motion.div>
      </Container>
    </section>
  );
}
