import { Outlet, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";
import wordmarkWhite from "@/assets/gabi-wordmark-white.png.asset.json";

import appCss from "../styles.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { title: "Gabriela Kawikioni | Método CRIAR" },
      { name: "description", content: "Consultoria para Posicionamento nas Redes Sociais." },
      { name: "author", content: "Gabriela Kawikioni" },
      { property: "og:title", content: "Gabriela Kawikioni | Método CRIAR" },
      { property: "og:description", content: "Consultoria para Posicionamento nas Redes Sociais." },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/xmLz2USqXdT15L8QCPmEDAfcpeo2/social-images/social-1780674580906-Prancheta_1_cópia_5.webp" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/xmLz2USqXdT15L8QCPmEDAfcpeo2/social-images/social-1780674580906-Prancheta_1_cópia_5.webp" },
      { name: "twitter:title", content: "Gabriela Kawikioni | Método CRIAR" },
      { name: "twitter:description", content: "Consultoria para Posicionamento nas Redes Sociais." },
    ],
    links: [
      {
        rel: "preconnect",
        href: "https://fonts.googleapis.com",
      },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&display=swap",
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
    scripts: [
      {
        children: `
          (function() {
            var t = localStorage.getItem('kwk_theme') || 'clean';
            var el = document.documentElement;
            el.classList.remove('dark');
            el.removeAttribute('data-palette');
            if (t === 'dark') el.classList.add('dark');
            else if (t === 'clean' || t === 'rose') el.setAttribute('data-palette', t);
          })();
        `,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
});

/** Inline, render-blocking splash so the very first paint is on-brand (deep burgundy)
 *  instead of a white flash. It fades out the moment React hydrates. */
const SPLASH_CSS = `
#kwk-splash{position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;
  background:#5b0e2b;transition:opacity .5s ease, visibility .5s ease;}
#kwk-splash img{width:min(58vw,260px);height:auto;animation:kwkSplashPulse 1.6s ease-in-out infinite;}
#kwk-splash.kwk-splash--done{opacity:0;visibility:hidden;pointer-events:none;}
@keyframes kwkSplashPulse{0%,100%{opacity:.6;transform:scale(.98)}50%{opacity:1;transform:scale(1)}}
@media (prefers-reduced-motion: reduce){#kwk-splash img{animation:none}}
`;

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <HeadContent />
        <style dangerouslySetInnerHTML={{ __html: SPLASH_CSS }} />
      </head>
      <body className="pb-[env(safe-area-inset-bottom)]">
        <div id="kwk-splash">
          <img src={wordmarkWhite.url} alt="Gabriela Kawikioni" />
        </div>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  useEffect(() => {
    const splash = document.getElementById("kwk-splash");
    if (!splash) return;
    // Keep it visible for a brief beat, then fade out once hydrated.
    const t = setTimeout(() => splash.classList.add("kwk-splash--done"), 150);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <div className="animate-page-enter">
        <Outlet />
      </div>
      <Toaster position="top-center" />
    </>
  );
}
