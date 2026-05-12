"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export type HomeHeaderCarouselSlide = {
  id: string;
  kind: "concert" | "store" | "news";
  windowLabel: string;
  meta: string;
  title: string;
  description: string;
  href: string;
  ctaLabel: string;
  imageUrl: string;
  imageAlt: string;
};

type HomeHeaderCarouselProps = {
  slides: HomeHeaderCarouselSlide[];
};

const AUTO_ADVANCE_MS = 6400;
const KIND_LABEL: Record<HomeHeaderCarouselSlide["kind"], string> = {
  concert: "CONCIERTO",
  store: "TIENDA",
  news: "NOTICIA",
};

export default function HomeHeaderCarousel({ slides }: HomeHeaderCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const total = slides.length;

  useEffect(() => {
    setActiveIndex(0);
  }, [total]);

  useEffect(() => {
    if (total <= 1) return;

    const intervalId = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % total);
    }, AUTO_ADVANCE_MS);

    return () => window.clearInterval(intervalId);
  }, [total]);

  if (total === 0) return null;

  const activeSlide = slides[activeIndex] ?? slides[0];

  const goTo = (index: number) => {
    setActiveIndex((index + total) % total);
  };

  return (
    <section className="home-hero-carousel" aria-label="Destacados de Sugarbay">
      <article className="win-window home-hero-carousel-window">
        <div className="win-titlebar home-hero-carousel-titlebar">
          <button
            type="button"
            onClick={() => goTo(activeIndex - 1)}
            className="win-button home-hero-carousel-nav"
            aria-label="Ver destacado anterior"
          >
            {"<"}
          </button>

          <p className="home-hero-carousel-window-label">{activeSlide.windowLabel}</p>

          <button
            type="button"
            onClick={() => goTo(activeIndex + 1)}
            className="win-button home-hero-carousel-nav"
            aria-label="Ver siguiente destacado"
          >
            {">"}
          </button>
        </div>

        <div className={`home-hero-carousel-body home-hero-carousel-body-${activeSlide.kind}`}>
          <div className="home-hero-carousel-content">
            <div
              className={`home-hero-carousel-media home-hero-carousel-media-${activeSlide.kind}`}
            >
              <div className="home-hero-carousel-media-frame">
                <Image
                  src={activeSlide.imageUrl}
                  alt={activeSlide.imageAlt}
                  fill
                  priority={activeIndex === 0}
                  sizes="(max-width: 767px) 100vw, (max-width: 1279px) 40vw, 420px"
                  className="home-hero-carousel-image"
                />
              </div>
            </div>

            <div className="home-hero-carousel-main">
              <div className="home-hero-carousel-main-top">
                <p className="home-hero-carousel-meta">{activeSlide.meta}</p>
                <div className="home-hero-carousel-tags" aria-hidden="true">
                  <span className="home-hero-carousel-tag home-hero-carousel-tag-status">EN CURSO</span>
                  <span className={`home-hero-carousel-tag home-hero-carousel-tag-${activeSlide.kind}`}>
                    {KIND_LABEL[activeSlide.kind]}
                  </span>
                </div>
              </div>
              <h2 className="home-hero-carousel-heading">{activeSlide.title}</h2>
              <p className="home-hero-carousel-copy">{activeSlide.description}</p>
            </div>
          </div>

          <div className="home-hero-carousel-footer">
            <Link href={activeSlide.href} className="retro-card-action home-hero-carousel-cta">
              {activeSlide.ctaLabel}
            </Link>

            {total > 1 ? (
              <div className="home-hero-carousel-progress" aria-hidden="true">
                <span
                  className="home-hero-carousel-progress-fill"
                  style={{ width: `${((activeIndex + 1) / total) * 100}%` }}
                />
              </div>
            ) : null}

            {total > 1 ? (
              <div className="home-hero-carousel-dots" role="tablist" aria-label="Seleccionar destacado">
                {slides.map((slide, index) => (
                  <button
                    key={slide.id}
                    type="button"
                    role="tab"
                    aria-selected={index === activeIndex}
                    aria-label={`Ver: ${slide.windowLabel}`}
                    onClick={() => goTo(index)}
                    className={`win-button home-hero-carousel-dot ${index === activeIndex ? "is-active" : ""}`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </article>
    </section>
  );
}
