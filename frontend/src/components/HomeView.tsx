import { ArrowRight, Lock, X } from "lucide-react";
import DepartmentCard from "./DepartmentCard";
import QuestionForm from "./QuestionForm";
import { DEFAULT_DEPARTMENT_ID, DEPARTMENTS, type Department } from "../config/departments";

interface Props {
  department: Department;
  onSelectDepartment: (id: string) => void;
  onAsk: (text: string) => void;
  loading: boolean;
}

export const HOME_INPUT_ID = "home-question";

export default function HomeView({ department, onSelectDepartment, onAsk, loading }: Props) {
  const isGeneral = department.id === DEFAULT_DEPARTMENT_ID;
  return (
    <div className="mx-auto w-full max-w-5xl px-4 pb-12 pt-8 sm:px-6 sm:pt-12">
      <section aria-labelledby="home-title" className="mx-auto max-w-3xl text-center">
        <p className="mb-3 inline-block rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-teal-800">
          Medical knowledge library · Phase 1 prototype
        </p>
        <h1 id="home-title" className="font-serif text-3xl font-semibold leading-tight text-navy-900 sm:text-5xl">
          Understand health. <span className="text-teal-700">Navigate with confidence.</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-navy-700 sm:text-lg">
          Explore medical conditions, treatments, prevention, and scientific discoveries through clear educational explanations.
        </p>
      </section>

      <section aria-label="Ask a health question" className="mx-auto mt-8 max-w-3xl">
        <QuestionForm
          onSubmit={onAsk}
          loading={loading}
          inputId={HOME_INPUT_ID}
          label="Your health question"
          placeholder={isGeneral ? "Ask about a condition, treatment, test or medical term…" : `Ask a question about ${department.name.toLowerCase()}, or anything else…`}
          buttonLabel="Explore"
          variant="search"
          rows={3}
        />
        <p className="mt-2.5 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-sm text-navy-700">
          <span>
            Answering with context: <strong className="font-semibold">{department.name}</strong>
          </span>
          {!isGeneral && (
            <button type="button" onClick={() => onSelectDepartment(DEFAULT_DEPARTMENT_ID)} className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-teal-800 underline underline-offset-2 hover:bg-teal-50">
              <X className="h-3.5 w-3.5" aria-hidden="true" /> Use general mode
            </button>
          )}
        </p>

        <div className="mt-5">
          <h2 className="mb-2 text-center text-xs font-semibold uppercase tracking-wider text-navy-600">Suggested questions</h2>
          <ul className="flex flex-wrap justify-center gap-2">
            {department.suggestions.map((q) => (
              <li key={q}>
                <button type="button" onClick={() => onAsk(q)} disabled={loading} className="chip disabled:opacity-50">
                  {q}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="dept-title" className="mt-12">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 id="dept-title" className="font-serif text-2xl font-semibold text-navy-900">Browse by department</h2>
            <p className="mt-1 text-sm text-navy-600">
              A department gives the answer some context. You can still ask about anything. No department has its own curated database yet.
            </p>
          </div>
        </div>
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {DEPARTMENTS.map((d) => (
            <li key={d.id}>
              <DepartmentCard
                department={d}
                selected={d.id === department.id}
                onSelect={(id) => {
                  onSelectDepartment(id);
                  document.getElementById(HOME_INPUT_ID)?.focus();
                  document.getElementById(HOME_INPUT_ID)?.scrollIntoView({ block: "center", behavior: "smooth" });
                }}
              />
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="notice-title" className="mt-12 grid gap-3 md:grid-cols-2">
        <div className="card p-4">
          <h2 id="notice-title" className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-navy-900">
            <ArrowRight className="h-4 w-4 text-teal-700" aria-hidden="true" /> Educational use only
          </h2>
          <p className="text-[13px] leading-relaxed text-navy-700">
            MedCompass explains general medical information. It does not diagnose, give personal medical advice, or replace a qualified healthcare professional. If you think you may have a medical emergency, contact your local emergency services immediately.
          </p>
          <p className="mt-2 text-[13px] leading-relaxed text-navy-700">
            In this prototype, answers come from an AI model's general knowledge. Sources have <strong>not</strong> been retrieved or independently verified, and the model can be wrong.
          </p>
        </div>
        <div className="card p-4">
          <h2 className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-navy-900">
            <Lock className="h-4 w-4 text-teal-700" aria-hidden="true" /> Privacy and limits
          </h2>
          <ul className="list-disc space-y-1 pl-4 text-[13px] leading-relaxed text-navy-700">
            <li>Conversations live only in this browser tab. Refreshing clears them. Nothing is saved as history.</li>
            <li>When AI mode is on, your question is sent to the configured AI provider, which may process it under its own data-handling terms.</li>
            <li>Please don't enter names, ID numbers, addresses or other identifying details.</li>
            <li>Emergency detection is a basic prototype safeguard, not a clinical triage tool.</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
