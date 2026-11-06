import { useEffect, useRef } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import MessageBubble from "./MessageBubble";
import QuestionForm from "./QuestionForm";
import SafetyNotice from "./SafetyNotice";
import type { ChatMessage } from "../types";

interface Props {
  messages: ChatMessage[];
  loading: boolean;
  error: string | null;
  onAsk: (text: string) => void;
  onRetry: () => void;
  departmentName: string;
}

function TypingIndicator() {
  return (
    <div className="flex animate-rise items-center gap-3" role="status" aria-live="polite">
      <span className="sr-only">MedCompass is preparing an answer</span>
      <div className="flex items-center gap-1.5 rounded-2xl border border-paper-line bg-white px-4 py-3 shadow-card" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <span key={i} className="h-2 w-2 animate-dot rounded-full bg-teal-600" style={{ animationDelay: `${i * 0.16}s` }} />
        ))}
        <span className="ml-2 text-sm text-navy-600">Preparing an explanation…</span>
      </div>
    </div>
  );
}

export default function ConversationView({ messages, loading, error, onAsk, onRetry, departmentName }: Props) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, loading, error]);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-5 px-4 pb-8 pt-6 sm:px-6">
      <p className="text-center text-xs text-navy-600">
        Context: {departmentName} · This conversation exists only in this tab and is not saved.
      </p>

      <div className="flex flex-col gap-5" aria-live="polite" aria-relevant="additions">
        {messages.map((m) => (
          <MessageBubble key={m.id} message={m} />
        ))}
      </div>

      {loading && <TypingIndicator />}

      {error && (
        <div role="alert" className="flex animate-rise flex-col gap-3 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-900 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex gap-2">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </p>
          <button type="button" onClick={onRetry} className="btn-secondary shrink-0 !border-red-300 !py-1.5 text-red-900 hover:!bg-red-100">
            <RotateCcw className="h-4 w-4" aria-hidden="true" /> Try again
          </button>
        </div>
      )}

      <div className="sticky bottom-0 -mx-1 space-y-2 bg-gradient-to-t from-paper via-paper to-paper/0 px-1 pb-2 pt-4">
        <QuestionForm
          onSubmit={onAsk}
          loading={loading}
          label="Follow-up question"
          placeholder="Ask a follow-up question…"
          buttonLabel="Send"
          variant="send"
          rows={2}
        />
        <SafetyNotice />
      </div>
      <div ref={endRef} />
    </div>
  );
}
