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
  const lastStepAtRef = useRef(0);
  const touchStartYRef = useRef<number | null>(null);
  const lastIndex = items.length - 1;

  useEffect(() => {
    const isInStepZone = () => {
      const el = wrapperRef.current;
      if (!el) return false;
      const rect = el.getBoundingClientRect();
      const center = window.innerHeight / 2;
      return rect.top <= center + 90 && rect.bottom >= center - 90;
    };

    const centerCards = () => {
      const el = wrapperRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const target = window.scrollY + rect.top - (window.innerHeight - rect.height) / 2;
      window.scrollTo({ top: target, behavior: "smooth" });
    };

    const step = (direction: 1 | -1) => {
      const now = window.performance.now();
      if (now - lastStepAtRef.current < 620) return true;

      let didStep = false;
      setActiveIndex((prev) => {
        const next = Math.min(lastIndex, Math.max(0, prev + direction));
        didStep = next !== prev;
        return next;
      });

      if (didStep) {
        lastStepAtRef.current = now;
        centerCards();
      }

      return didStep;
    };

    const onWheel = (event: WheelEvent) => {
      if (!isInStepZone()) return;
      const direction = event.deltaY > 0 ? 1 : -1;
      const canStep = direction > 0 ? activeIndex < lastIndex : activeIndex > 0;
      if (!canStep) return;

      event.preventDefault();
      step(direction);
    };

    const onTouchStart = (event: TouchEvent) => {
      touchStartYRef.current = event.touches[0]?.clientY ?? null;
    };

    const onTouchMove = (event: TouchEvent) => {
      if (!isInStepZone() || touchStartYRef.current === null) return;
      const currentY = event.touches[0]?.clientY ?? touchStartYRef.current;
      const delta = touchStartYRef.current - currentY;
      if (Math.abs(delta) < 42) return;

      const direction = delta > 0 ? 1 : -1;
      const canStep = direction > 0 ? activeIndex < lastIndex : activeIndex > 0;
      if (!canStep) return;

      event.preventDefault();
      if (step(direction)) touchStartYRef.current = currentY;
    };

    const onScroll = () => {
      const el = wrapperRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      if (rect.top > window.innerHeight * 0.72) setActiveIndex(0);
      if (rect.bottom < window.innerHeight * 0.28) setActiveIndex(lastIndex);
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("scroll", onScroll);
    };
  }, [activeIndex, lastIndex]);

  const goBack = () => setActiveIndex((prev) => Math.max(0, prev - 1));

  return (
    <div ref={wrapperRef} className="relative py-4 sm:py-6">
      <div className="relative mx-auto w-full max-w-4xl px-4 h-[min(76vh,580px)] min-h-[520px]">
        <button
          type="button"
          aria-label="Voltar uma etapa"
          onClick={goBack}
          className="absolute inset-x-4 inset-y-0 z-[60] cursor-pointer rounded-3xl focus:outline-none"
        >
          <span className="sr-only">Voltar uma etapa</span>
        </button>
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
  );
}
