import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";

export interface NotifItem {
  title: string;
  sub?: string;
  href?: string;
}

/** Sino de notificações funcional: abre um dropdown com as pendências. */
export function NotificationsMenu({ items }: { items: NotifItem[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Notificações"
        className="relative w-10 h-10 rounded-full bg-card border border-border/60 flex items-center justify-center text-muted-foreground hover:text-brand transition-colors"
      >
        <Bell className="w-5 h-5" />
        {items.length > 0 && (
          <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-accent text-accent-foreground text-[10px] font-semibold flex items-center justify-center">
            {items.length}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-72 bg-popover border border-border/60 rounded-xl shadow-lg z-50 overflow-hidden">
          <div className="px-4 py-2.5 border-b border-border/60 text-sm font-medium">Notificações</div>
          {items.length === 0 ? (
            <p className="px-4 py-6 text-sm text-muted-foreground text-center">Tudo em dia por aqui.</p>
          ) : (
            <ul className="max-h-80 overflow-auto divide-y divide-border/60">
              {items.map((n, i) => {
                const body = (
                  <>
                    <div className="text-sm font-medium text-foreground">{n.title}</div>
                    {n.sub && <div className="text-xs text-muted-foreground mt-0.5">{n.sub}</div>}
                  </>
                );
                return (
                  <li key={i}>
                    {n.href ? (
                      <a href={n.href} className="block px-4 py-3 hover:bg-muted transition-colors">
                        {body}
                      </a>
                    ) : (
                      <div className="px-4 py-3">{body}</div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default NotificationsMenu;
