import type React from "react";
import { cn } from "@/lib/utils";

const WavesPattern = ({ className }: { className?: string }) => (
  <svg
    aria-hidden
    className={cn("absolute inset-x-0 w-full h-[340px] text-brand/30", className)}
    viewBox="0 0 800 340"
    preserveAspectRatio="none"
    fill="none"
  >
    {Array.from({ length: 10 }).map((_, i) => (
      <path
        key={i}
        d={`M0 ${20 + i * 32} Q 100 ${i % 2 === 0 ? -10 : 50} 200 ${20 + i * 32} T 400 ${20 + i * 32} T 600 ${20 + i * 32} T 800 ${20 + i * 32}`}
        stroke="currentColor"
        strokeWidth="1"
        fill="none"
        opacity={1 - i * 0.07}
      />
    ))}
  </svg>
);

const CrossesPattern = ({ className }: { className?: string }) => (
  <svg
    aria-hidden
    className={cn("absolute inset-x-0 w-full h-[340px] text-brand/25", className)}
    viewBox="0 0 800 340"
    preserveAspectRatio="none"
    fill="none"
  >
    <defs>
      <pattern id="cross-pat" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M20 14 L20 26 M14 20 L26 20" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      </pattern>
    </defs>
    <rect width="800" height="340" fill="url(#cross-pat)" />
  </svg>
);

export type PainCardVariant = "waves" | "crosses";

export const PainCard: React.FC<{
  index: string;
  quote: string;
  variant?: PainCardVariant;
  className?: string;
}> = ({ index, quote, variant = "waves", className }) => {
  const Pattern = variant === "waves" ? WavesPattern : CrossesPattern;
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl border border-border/60 bg-card shadow-sm hover:shadow-xl hover:border-brand/40 transition-all duration-300 group",
        className,
      )}
    >
      {/* Top decorative pattern */}
      <div className="absolute top-0 inset-x-0 h-[170px] overflow-hidden pointer-events-none [mask-image:linear-gradient(to_bottom,black,transparent)]">
        <Pattern className="top-0 animate-waves" />
      </div>

      {/* Bottom decorative pattern (mirrored) */}
      <div className="absolute bottom-0 inset-x-0 h-[170px] overflow-hidden pointer-events-none [mask-image:linear-gradient(to_top,black,transparent)]">
        <Pattern className="bottom-0 -scale-y-100 animate-waves" />
      </div>

      {/* Content */}
      <div className="relative z-10 px-7 py-10 sm:px-8 sm:py-12 flex flex-col items-start gap-4 min-h-[260px]">
        <span className="font-display text-xs tracking-[0.25em] uppercase text-brand/80">
          {index}
        </span>
        <p className="font-display text-lg sm:text-xl text-foreground/90 leading-snug" style={{ textWrap: "pretty" }}>
          <span className="text-brand text-3xl font-display leading-none mr-1 align-top">"</span>
          {quote}
        </p>
      </div>
    </div>
  );
};
