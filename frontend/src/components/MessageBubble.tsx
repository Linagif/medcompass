import { Compass, User } from "lucide-react";
import MarkdownContent from "./MarkdownContent";
import ModeBadge from "./ModeBadge";
import type { ChatMessage } from "../types";

export default function MessageBubble({ message }: { message: ChatMessage }) {
  if (message.role === "user") {
    return (
      <article className="flex animate-rise justify-end gap-3" aria-label="Your question">
        <div className="max-w-[88%] whitespace-pre-wrap break-words rounded-2xl rounded-tr-md bg-navy-900 px-4 py-3 text-[15px] leading-relaxed text-white sm:max-w-[75%]">
          {/* Rendered as plain text */}
          {message.content}
        </div>
        <span className="mt-1 hidden h-8 w-8 shrink-0 items-center justify-center rounded-full bg-paper-muted text-navy-700 sm:flex" aria-hidden="true">
          <User className="h-4 w-4" />
        </span>
      </article>
    );
  }

  const tone =
    message.mode === "safety" ? "border-red-300 bg-red-50/60" : message.mode === "demo" ? "border-amber-300 bg-amber-50/50" : "border-paper-line bg-white";

  return (
    <article className="flex animate-rise gap-3" aria-label="MedCompass answer">
      <span className="mt-1 hidden h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-700 text-white sm:flex" aria-hidden="true">
        <Compass className="h-4 w-4" />
      </span>
      <div className={`min-w-0 flex-1 rounded-2xl rounded-tl-md border px-4 py-3.5 shadow-card sm:px-5 ${tone}`}>
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span className="font-serif text-sm font-semibold text-navy-900">MedCompass</span>
          {message.mode && <ModeBadge mode={message.mode} />}
        </div>
        <MarkdownContent text={message.content} />
      </div>
    </article>
  );
}
