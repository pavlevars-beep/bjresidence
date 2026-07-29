"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { LinkButton } from "@/components/ui/Button";
import { useLanguage } from "@/i18n/LanguageContext";
import { cn } from "@/lib/utils";

const navSections = [
  { id: "home", href: "/#home" },
  { id: "accommodation", href: "/#accommodation" },
  { id: "included", href: "/#included" },
  { id: "location", href: "/#location" },
  { id: "forCompanies", href: "/#for-companies" },
  { id: "faq", href: "/#faq" },
  { id: "contact", href: "/#booking" },
] as const;

export function Header() {
  const { dict, locale, setLocale } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled ? "bg-cream/90 shadow-soft backdrop-blur-md" : "bg-cream/60 backdrop-blur-sm"
      )}
    >
      <Container className="flex items-center justify-between py-3">
        <Link href="/#home" className="flex items-center gap-2.5">
          <Image
            src="/images/brand/icon-mark.png"
            alt="BJ Residence"
            width={40}
            height={40}
            priority
            className="h-9 w-9 sm:h-10 sm:w-10"
          />
          <span className="flex flex-col leading-tight">
            <span className="text-lg font-bold tracking-tight text-ink">BJ Residence</span>
            <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-wood">
              {dict.tagline}
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          {navSections.map((s) => (
            <Link
              key={s.id}
              href={s.href}
              className="text-sm font-medium text-ink/75 transition-colors hover:text-olive-dark"
            >
              {dict.nav[s.id]}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <LanguageToggle locale={locale} setLocale={setLocale} />
          <LinkButton href="/#booking" className="text-sm">
            {dict.nav.checkAvailability}
          </LinkButton>
        </div>

        <button
          aria-label="Menu"
          onClick={() => setIsOpen((v) => !v)}
          className="flex h-10 w-10 items-center justify-center rounded-full text-ink lg:hidden"
        >
          {isOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </Container>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="overflow-hidden border-t border-ink/10 bg-cream lg:hidden"
          >
            <Container className="flex flex-col gap-1 py-4">
              {navSections.map((s) => (
                <Link
                  key={s.id}
                  href={s.href}
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg px-3 py-3 text-base font-medium text-ink/80 transition-colors hover:bg-ink/5 hover:text-olive-dark"
                >
                  {dict.nav[s.id]}
                </Link>
              ))}
              <div className="mt-2 flex items-center justify-between gap-3 px-3">
                <LanguageToggle locale={locale} setLocale={setLocale} />
              </div>
              <LinkButton href="/#booking" className="mt-3 w-full" >
                {dict.nav.checkAvailability}
              </LinkButton>
            </Container>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function LanguageToggle({
  locale,
  setLocale,
}: {
  locale: "sr" | "en";
  setLocale: (l: "sr" | "en") => void;
}) {
  return (
    <div className="flex items-center rounded-full border border-ink/15 p-0.5 text-xs font-semibold">
      <button
        onClick={() => setLocale("sr")}
        className={cn(
          "rounded-full px-2.5 py-1.5 transition-colors",
          locale === "sr" ? "bg-olive-dark text-cream" : "text-ink/60 hover:text-ink"
        )}
      >
        SR
      </button>
      <button
        onClick={() => setLocale("en")}
        className={cn(
          "rounded-full px-2.5 py-1.5 transition-colors",
          locale === "en" ? "bg-olive-dark text-cream" : "text-ink/60 hover:text-ink"
        )}
      >
        EN
      </button>
    </div>
  );
}
