export function PYQBlock({ question, university, year }: { question: string; university: string; year: string }) {
  return (
    <section className="rounded-lg border border-amber-300/20 bg-amber-300/8 p-6">
      <p className="text-xs uppercase tracking-[0.18em] text-amber-200">Previous Year Question · {university} {year}</p>
      <p className="mt-3 text-lg font-semibold text-amber-50">{question}</p>
    </section>
  );
}
