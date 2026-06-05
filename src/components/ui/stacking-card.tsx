"use client";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

export interface StackingCardItem {
  letter: string;
  title: string;
  description: string;
  bg: string;
  fg: string;
  accent: string;
}

interface CardProps extends StackingCardItem {
  i: number;
  total: number;
  activeIndex: number;
}

function Card({
  i,
  total,
  letter,
  title,
  description,
  bg,
  fg,
  accent,
  activeIndex,
}: CardProps) {
  const distance = i - activeIndex;
  const isActive = distance === 0;
  const isBehind = distance < 0;
  const depth = Math.min(Math.abs(distance), 4);
  const y = isActive ? 0 : isBehind ? -28 * depth : 24 * depth;
  const scale = isActive ? 1 : isBehind ? 1 - depth * 0.045 : 0.97 - depth * 0.025;
  const rotate = isActive ? 0 : isBehind ? -2.2 * depth : 1.8 * depth;
  const opacity = isActive ? 1 : isBehind ? Math.max(0.42, 0.82 - depth * 0.12) : Math.max(0.34, 0.76 - depth * 0.16);
  const zIndex = isActive ? total + 5 : isBehind ? total - depth : total - depth - 1;

  return (
    <motion.div
      animate={{ y, scale, rotate, opacity }}
      transition={{ type: "spring", stiffness: 180, damping: 26, mass: 0.8 }}
      style={{ backgroundColor: bg, color: fg, zIndex }}
      className="absolute inset-0 rounded-3xl overflow-hidden shadow-2xl border border-foreground/10 origin-top"
    >
      <div className="grid h-full grid-rows-[1fr_0.85fr] md:grid-cols-[1fr_1.1fr] md:grid-rows-1">
        <div className="p-8 sm:p-12 flex flex-col justify-between">
          <div className="flex items-center gap-3 text-xs uppercase tracking-[0.25em] opacity-70">
            <span>Etapa {i + 1} / {total}</span>
          </div>
          <div>
            <h3 className="font-display text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight" style={{ lineHeight: "1.05" }}>
              {title}
            </h3>
            <p className="mt-5 text-sm sm:text-base leading-relaxed opacity-85 max-w-md">
              {description}
            </p>
          </div>
          <div className="text-xs uppercase tracking-[0.25em] opacity-60">
            Método CRIAR
          </div>
        </div>

        <div
          className="relative flex items-center justify-center overflow-hidden"
          style={{ backgroundColor: accent }}
        >
          <span
            className="font-display font-medium select-none"
            style={{
              color: fg,
              fontSize: "clamp(180px, 26vw, 360px)",
              lineHeight: 1,
            }}
          >
            {letter}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export function StackingCards({ items }: { items: StackingCardItem[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const lastIndex = items.length - 1;

  useEffect(() => {
    let raf = 0;
    const compute = () => {
      raf = 0;
      const el = wrapperRef.current;
      const panel = panelRef.current;
      if (!el || !panel) return;
      const rect = el.getBoundingClientRect();
      const stickyTop = parseFloat(window.getComputedStyle(panel).top) || 0;
      const scrollable = el.offsetHeight - panel.offsetHeight;
      if (scrollable <= 0) return;
      const progressed = Math.min(Math.max(stickyTop - rect.top, 0), scrollable);
      const ratio = progressed / scrollable;
      const idx = Math.round(ratio * lastIndex);
      setActiveIndex((prev) => (prev === idx ? prev : Math.min(lastIndex, Math.max(0, idx))));
    };

    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(compute);
    };

    compute();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [lastIndex]);

  const stepVh = 55;
  const wrapperHeight = `calc(min(76vh, 580px) + ${(items.length - 1) * stepVh}vh)`;

  return (
    <div ref={wrapperRef} style={{ height: wrapperHeight }} className="relative">
      <div
        ref={panelRef}
        className="sticky top-[max(4rem,calc((100vh-580px)/2))]"
      >
        <div className="relative mx-auto w-full max-w-4xl px-4 h-[min(76vh,580px)] min-h-[520px]">
          {items.map((item, i) => (
            <Card
              key={`${item.letter}-${i}`}
              i={i}
              total={items.length}
              activeIndex={activeIndex}
              {...item}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
