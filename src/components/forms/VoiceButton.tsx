import { Mic, Square } from "lucide-react";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";

interface VoiceButtonProps {
  /** Receives the transcribed text. Caller decides how to merge it. */
  onTranscript: (text: string) => void;
  className?: string;
}

/**
 * Mic button that dictates speech into a text field (free Web Speech API).
 * Renders nothing when the browser has no speech support.
 */
export function VoiceButton({ onTranscript, className = "" }: VoiceButtonProps) {
  const { supported, listening, start, stop } = useSpeechRecognition("pt-BR");

  if (!supported) return null;

  return (
    <button
      type="button"
      onClick={() => (listening ? stop() : start(onTranscript))}
      aria-pressed={listening}
      aria-label={listening ? "Parar gravação" : "Falar para preencher"}
      title={listening ? "Parar" : "Falar para preencher"}
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
        listening
          ? "bg-brand text-brand-foreground shadow-sm"
          : "bg-brand-soft/60 text-brand hover:bg-brand-soft"
      } ${className}`}
    >
      {listening ? (
        <>
          <Square className="w-3 h-3 fill-current" />
          <span className="relative flex items-center gap-1.5">
            Ouvindo
            <span className="flex gap-0.5">
              <span className="w-1 h-1 rounded-full bg-current animate-bounce [animation-delay:-0.3s]" />
              <span className="w-1 h-1 rounded-full bg-current animate-bounce [animation-delay:-0.15s]" />
              <span className="w-1 h-1 rounded-full bg-current animate-bounce" />
            </span>
          </span>
        </>
      ) : (
        <>
          <Mic className="w-3.5 h-3.5" />
          Falar
        </>
      )}
    </button>
  );
}

export default VoiceButton;
