import { ChevronRight, Menu, Plus } from "lucide-react";
import type { Department } from "../config/departments";

interface Props {
  department: Department;
  onOpenMenu: () => void;
  onNew: () => void;
  menuOpen: boolean;
}

export default function TopBar({ department, onOpenMenu, onNew, menuOpen }: Props) {
  return (
    <header className="flex items-center justify-between gap-3 border-b border-paper-line bg-white/90 px-3 py-2.5 backdrop-blur sm:px-6">
      <div className="flex min-w-0 items-center gap-2">
        <button
          type="button"
          onClick={onOpenMenu}
          className="rounded-lg p-2 text-navy-800 hover:bg-paper-muted lg:hidden"
          aria-label="Open navigation menu"
          aria-expanded={menuOpen}
          aria-controls="app-sidebar"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>
        <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1 text-sm text-navy-600">
          <span className="hidden sm:inline">Knowledge Library</span>
          <ChevronRight className="hidden h-3.5 w-3.5 shrink-0 sm:inline" aria-hidden="true" />
          <span className="truncate font-semibold text-navy-900" aria-current="page">
            {department.name}
          </span>
        </nav>
        <span className="ml-1 hidden shrink-0 rounded-full border border-teal-200 bg-teal-50 px-2.5 py-0.5 text-xs font-medium text-teal-800 md:inline">
          Context: {department.name}
        </span>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <span className="rounded-full border border-amber-300 bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-amber-900">Beta prototype</span>
        <button type="button" onClick={onNew} className="btn-secondary !px-3 !py-2">
          <Plus className="h-4 w-4" aria-hidden="true" />
          <span className="hidden sm:inline">New exploration</span>
          <span className="sr-only sm:hidden">New exploration</span>
        </button>
      </div>
    </header>
  );
}
