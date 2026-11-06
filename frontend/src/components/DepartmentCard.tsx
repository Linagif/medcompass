import type { Department } from "../config/departments";

interface Props {
  department: Department;
  selected: boolean;
  onSelect: (id: string) => void;
}

export default function DepartmentCard({ department, selected, onSelect }: Props) {
  const { id, name, description, icon: Icon } = department;
  return (
    <button
      type="button"
      onClick={() => onSelect(id)}
      aria-pressed={selected}
      className={`card group flex h-full w-full flex-col gap-2 p-4 text-left transition duration-150 hover:-translate-y-0.5 hover:shadow-lift ${
        selected ? "border-teal-500 ring-1 ring-teal-500" : "hover:border-teal-300"
      }`}
    >
      <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${selected ? "bg-teal-700 text-white" : "bg-teal-50 text-teal-700 group-hover:bg-teal-100"}`}>
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <span className="font-semibold text-navy-900">{name}</span>
      <span className="text-[13px] leading-snug text-navy-600">{description}</span>
    </button>
  );
}
