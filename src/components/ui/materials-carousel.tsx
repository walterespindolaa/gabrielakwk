"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

export interface MaterialCarouselItem {
  n: string;
  title: string;
  desc: string;
  image: string;
}

export function MaterialsCarousel({ items }: { items: MaterialCarouselItem[] }) {
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (!carouselApi) return;

    const updateSelection = () => {
      setCanScrollPrev(carouselApi.canScrollPrev());
      setCanScrollNext(carouselApi.canScrollNext());
      setCurrentSlide(carouselApi.selectedScrollSnap());
    };

    updateSelection();
    carouselApi.on("select", updateSelection);
    carouselApi.on("reInit", updateSelection);

    return () => {
      carouselApi.off("select", updateSelection);
      carouselApi.off("reInit", updateSelection);
    };
  }, [carouselApi]);

  return (
    <div className="space-y-8">
      <div className="flex justify-center gap-3 sm:justify-end">
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => carouselApi?.scrollPrev()}
          disabled={!canScrollPrev}
          className="h-12 w-12 rounded-full border-brand/25 bg-background text-brand hover:bg-brand-soft"
          aria-label="Material anterior"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => carouselApi?.scrollNext()}
          disabled={!canScrollNext}
          className="h-12 w-12 rounded-full border-brand/25 bg-background text-brand hover:bg-brand-soft"
          aria-label="Próximo material"
        >
          <ArrowRight className="h-5 w-5" />
        </Button>
      </div>

      <Carousel setApi={setCarouselApi} opts={{ align: "start", loop: false }}>
        <CarouselContent className="-ml-4">
          {items.map((item) => (
            <CarouselItem key={item.n} className="basis-[86%] pl-4 sm:basis-[56%] lg:basis-[36%]">
              <article className="group h-full overflow-hidden rounded-3xl border border-border/60 bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand/30">
                <div className="relative aspect-[4/3] overflow-hidden bg-brand-soft">
                  <img
                    src={item.image}
                    alt=""
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-foreground/20" />
                  <span className="absolute left-5 top-5 rounded-full border border-background/45 bg-background/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-background">
                    {item.n}
                  </span>
                </div>
                <div className="p-6">
                  <h3 className="font-display text-2xl font-medium tracking-tight text-foreground" style={{ lineHeight: "1.08" }}>
                    {item.title}
                  </h3>
                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                    {item.desc}
                  </p>
                </div>
              </article>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      <div className="flex justify-center gap-2">
        {items.map((item, index) => (
          <button
            key={item.n}
            type="button"
            onClick={() => carouselApi?.scrollTo(index)}
            className={cn(
              "h-2.5 rounded-full transition-all",
              currentSlide === index ? "w-8 bg-brand" : "w-2.5 bg-brand/25 hover:bg-brand/45",
            )}
            aria-label={`Ir para material ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}