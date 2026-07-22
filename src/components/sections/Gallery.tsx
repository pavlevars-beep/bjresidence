"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { X, ZoomIn } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { useLanguage } from "@/i18n/LanguageContext";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

type FlatImage = { src: string; caption: string; category: string };

export function Gallery() {
  const { dict } = useLanguage();
  const categories = siteConfig.gallery.categories;
  const [active, setActive] = useState<string>(categories[0].id);
  const [lightbox, setLightbox] = useState<FlatImage | null>(null);

  const images: FlatImage[] = useMemo(() => {
    return categories
      .find((c) => c.id === active)!
      .images.map((img) => ({
        src: img.src,
        caption: dict.gallery.captions[img.captionKey as keyof typeof dict.gallery.captions],
        category: active,
      }));
  }, [active, categories, dict]);

  return (
    <section id="accommodation" className="bg-beige/40 py-20 sm:py-28">
      <Container>
        <SectionHeading eyebrow={dict.gallery.eyebrow} title={dict.gallery.title} subtitle={dict.gallery.subtitle} />

        <div className="mt-10 flex flex-wrap justify-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActive(cat.id)}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                active === cat.id
                  ? "bg-olive-dark text-cream shadow-soft"
                  : "bg-white/70 text-ink/70 hover:bg-white"
              )}
            >
              {dict.gallery.categories[cat.id as keyof typeof dict.gallery.categories]}
            </button>
          ))}
        </div>

        <motion.div
          key={active}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mt-10 grid gap-6 sm:grid-cols-2"
        >
          {images.map((img) => (
            <button
              key={img.src}
              onClick={() => setLightbox(img)}
              className="group relative aspect-[4/3] overflow-hidden rounded-2xl shadow-soft"
            >
              <Image
                src={img.src}
                alt={img.caption}
                fill
                className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 flex items-end bg-gradient-to-t from-ink/50 via-transparent to-transparent p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <p className="flex items-center gap-2 text-sm font-medium text-cream">
                  <ZoomIn size={16} /> {dict.gallery.lightboxHint}
                </p>
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-ink/0 p-3">
                <p className="text-left text-xs font-medium text-ink/70 sm:text-sm">{img.caption}</p>
              </div>
            </button>
          ))}
        </motion.div>
      </Container>

      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/85 p-4"
            onClick={() => setLightbox(null)}
          >
            <button
              aria-label={dict.gallery.close}
              onClick={() => setLightbox(null)}
              className="absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-full bg-cream/10 text-cream hover:bg-cream/20"
            >
              <X size={22} />
            </button>
            <motion.div
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="relative max-h-[80vh] w-full max-w-3xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl">
                <Image src={lightbox.src} alt={lightbox.caption} fill className="object-cover" />
              </div>
              <p className="mt-4 text-center text-sm text-cream/80">{lightbox.caption}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
