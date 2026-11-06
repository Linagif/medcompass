import { Info } from "lucide-react";

export default function SafetyNotice({ text }: { text?: string }) {
  return (
    <div role="note" className="flex gap-2.5 rounded-xl border border-teal-200 bg-teal-50 px-3.5 py-3 text-[13px] leading-relaxed text-navy-800">
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-teal-700" aria-hidden="true" />
      <p>
        {text ??
          "MedCompass provides general educational information only. It is not a diagnosis, not personal medical advice, and not a substitute for a qualified healthcare professional. In an emergency, contact your local emergency services."}
      </p>
    </div>
  );
}
