import { Bot, FlaskConical, ShieldAlert } from "lucide-react";
import type { ChatMode } from "../types";

const STYLES: Record<ChatMode, { label: string; detail: string; cls: string; Icon: typeof Bot }> = {
  demo: { label: "Demo mode", detail: "AI provider not connected. No medical content generated.", cls: "border-amber-300 bg-amber-50 text-amber-900", Icon: FlaskConical },
  ai: { label: "AI-generated", detail: "General knowledge. Sources not verified.", cls: "border-teal-200 bg-teal-50 text-teal-900", Icon: Bot },
  safety: { label: "Safety guidance", detail: "Basic built-in check, not a clinical assessment.", cls: "border-red-300 bg-red-50 text-red-900", Icon: ShieldAlert },
};

export default function ModeBadge({ mode }: { mode: ChatMode }) {
  const { label, detail, cls, Icon } = STYLES[mode];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${cls}`}>
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      <span>{label}</span>
      <span className="hidden font-normal opacity-80 sm:inline">· {detail}</span>
    </span>
  );
}
