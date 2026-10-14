"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { useLanguage } from "@/i18n/LanguageContext";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

type FlatImage = {
  src: string;
  caption: string;
  category: string;
  width: number;
  height: number;
};

export function Gallery() {
  const { dict } = useLanguage();
  const categories = siteConfig.gallery.categories;
  const scrollerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const images: FlatImage[] = useMemo(() => {
    return categories.flatMap((cat) =>
      cat.images.map((img) => ({
        src: img.src,
        caption: dict.gallery.captions[img.captionKey as keyof typeof dict.gallery.captions],
        category: cat.id,
        width: img.width,
        height: img.height,
      }))
    );
  }, [categories, dict]);

  function scrollByCards(direction: 1 | -1) {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth * 0.8, behavior: "smooth" });
  }

  function jumpToCategory(categoryId: string) {
    const firstSrc = categories.find((c) => c.id === categoryId)?.images[0]?.src;
    if (!firstSrc) return;
    cardRefs.current[firstSrc]?.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
  }

  const lightboxImage = lightboxIndex !== null ? images[lightboxIndex] : null;

  return (
    <section id="accommodation" className="bg-beige/40 py-16 sm:py-20">
      <Container>
        <SectionHeading eyebrow={dict.gallery.eyebrow} title={dict.gallery.title} subtitle={dict.gallery.subtitle} />

        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => jumpToCategory(cat.id)}
              className="rounded-full bg-white/70 px-4 py-2 text-sm font-medium text-ink/70 transition-colors hover:bg-white hover:text-olive-dark"
            >
              {dict.gallery.categories[cat.id as keyof typeof dict.gallery.categories]}
            </button>
          ))}
        </div>
      </Container>

      <div className="relative mt-8">
        <div
          ref={scrollerRef}
          className="scrollbar-none flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-5 pb-4 sm:gap-5 sm:px-8"
        >
          {images.map((img, i) => (
            <button
              key={img.src}
              ref={(el) => {
                cardRefs.current[img.src] = el;
              }}
              onClick={() => setLightboxIndex(i)}
              style={{ aspectRatio: `${img.width} / ${img.height}` }}
              className="group relative h-[64vw] shrink-0 snap-center overflow-hidden rounded-3xl shadow-soft sm:h-[62vh] sm:max-h-[560px]"
            >
              <Image
                src={img.src}
                alt={img.caption}
                fill
                sizes="(max-width: 640px) 90vw, 70vh"
                className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                priority={i < 2}
              />
              <div className="absolute inset-0 flex items-end bg-gradient-to-t from-ink/70 via-ink/0 to-transparent p-4 sm:p-5">
                <div className="flex w-full items-end justify-between gap-2">
                  <p className="text-left text-xs font-medium leading-snug text-cream sm:text-sm">{img.caption}</p>
                  <ZoomIn size={16} className="shrink-0 text-cream/70 opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
              </div>
            </button>
          ))}
        </div>

        <button
          aria-label="Prev"
          onClick={() => scrollByCards(-1)}
          className="absolute left-2 top-1/2 hidden -translate-y-1/2 items-center justify-center rounded-full bg-cream/90 p-2.5 text-ink shadow-soft hover:bg-cream sm:flex"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          aria-label="Next"
          onClick={() => scrollByCards(1)}
          className="absolute right-2 top-1/2 hidden -translate-y-1/2 items-center justify-center rounded-full bg-cream/90 p-2.5 text-ink shadow-soft hover:bg-cream sm:flex"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      <AnimatePresence>
        {lightboxImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/85 p-4"
            onClick={() => setLightboxIndex(null)}
          >
            <button
              aria-label={dict.gallery.close}
              onClick={() => setLightboxIndex(null)}
              className="absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-full bg-cream/10 text-cream hover:bg-cream/20"
            >
              <X size={22} />
            </button>

            <button
              aria-label="Prev"
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex((i) => (i === null ? i : (i - 1 + images.length) % images.length));
              }}
              className="absolute left-3 top-1/2 hidden -translate-y-1/2 items-center justify-center rounded-full bg-cream/10 p-3 text-cream hover:bg-cream/20 sm:flex"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              aria-label="Next"
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex((i) => (i === null ? i : (i + 1) % images.length));
              }}
              className="absolute right-3 top-1/2 hidden -translate-y-1/2 items-center justify-center rounded-full bg-cream/10 p-3 text-cream hover:bg-cream/20 sm:flex"
            >
              <ChevronRight size={24} />
            </button>

            <motion.div
              key={lightboxImage.src}
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.98, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative max-h-[82vh] w-full max-w-3xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="relative mx-auto max-h-[75vh] w-full overflow-hidden rounded-2xl"
                style={{ aspectRatio: `${lightboxImage.width} / ${lightboxImage.height}` }}
              >
                <Image src={lightboxImage.src} alt={lightboxImage.caption} fill className="object-contain" />
              </div>
              <p className="mt-4 text-center text-sm text-cream/80">{lightboxImage.caption}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
