export function CodeBlock({ language, code, caption }: { language: string; code: string; caption: string }) {
  return (
    <section className="overflow-hidden rounded-lg border border-slate-800 bg-slate-950">
      <div className="flex items-center justify-between border-b border-slate-800 px-5 py-3 text-sm text-slate-400">
        <span>{caption}</span>
        <span>{language}</span>
      </div>
      <pre className="overflow-x-auto p-5 text-sm leading-6 text-emerald-200">
        <code>{code}</code>
      </pre>
    </section>
  );
}
