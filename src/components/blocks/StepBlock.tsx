import { Check } from "lucide-react";

export function StepBlock({ title, steps }: { title: string; steps: string[] }) {
  return (
    <section className="glass rounded-lg p-6">
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className="mt-5 space-y-3">
        {steps.map((step, index) => (
          <div key={step} className="flex items-center gap-3 rounded-md bg-slate-900/70 p-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-400 text-slate-950">
              <Check size={15} />
            </span>
            <span className="text-sm text-slate-300">{index + 1}. {step}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
