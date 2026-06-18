import { motion } from "framer-motion";
import monogramAsset from "@/assets/kwk-monogram.png.asset.json";

interface KwkLoaderProps {
  /** Optional label shown under the mark */
  label?: string;
  /** When true, fills the viewport (default). When false, fills the parent. */
  fullScreen?: boolean;
}

/**
 * Branded loading state for the KWK platform.
 * Replaces blank screens / "Carregando..." text with the KWK monogram,
 * a gentle breathing animation and a shimmer bar. Respects reduced-motion.
 */
export function KwkLoader({ label = "Carregando", fullScreen = true }: KwkLoaderProps) {
  return (
    <div
      className={`${
        fullScreen ? "min-h-screen" : "h-full min-h-[40vh]"
      } w-full flex flex-col items-center justify-center gap-6 bg-background`}
      role="status"
      aria-live="polite"
    >
      <motion.img
        src={monogramAsset.url}
        alt="Gabriela Kawikioni"
        width={88}
        height={88}
        className="h-20 w-auto select-none"
        draggable={false}
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: [0.55, 1, 0.55], scale: [0.97, 1, 0.97] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Shimmer progress bar */}
      <div className="relative h-[3px] w-32 overflow-hidden rounded-full bg-brand/15">
        <motion.span
          className="absolute inset-y-0 left-0 w-1/2 rounded-full bg-brand/70"
          animate={{ x: ["-100%", "200%"] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {label && (
        <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">{label}</p>
      )}
      <span className="sr-only">Carregando, aguarde…</span>
    </div>
  );
}

export default KwkLoader;
