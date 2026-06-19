import { useEffect, useRef, useState } from "react";
import { Palette, Check } from "lucide-react";

const THEMES = [
  { key: "vinho", label: "Vinho", swatch: "#5b0e2b" },
  { key: "clean", label: "Clean", swatch: "#ffffff" },
  { key: "rose", label: "Rosé", swatch: "#f4c0d1" },
  { key: "dark", label: "Escuro", swatch: "#241016" },
];

export function applyTheme(t: string) {
  if (typeof document === "undefined") return;
  const el = document.documentElement;
  el.classList.remove("dark");
  el.removeAttribute("data-palette");
  if (t === "dark") el.classList.add("dark");
  else if (t === "clean" || t === "rose") el.setAttribute("data-palette", t);
  localStorage.setItem("kwk_theme", t);
}

/** Seletor de tema: deixa a pessoa escolher a paleta (Vinho, Clean, Rosé, Escuro). */
export function ThemeSwitcher() {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState("clean");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => setCurrent(localStorage.getItem("kwk_theme") || "clean"), []);
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  function pick(t: string) {
    applyTheme(t);
    setCurrent(t);
    setOpen(false);
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Escolher tema"
        className="w-10 h-10 rounded-full bg-card border border-border/60 flex items-center justify-center text-muted-foreground hover:text-brand transition-colors"
      >
        <Palette className="w-5 h-5" />
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-44 bg-popover border border-border/60 rounded-xl shadow-lg p-1.5 z-50">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground px-2 py-1.5">Tema</div>
          {THEMES.map((t) => (
            <button
              key={t.key}
              onClick={() => pick(t.key)}
              className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm hover:bg-muted text-left transition-colors"
            >
              <span className="w-4 h-4 rounded-full border border-border/60" style={{ background: t.swatch }} />
              <span className="flex-1">{t.label}</span>
              {current === t.key && <Check className="w-4 h-4 text-brand" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default ThemeSwitcher;
