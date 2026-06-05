"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface CardItem {
  id: string | number;
  title: string;
  description: string;
  imgSrc: string;
  icon: React.ReactNode;
  linkHref: string;
}

interface ExpandingCardsProps extends React.HTMLAttributes<HTMLUListElement> {
  items: CardItem[];
  defaultActiveIndex?: number;
}

export const ExpandingCards = React.forwardRef<HTMLUListElement, ExpandingCardsProps>(
  ({ className, items, defaultActiveIndex = 0, ...props }, ref) => {
    const [activeIndex, setActiveIndex] = React.useState(defaultActiveIndex);
    const [isDesktop, setIsDesktop] = React.useState(false);

    React.useEffect(() => {
      const handleResize = () => setIsDesktop(window.innerWidth >= 768);
      handleResize();
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }, []);

    const gridStyle = React.useMemo<React.CSSProperties>(() => {
      const template = items
        .map((_, index) => (index === activeIndex ? "5fr" : "1fr"))
        .join(" ");

      return isDesktop
        ? { gridTemplateColumns: template }
        : { gridTemplateRows: template };
    }, [activeIndex, isDesktop, items]);

    return (
      <ul
        ref={ref}
        className={cn(
          "grid h-[760px] gap-3 transition-[grid-template-columns,grid-template-rows] duration-700 ease-out md:h-[560px] md:grid-rows-1",
          className,
        )}
        style={gridStyle}
        {...props}
      >
        {items.map((item, index) => {
          const isActive = activeIndex === index;

          return (
            <li
              key={item.id}
              tabIndex={0}
              data-active={isActive}
              onMouseEnter={() => setActiveIndex(index)}
              onFocus={() => setActiveIndex(index)}
              onClick={() => setActiveIndex(index)}
              className="group relative min-h-0 cursor-pointer overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm outline-none transition-all duration-500 focus-visible:ring-2 focus-visible:ring-ring"
            >
              <img
                src={item.imgSrc}
                alt={item.title}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-data-[active=true]:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-foreground/55 transition-colors duration-500 group-data-[active=true]:bg-foreground/35" />

              <div className="absolute inset-0 flex items-center justify-center p-4 text-background transition-opacity duration-300 group-data-[active=true]:opacity-0 md:p-5">
                <div className="flex items-center gap-3 md:flex-col">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full border border-background/40 bg-background/15">
                    {item.icon}
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-[0.22em] md:[writing-mode:vertical-rl] md:rotate-180">
                    {item.id}
                  </span>
                </div>
              </div>

              <div className="absolute inset-x-0 bottom-0 p-5 text-background opacity-0 translate-y-4 transition-all duration-500 group-data-[active=true]:translate-y-0 group-data-[active=true]:opacity-100 sm:p-7">
                <div className="mb-5 flex items-center justify-between gap-4">
                  <span className="text-xs font-semibold uppercase tracking-[0.22em] opacity-80">
                    {item.id}
                  </span>
                  <span className="flex h-11 w-11 items-center justify-center rounded-full border border-background/40 bg-background/15">
                    {item.icon}
                  </span>
                </div>
                <h3 className="font-display text-2xl font-medium tracking-tight sm:text-3xl" style={{ lineHeight: "1.08" }}>
                  {item.title}
                </h3>
                <p className="mt-4 max-w-xl text-sm leading-relaxed text-background/85 sm:text-base">
                  {item.description}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    );
  },
);

ExpandingCards.displayName = "ExpandingCards";