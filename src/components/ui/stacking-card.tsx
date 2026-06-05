"use client";
import { motion } from "motion/react";
import { useCallback, useEffect, useRef, useState, type TouchEvent, type WheelEvent } from "react";

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
  onBack: () => void;
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
  onBack,
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
      transition={{ type: "spring", stiffness: 170, damping: 24, mass: 0.9 }}
      style={{ backgroundColor: bg, color: fg, zIndex }}
      onClick={isActive ? onBack : undefined}
      className="absolute inset-0 rounded-3xl overflow-hidden shadow-2xl border border-foreground/10 origin-top cursor-pointer"
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
  const containerRef = useRef<HTMLDivElement>(null);
  const lockUntil = useRef(0);
  const touchStartY = useRef<number | null>(null);
  const lastIndex = items.length - 1;

  const move = useCallback((direction: 1 | -1) => {
    setActiveIndex((current) => Math.min(lastIndex, Math.max(0, current + direction)));
  }, [lastIndex]);

  const isInScrollZone = useCallback(() => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return false;

    const viewportHeight = window.innerHeight;
    const cardCenter = rect.top + rect.height / 2;
    return cardCenter > viewportHeight * 0.28 && cardCenter < viewportHeight * 0.72;
  }, []);

  const handleStep = useCallback((direction: 1 | -1) => {
    const canMove = direction > 0 ? activeIndex < lastIndex : activeIndex > 0;
    if (!canMove || !isInScrollZone()) return false;

    const now = Date.now();
    if (now < lockUntil.current) return true;

    lockUntil.current = now + 640;
    move(direction);
    return true;
  }, [activeIndex, isInScrollZone, lastIndex, move]);

  useEffect(() => {
    const onWindowWheel = (event: globalThis.WheelEvent) => {
      if (Math.abs(event.deltaY) < 10) return;
      const direction = event.deltaY > 0 ? 1 : -1;

      if (handleStep(direction)) {
        event.preventDefault();
      }
    };

    window.addEventListener("wheel", onWindowWheel, { passive: false });
    return () => window.removeEventListener("wheel", onWindowWheel);
  }, [handleStep]);

  const handleWheel = (event: WheelEvent<HTMLDivElement>) => {
    const direction = event.deltaY > 0 ? 1 : -1;
    if (Math.abs(event.deltaY) < 10) return;
    if (handleStep(direction)) event.preventDefault();
  };

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    touchStartY.current = event.touches[0]?.clientY ?? null;
  };

  const handleTouchMove = (event: TouchEvent<HTMLDivElement>) => {
    const start = touchStartY.current;
    if (start === null) return;
    const current = event.touches[0]?.clientY ?? start;
    const direction = start - current > 0 ? 1 : -1;
    const canMove = direction > 0 ? activeIndex < lastIndex : activeIndex > 0;

    if (canMove && Math.abs(start - current) > 8) event.preventDefault();
  };

  const handleTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    const start = touchStartY.current;
    const end = event.changedTouches[0]?.clientY;
    touchStartY.current = null;
    if (start === null || end === undefined) return;

    const delta = start - end;
    if (Math.abs(delta) < 42) return;
    const direction = delta > 0 ? 1 : -1;
    const canMove = direction > 0 ? activeIndex < lastIndex : activeIndex > 0;
    if (canMove) move(direction);
  };

  return (
    <div
      ref={containerRef}
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative mx-auto h-[min(76vh,580px)] min-h-[520px] max-w-4xl px-4"
    >
      {items.map((item, i) => (
        <Card
          key={`${item.letter}-${i}`}
          i={i}
          total={items.length}
          activeIndex={activeIndex}
          onBack={() => move(-1)}
          {...item}
        />
      ))}
    </div>
  );
}
