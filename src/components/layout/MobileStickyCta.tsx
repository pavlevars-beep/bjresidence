"use client";

import { LinkButton } from "@/components/ui/Button";
import { useLanguage } from "@/i18n/LanguageContext";

export function MobileStickyCta() {
  const { dict } = useLanguage();

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-ink/10 bg-cream/95 p-3 backdrop-blur-md lg:hidden">
      <LinkButton href="/#booking" className="w-full">
        {dict.nav.checkAvailability}
      </LinkButton>
    </div>
  );
}
