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
}: CardProps) {
  const segment = total > 1 ? 1 / total : 1;
  const previous = Math.max(0, (i - 1) * segment);
  const current = i * segment;
  const next = Math.min(1, (i + 1) * segment);
  const isFirst = i === 0;
  const isLast = i === total - 1;
  const input = isFirst ? [0, next] : isLast ? [previous, current, 1] : [previous, current, next];
  const y = useTransform(progress, input, isFirst ? [0, -72] : isLast ? [78, 0, 0] : [78, 0, -72]);
  const scale = useTransform(progress, input, isFirst ? [1, 0.88] : isLast ? [0.92, 1, 1] : [0.92, 1, 0.88]);
  const rotate = useTransform(progress, input, isFirst ? [0, -2] : isLast ? [2, 0, 0] : [2, 0, -2]);
  const opacity = useTransform(progress, input, isFirst ? [1, 0.64] : isLast ? [0.72, 1, 1] : [0.72, 1, 0.64]);
  const zIndex = useTransform(progress, input, isFirst ? [total, 0] : isLast ? [i, total + i, total + i] : [i, total + i, i]);

  return (
    <motion.div
      style={{
        backgroundColor: bg,
        color: fg,
        y,
        scale,
        rotate,
        opacity,
        zIndex,
      }}
      className="absolute inset-x-4 mx-auto w-[calc(100%-2rem)] max-w-4xl h-[min(76vh,580px)] rounded-3xl overflow-hidden shadow-2xl border border-foreground/10 origin-top"
    >
      <div className="grid md:grid-cols-[1fr_1.1fr] h-full">
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
  const container = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ["start start", "end end"],
  });

  return (
    <div ref={container} className="relative h-[260vh] sm:h-[280vh]">
      <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden">
        {items.map((item, i) => (
          <Card
            key={`${item.letter}-${i}`}
            i={i}
            total={items.length}
            progress={scrollYProgress}
            {...item}
          />
        ))}
      </div>
    </div>
  );
}
