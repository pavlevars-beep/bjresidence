"use client";

import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { useLanguage } from "@/i18n/LanguageContext";
import { siteConfig } from "@/config/site";
import { telLink, whatsappLink } from "@/lib/utils";

const sectionLinks = [
  { id: "home", href: "/#home" },
  { id: "accommodation", href: "/#accommodation" },
  { id: "included", href: "/#included" },
  { id: "location", href: "/#location" },
  { id: "forCompanies", href: "/#for-companies" },
  { id: "faq", href: "/#faq" },
] as const;

export function Footer() {
  const { dict } = useLanguage();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-ink/10 bg-ink text-cream/80">
      <Container className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="text-lg font-bold text-cream">{siteConfig.brand.name}</p>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-wood">
            {siteConfig.brand.tagline}
          </p>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-cream/60">{dict.footer.description}</p>
        </div>

        <div>
          <p className="text-sm font-semibold text-cream">{dict.footer.sections}</p>
          <ul className="mt-4 space-y-2.5">
            {sectionLinks.map((s) => (
              <li key={s.id}>
                <Link href={s.href} className="text-sm text-cream/60 transition-colors hover:text-cream">
                  {dict.nav[s.id]}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold text-cream">{dict.footer.contact}</p>
          <ul className="mt-4 space-y-3">
            <li className="flex items-start gap-2 text-sm text-cream/60">
              <MapPin size={16} className="mt-0.5 shrink-0 text-wood" />
              <span>{siteConfig.location.address}</span>
            </li>
            <li className="flex items-center gap-2 text-sm">
              <Phone size={16} className="shrink-0 text-wood" />
              <a href={telLink(siteConfig.contact.phone)} className="text-cream/60 hover:text-cream">
                {siteConfig.contact.phoneDisplay}
              </a>
            </li>
            <li className="flex items-center gap-2 text-sm">
              <Mail size={16} className="shrink-0 text-wood" />
              <a href={`mailto:${siteConfig.contact.email}`} className="text-cream/60 hover:text-cream">
                {siteConfig.contact.email}
              </a>
            </li>
            <li>
              <a
                href={whatsappLink(siteConfig.contact.whatsapp)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-cream/60 hover:text-cream"
              >
                WhatsApp
              </a>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold text-cream">{dict.footer.legal}</p>
          <ul className="mt-4 space-y-2.5">
            <li>
              <Link href="/privacy" className="text-sm text-cream/60 hover:text-cream">
                {dict.footer.privacy}
              </Link>
            </li>
            <li>
              <Link href="/terms" className="text-sm text-cream/60 hover:text-cream">
                {dict.footer.terms}
              </Link>
            </li>
          </ul>
        </div>
      </Container>

      <div className="border-t border-cream/10 py-5">
        <Container className="flex flex-col items-center justify-between gap-2 text-xs text-cream/40 sm:flex-row">
          <p>
            © {year} {siteConfig.brand.name}. {dict.footer.rights}
          </p>
          <p>{siteConfig.location.address}</p>
        </Container>
      </div>
    </footer>
  );
}
