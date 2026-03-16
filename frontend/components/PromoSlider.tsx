"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { type PromoSlide } from "@/data/promos";
import { cn } from "@/lib/utils";
import Autoplay from "embla-carousel-autoplay";
import useEmblaCarousel from "embla-carousel-react";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Facebook,
  Instagram,
  Send,
  Sparkles,
  Youtube,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

const iconMap = {
  youtube: Youtube,
  telegram: Send,
  sparkles: Sparkles,
  book: BookOpen,
  zap: Zap,
  instagram: Instagram,
  facebook: Facebook,
};

interface PromoCardProps {
  slide: PromoSlide;
}

const PromoCard = ({ slide }: PromoCardProps) => {
  const Icon = slide.icon ? iconMap[slide.icon] : null;
  const isExternal = slide.ctaUrl.startsWith("http");

  const CardContent = (
    <div className="group relative flex flex-col bg-card rounded-xl border border-border shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-300 h-full cursor-pointer overflow-hidden">
      {/* Thumbnail Banner */}
      {slide.thumbnail && (
        <div className="relative w-full h-24 md:h-28 overflow-hidden">
          <img
            src={slide.thumbnail}
            alt={slide.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent" />
          {/* Badge on image */}
          {slide.badge && (
            <Badge
              variant={slide.badgeVariant || "default"}
              className="absolute top-2 left-2 text-[10px] px-2 py-0"
            >
              {slide.badge}
            </Badge>
          )}
        </div>
      )}

      {/* Content Area */}
      <div className="flex items-center gap-4 p-4 flex-1">
        {/* Icon - only show if no thumbnail */}
        {Icon && !slide.thumbnail && (
          <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
            <Icon className="w-6 h-6 text-primary" />
          </div>
        )}

        {/* Icon - smaller when thumbnail exists */}
        {Icon && slide.thumbnail && (
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
            <Icon className="w-5 h-5 text-primary" />
          </div>
        )}

        {/* Text Content */}
        <div className="flex-1 min-w-0">
          {/* Badge - only show here if no thumbnail */}
          {slide.badge && !slide.thumbnail && (
            <div className="flex items-center gap-2 mb-1">
              <Badge
                variant={slide.badgeVariant || "default"}
                className="text-[10px] px-2 py-0"
              >
                {slide.badge}
              </Badge>
            </div>
          )}
          <h3 className="font-semibold text-foreground text-sm md:text-base truncate group-hover:text-primary transition-colors">
            {slide.title}
          </h3>
          <p className="text-xs md:text-sm text-muted-foreground line-clamp-2 mt-0.5">
            {slide.description}
          </p>
        </div>

        {/* CTA */}
        <div className="flex-shrink-0 hidden sm:flex items-center gap-1 text-sm font-medium text-primary group-hover:translate-x-1 transition-transform">
          {slide.ctaText}
          {isExternal ? (
            <ExternalLink className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </div>
      </div>
    </div>
  );

  if (isExternal) {
    return (
      <a
        href={slide.ctaUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block h-full"
      >
        {CardContent}
      </a>
    );
  }

  return (
    <Link href={slide.ctaUrl} className="block h-full">
      {CardContent}
    </Link>
  );
};

const PromoCardSkeleton = () => (
  <div className="flex items-center gap-4 p-5 bg-card rounded-xl border border-border h-full">
    <Skeleton className="w-12 h-12 rounded-xl flex-shrink-0" />
    <div className="flex-1 space-y-2">
      <Skeleton className="h-4 w-16" />
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-full" />
    </div>
  </div>
);

interface PromoSliderProps {
  slides?: PromoSlide[];
  isLoading?: boolean;
  autoplayDelay?: number;
}

export const PromoSlider = ({ autoplayDelay = 6000 }: PromoSliderProps) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [slides, setSlides] = useState<PromoSlide[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const autoplayPlugin = Autoplay({
    delay: autoplayDelay,
    stopOnInteraction: false,
    stopOnMouseEnter: true,
  });

  useEffect(() => {
    const fetchPromos = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/promos/public`,
        );
        const data = await res.json();
        setSlides(data);
      } catch (error) {
        console.error("Promo fetch error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPromos();
  }, []);

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: "start",
      slidesToScroll: 1,
      breakpoints: {
        "(min-width: 768px)": { slidesToScroll: 2 },
        "(min-width: 1024px)": { slidesToScroll: 1 },
      },
    },
    [autoplayPlugin],
  );

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const scrollTo = useCallback(
    (index: number) => {
      if (emblaApi) emblaApi.scrollTo(index);
    },
    [emblaApi],
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  // Don't render if no slides and not loading
  if (!isLoading && slides.length === 0) {
    return null;
  }

  return (
    <section className="py-6 bg-secondary/30">
      <div className="container-main">
        <div
          className="relative"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Carousel */}
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex -ml-4">
              {isLoading
                ? // Loading skeletons
                  Array.from({ length: 3 }).map((_, index) => (
                    <div
                      key={index}
                      className="flex-[0_0_100%] min-w-0 pl-4 md:flex-[0_0_50%] lg:flex-[0_0_33.333%]"
                    >
                      <PromoCardSkeleton />
                    </div>
                  ))
                : slides.map((slide, i) => (
                    <div
                      key={i}
                      className="flex-[0_0_100%] min-w-0 pl-4 md:flex-[0_0_50%] lg:flex-[0_0_33.333%]"
                    >
                      <PromoCard slide={slide} />
                    </div>
                  ))}
            </div>
          </div>

          {/* Navigation Arrows - Desktop only */}
          {!isLoading && slides.length > 3 && (
            <>
              <Button
                variant="outline"
                size="icon"
                className="absolute -left-4 top-1/2 -translate-y-1/2 hidden lg:flex h-8 w-8 rounded-full bg-card shadow-md border-border hover:bg-secondary"
                onClick={scrollPrev}
                aria-label="Oldingi slayd"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="absolute -right-4 top-1/2 -translate-y-1/2 hidden lg:flex h-8 w-8 rounded-full bg-card shadow-md border-border hover:bg-secondary"
                onClick={scrollNext}
                aria-label="Keyingi slayd"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>

        {/* Dots Indicator */}
        {!isLoading && slides.length > 1 && (
          <div
            className="flex justify-center gap-2 mt-4"
            role="tablist"
            aria-label="Slaydlar navigatsiyasi"
          >
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => scrollTo(index)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all duration-300",
                  selectedIndex === index
                    ? "bg-primary w-6"
                    : "bg-muted-foreground/30 hover:bg-muted-foreground/50",
                )}
                role="tab"
                aria-selected={selectedIndex === index}
                aria-label={`Slayd ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
