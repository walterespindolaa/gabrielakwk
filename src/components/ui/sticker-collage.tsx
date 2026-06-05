import sticker6 from "@/assets/stickers/sticker-6.png.asset.json";
import sticker9 from "@/assets/stickers/sticker-9.png.asset.json";
import sticker10 from "@/assets/stickers/sticker-10.png.asset.json";
import sticker12 from "@/assets/stickers/sticker-12.png.asset.json";
import sticker14 from "@/assets/stickers/sticker-14.png.asset.json";
import sticker16 from "@/assets/stickers/sticker-16.png.asset.json";
import sticker17 from "@/assets/stickers/sticker-17.png.asset.json";
import sticker18 from "@/assets/stickers/sticker-18.png.asset.json";
import sticker19 from "@/assets/stickers/sticker-19.png.asset.json";
import sticker21 from "@/assets/stickers/sticker-21.png.asset.json";

type StickerPos = {
  src: string;
  /** tailwind position classes, eg "top-10 -left-6" */
  className: string;
  /** rotation in deg */
  rotate: number;
  /** width in px */
  size: number;
};

const presets: Record<string, StickerPos[]> = {
  pain: [
    { src: sticker17.url, className: "top-8 -left-10 sm:left-4", rotate: -12, size: 140 },
    { src: sticker18.url, className: "top-32 right-4 sm:right-16", rotate: 8, size: 160 },
    { src: sticker16.url, className: "bottom-10 left-1/4", rotate: -6, size: 130 },
    { src: sticker19.url, className: "bottom-24 -right-8 sm:right-6", rotate: 15, size: 170 },
  ],
  pullquote: [
    { src: sticker17.url, className: "-top-4 -left-4 sm:top-4 sm:left-4 opacity-80", rotate: -18, size: 70 },
    { src: sticker6.url, className: "-bottom-4 -right-4 sm:bottom-6 sm:right-6 opacity-80", rotate: 12, size: 80 },
  ],
  fits: [
    { src: sticker19.url, className: "top-16 -left-6 sm:left-10", rotate: -10, size: 130 },
    { src: sticker17.url, className: "bottom-16 right-4 sm:right-12", rotate: 14, size: 110 },
  ],
  about: [
    { src: sticker14.url, className: "top-10 right-6 sm:right-20", rotate: 10, size: 150 },
    { src: sticker17.url, className: "bottom-8 left-4 sm:left-24", rotate: -14, size: 110 },
  ],
  deliverables: [
    { src: sticker16.url, className: "top-8 -right-8 sm:right-10", rotate: 12, size: 140 },
    { src: sticker19.url, className: "bottom-12 -left-6 sm:left-12", rotate: -8, size: 160 },
    { src: sticker6.url, className: "top-1/2 right-1/3 hidden lg:block", rotate: 18, size: 120 },
  ],
  method: [
    { src: sticker18.url, className: "top-12 left-6 sm:left-16", rotate: -10, size: 140 },
    { src: sticker17.url, className: "bottom-16 right-6 sm:right-20", rotate: 12, size: 120 },
  ],
  meetings: [
    { src: sticker9.url, className: "top-10 right-4 sm:right-16", rotate: 10, size: 140 },
    { src: sticker10.url, className: "bottom-12 left-4 sm:left-16", rotate: -8, size: 150 },
    { src: sticker12.url, className: "top-1/2 -right-6 hidden lg:block", rotate: 16, size: 110 },
  ],
  faq: [
    { src: sticker21.url, className: "top-10 -left-8 sm:left-6", rotate: -12, size: 140 },
    { src: sticker17.url, className: "bottom-10 right-4 sm:right-16", rotate: 10, size: 110 },
  ],
};

export function StickerCollage({ variant }: { variant: keyof typeof presets }) {
  const items = presets[variant] ?? [];
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {items.map((s, i) => (
        <img
          key={i}
          src={s.src}
          alt=""
          loading="lazy"
          style={{ width: s.size, height: s.size, transform: `rotate(${s.rotate}deg)` }}
          className={`absolute object-contain select-none ${s.className}`}
        />
      ))}
    </div>
  );
}
