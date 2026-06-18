import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Free, zero-cost voice input using the browser's native Web Speech API
 * (Chrome, Edge, Safari). No API key, no server, no cost. pt-BR by default.
 *
 * If the browser doesn't support it, `supported` is false and the UI should
 * simply hide the mic button (graceful fallback to typing). The architecture
 * leaves room to swap in server-side Whisper later for higher accuracy.
 */
export function useSpeechRecognition(lang = "pt-BR") {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const onResultRef = useRef<((text: string) => void) | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const SR =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;

    setSupported(true);
    const rec = new SR();
    rec.lang = lang;
    rec.continuous = false;
    rec.interimResults = false;
    rec.maxAlternatives = 1;

    rec.onresult = (event: any) => {
      const text = Array.from(event.results)
        .map((r: any) => r[0]?.transcript ?? "")
        .join(" ")
        .trim();
      if (text) onResultRef.current?.(text);
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);

    recognitionRef.current = rec;
    return () => {
      try {
        rec.abort();
      } catch {
        /* noop */
      }
    };
  }, [lang]);

  const start = useCallback((onResult: (text: string) => void) => {
    const rec = recognitionRef.current;
    if (!rec) return;
    onResultRef.current = onResult;
    try {
      rec.start();
      setListening(true);
    } catch {
      // start() throws if already running — ignore.
    }
  }, []);

  const stop = useCallback(() => {
    try {
      recognitionRef.current?.stop();
    } catch {
      /* noop */
    }
    setListening(false);
  }, []);

  return { supported, listening, start, stop };
}
