import { Plus, ShieldCheck, X } from "lucide-react";
import Logo from "./Logo";
import { DEPARTMENTS } from "../config/departments";
import type { HealthInfo } from "../services/api";

export type BackendStatus = { state: "checking" } | { state: "offline" } | { state: "online"; info: HealthInfo };

interface Props {
  selectedId: string;
  onSelect: (id: string) => void;
  onNew: () => void;
  open: boolean;
  onClose: () => void;
  status: BackendStatus;
}

function StatusLine({ status }: { status: BackendStatus }) {
  let dot = "bg-navy-500";
  let text = "Checking server…";
  if (status.state === "offline") {
    dot = "bg-red-500";
    text = "Server not reachable";
  } else if (status.state === "online") {
    dot = status.info.ai_configured ? "bg-teal-400" : "bg-amber-400";
    text = status.info.ai_configured ? "AI provider connected" : "Demo mode: AI provider not connected";
  }
  return (
    <p className="flex items-center gap-2 text-xs text-teal-100" role="status">
      <span className={`h-2 w-2 shrink-0 rounded-full ${dot}`} aria-hidden="true" />
      {text}
    </p>
  );
}

export default function Sidebar({ selectedId, onSelect, onNew, open, onClose, status }: Props) {
  return (
    <>
      {/* Mobile overlay */}
      {open && <div className="fixed inset-0 z-30 bg-navy-950/50 lg:hidden" onClick={onClose} aria-hidden="true" />}

      <aside
        id="app-sidebar"
        aria-label="Sidebar"
        className={`fixed inset-y-0 left-0 z-40 flex w-[19rem] max-w-[88vw] flex-col bg-navy-900 text-white transition-transform duration-200 lg:static lg:z-auto lg:w-72 lg:max-w-none lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-start justify-between gap-2 px-4 pb-3 pt-5">
          <div className="flex items-center gap-3">
            <Logo size={38} />
            <div>
              <p className="font-serif text-lg font-semibold leading-tight">MedCompass</p>
              <p className="text-[11px] leading-snug text-teal-100">Reliable medical knowledge. Clearly explained.</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-teal-100 hover:bg-navy-800 lg:hidden" aria-label="Close navigation menu">
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="px-4 pb-3">
          <button type="button" onClick={onNew} className="btn w-full justify-start bg-teal-600 text-white hover:bg-teal-500">
            <Plus className="h-4 w-4" aria-hidden="true" /> New exploration
          </button>
        </div>

        <nav aria-label="Medical departments" className="min-h-0 flex-1 overflow-y-auto px-2 pb-2">
          <p className="px-2 pb-1.5 pt-1 text-[11px] font-semibold uppercase tracking-wider text-teal-200">Departments</p>
          <ul className="space-y-0.5">
            {DEPARTMENTS.map(({ id, name, icon: Icon }) => {
              const active = id === selectedId;
              return (
                <li key={id}>
                  <button
                    type="button"
                    onClick={() => onSelect(id)}
                    aria-current={active ? "true" : undefined}
                    className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition-colors ${
                      active ? "bg-teal-700 font-semibold text-white" : "text-slate-200 hover:bg-navy-800 hover:text-white"
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span className="truncate">{name}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="space-y-2.5 border-t border-navy-700 px-4 py-3.5">
          <p className="flex gap-2 text-[11px] leading-relaxed text-slate-300">
            <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal-300" aria-hidden="true" />
            Educational information only. Not a diagnosis or a substitute for a clinician. Sources are not yet verified.
          </p>
          <div className="flex items-center justify-between gap-2">
            <StatusLine status={status} />
            <span className="rounded-full border border-teal-400/50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-teal-200">Phase 1 prototype</span>
          </div>
        </div>
      </aside>
    </>
  );
}
