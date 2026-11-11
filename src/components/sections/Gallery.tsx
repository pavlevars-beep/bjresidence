"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { useLanguage } from "@/i18n/LanguageContext";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

// Shared by the carousel and the lightbox so opening/swiping reuses the image
// the browser already downloaded instead of fetching another size variant.
const IMAGE_SIZES = "(max-width: 640px) 90vw, 70vh";

// Function variants read AnimatePresence's latest `custom`, so an exiting photo
// slides out the right way even when the direction just flipped.
const slideVariants = {
  enter: (dir: 1 | -1) => ({ x: dir * 80, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: 1 | -1) => ({ x: dir * -80, opacity: 0 }),
};

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
  const [direction, setDirection] = useState<1 | -1>(1);

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

  const step = useCallback(
    (delta: 1 | -1) => {
      setDirection(delta);
      setLightboxIndex((i) => (i === null ? i : (i + delta + images.length) % images.length));
    },
    [images.length]
  );

  const closeLightbox = useCallback(() => {
    // Leave the carousel on the photo the visitor ended on, not the one they opened.
    if (lightboxIndex !== null) {
      cardRefs.current[images[lightboxIndex].src]?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }
    setLightboxIndex(null);
  }, [lightboxIndex, images]);

  const isOpen = lightboxIndex !== null;
  useEffect(() => {
    if (!isOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight") step(1);
      else if (e.key === "ArrowLeft") step(-1);
      else if (e.key === "Escape") closeLightbox();
    }
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen, step, closeLightbox]);

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
                sizes={IMAGE_SIZES}
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
            className="fixed inset-0 z-[60] flex flex-col bg-ink/90"
            onClick={closeLightbox}
          >
            <div className="flex items-center justify-between px-4 pt-4 sm:px-5 sm:pt-5">
              <span className="text-sm font-medium tabular-nums text-cream/70">
                {lightboxIndex! + 1} / {images.length}
              </span>
              <button
                aria-label={dict.gallery.close}
                onClick={closeLightbox}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-cream/10 text-cream hover:bg-cream/20"
              >
                <X size={22} />
              </button>
            </div>

            <div className="relative flex flex-1 items-center justify-center overflow-hidden px-2 sm:px-16">
              <AnimatePresence initial={false} custom={direction} mode="popLayout">
                <motion.div
                  key={lightboxImage.src}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.22, ease: "easeOut" }}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.6}
                  onDragEnd={(_, info) => {
                    if (info.offset.x < -60 || info.velocity.x < -400) step(1);
                    else if (info.offset.x > 60 || info.velocity.x > 400) step(-1);
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="relative h-full max-h-[78vh] w-full max-w-4xl cursor-grab touch-pan-y active:cursor-grabbing"
                >
                  <Image
                    src={lightboxImage.src}
                    alt={lightboxImage.caption}
                    fill
                    sizes={IMAGE_SIZES}
                    draggable={false}
                    className="pointer-events-none select-none object-contain"
                    priority
                  />
                </motion.div>
              </AnimatePresence>

              <div className="hidden" aria-hidden>
                {[1, -1].map((offset) => {
                  const neighbor = images[(lightboxIndex! + offset + images.length) % images.length];
                  return <Image key={neighbor.src} src={neighbor.src} alt="" width={neighbor.width} height={neighbor.height} sizes={IMAGE_SIZES} loading="eager" />;
                })}
              </div>

              <button
                aria-label="Prev"
                onClick={(e) => {
                  e.stopPropagation();
                  step(-1);
                }}
                className="absolute left-3 top-1/2 hidden -translate-y-1/2 items-center justify-center rounded-full bg-cream/10 p-3 text-cream hover:bg-cream/20 sm:flex"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                aria-label="Next"
                onClick={(e) => {
                  e.stopPropagation();
                  step(1);
                }}
                className="absolute right-3 top-1/2 hidden -translate-y-1/2 items-center justify-center rounded-full bg-cream/10 p-3 text-cream hover:bg-cream/20 sm:flex"
              >
                <ChevronRight size={24} />
              </button>
            </div>

            <div
              className="flex items-center justify-between gap-3 px-4 pb-6 pt-3 sm:justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                aria-label="Prev"
                onClick={(e) => {
                  e.stopPropagation();
                  step(-1);
                }}
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-cream/10 text-cream active:bg-cream/25 sm:hidden"
              >
                <ChevronLeft size={24} />
              </button>
              <p className="text-center text-sm leading-snug text-cream/85">{lightboxImage.caption}</p>
              <button
                aria-label="Next"
                onClick={(e) => {
                  e.stopPropagation();
                  step(1);
                }}
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-cream/10 text-cream active:bg-cream/25 sm:hidden"
              >
                <ChevronRight size={24} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
