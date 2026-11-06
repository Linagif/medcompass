import { useId, useState, type FormEvent, type KeyboardEvent } from "react";
import { Loader2, Search, SendHorizontal } from "lucide-react";

interface Props {
  onSubmit: (text: string) => void;
  loading: boolean;
  /** Visible, accessible label for the text box. */
  label: string;
  placeholder: string;
  buttonLabel: string;
  /** "search" shows a magnifier (homepage); "send" shows a paper-plane (follow-ups). */
  variant: "search" | "send";
  inputId?: string;
  rows?: number;
  hideLabel?: boolean;
}

const MAX_CHARS = 4000;

/** One reusable input used on the homepage and for follow-up questions. */
export default function QuestionForm({ onSubmit, loading, label, placeholder, buttonLabel, variant, inputId, rows = 3, hideLabel = true }: Props) {
  const [text, setText] = useState("");
  const autoId = useId();
  const id = inputId ?? autoId;
  const trimmed = text.trim();
  const canSubmit = trimmed.length >= 2 && !loading;
  const Icon = variant === "search" ? Search : SendHorizontal;

  function submit() {
    if (!canSubmit) return;
    onSubmit(trimmed);
    setText("");
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    submit();
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    // Enter sends; Shift+Enter adds a new line. Ignore Enter while an IME is composing.
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      submit();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card p-3 sm:p-4">
      <label htmlFor={id} className={hideLabel ? "sr-only" : "mb-1.5 block text-sm font-medium text-navy-800"}>
        {label}
      </label>
      <textarea
        id={id}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        rows={rows}
        maxLength={MAX_CHARS}
        placeholder={placeholder}
        className="block w-full resize-none rounded-xl border border-paper-line bg-white px-3.5 py-3 text-[15px] text-navy-900 placeholder:text-navy-500 focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-300"
      />
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-navy-600">
          Press <kbd className="rounded border border-paper-line bg-paper-muted px-1">Enter</kbd> to send, <kbd className="rounded border border-paper-line bg-paper-muted px-1">Shift</kbd>+<kbd className="rounded border border-paper-line bg-paper-muted px-1">Enter</kbd> for a new line.
          <span className="ml-2 tabular-nums">{text.length}/{MAX_CHARS}</span>
        </p>
        <button type="submit" disabled={!canSubmit} className="btn-primary">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Icon className="h-4 w-4" aria-hidden="true" />}
          {loading ? "Working…" : buttonLabel}
        </button>
      </div>
      <p className="mt-2 text-xs text-navy-600">Please don't include names, ID numbers, addresses or other identifying details.</p>
    </form>
  );
}
