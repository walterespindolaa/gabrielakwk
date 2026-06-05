"use client";
import { useTransform, motion, useScroll, type MotionValue } from "motion/react";
import { useRef } from "react";

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
  progress: MotionValue<number>;
  range: [number, number];
  targetScale: number;
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
  progress,
  range,
  targetScale,
}: CardProps) {
  const container = useRef<HTMLDivElement>(null);
  const scale = useTransform(progress, range, [1, targetScale]);

  return (
    <div
      ref={container}
      className="sticky top-0 h-screen flex items-center justify-center px-4"
      style={{ paddingTop: `calc(${i * 28}px + 4rem)` }}
    >
      <motion.div
        style={{
          backgroundColor: bg,
          color: fg,
          scale,
          top: `calc(-5vh + ${i * 28}px)`,
        }}
        className="relative w-full max-w-4xl h-[min(72vh,540px)] rounded-3xl overflow-hidden shadow-2xl border border-black/5 origin-top"
      >
        <div className="grid md:grid-cols-[1fr_1.1fr] h-full">
          {/* Left: copy */}
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

          {/* Right: monumental letter */}
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
    </div>
  );
}

export function StackingCards({ items }: { items: StackingCardItem[] }) {
  const container = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ["start start", "end end"],
  });

  return (
    <div ref={container} className="relative">
      {items.map((item, i) => {
        const targetScale = 1 - (items.length - i) * 0.05;
        return (
          <Card
            key={`${item.letter}-${i}`}
            i={i}
            total={items.length}
            progress={scrollYProgress}
            range={[i * (1 / items.length), 1]}
            targetScale={targetScale}
            {...item}
          />
        );
      })}
    </div>
  );
}
