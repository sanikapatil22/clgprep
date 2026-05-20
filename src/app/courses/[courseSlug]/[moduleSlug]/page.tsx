import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Circle } from "lucide-react";
import { AppShell } from "@/components/shell/AppShell";
import { courses } from "@/features/learning-engine/sample-content";

export default async function ModuleTaskListPage({
  params,
}: {
  params: Promise<{ courseSlug: string; moduleSlug: string }>;
}) {
  const { courseSlug, moduleSlug } = await params;
  const course = courses.find((item) => item.slug === courseSlug);
  const module = course?.modules.find((item) => item.slug === moduleSlug);
  if (!course || !module) notFound();

  return (
    <AppShell>
      <div className="pointer-events-none fixed inset-y-24 right-12 hidden select-none text-xs leading-[3.4rem] text-emerald-950/30 lg:block">
        {Array.from({ length: 24 }, (_, index) => (
          <p key={index} className="tracking-[1.8rem]">
            {index % 2 ? "0 1 0" : "1 0 1"}
          </p>
        ))}
      </div>

      <section className="mx-auto max-w-4xl pt-8">
        <Link href={`/courses/${course.slug}`} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-white">
          <ArrowLeft size={16} /> Back to {course.title}
        </Link>
        <h1 className="mt-12 text-5xl font-semibold tracking-normal text-white">{course.code}: {module.title}</h1>
        <div className="mt-5 flex flex-wrap gap-2 text-sm font-bold text-slate-300">
          <span className="rounded-md bg-zinc-900 px-3 py-2">Semester {course.semester}</span>
          <span className="rounded-md bg-zinc-900 px-3 py-2">CampusLabs</span>
        </div>
        <p className="mt-7 max-w-3xl text-lg leading-8 text-slate-400">{module.summary}</p>
      </section>

      <section className="mx-auto mt-14 max-w-4xl">
        <div className="mb-7 flex items-center gap-4">
          <h2 className="text-3xl font-semibold text-white">Implementation Track</h2>
          <span className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-bold text-slate-400">{module.topics.length} Tasks</span>
        </div>
        <div className="space-y-4">
          {module.topics.map((topic, index) => {
            const locked = topic.status === "locked";
            const content = (
              <div
                className={`relative flex min-h-32 items-center gap-7 rounded-lg border p-7 transition ${
                  locked
                    ? "border-slate-900 bg-zinc-950/60 text-slate-600"
                    : "border-slate-800 bg-zinc-900/80 text-slate-300 hover:border-emerald-300/45"
                }`}
              >
                {index === 0 && !locked ? <span className="absolute left-0 top-4 h-20 w-1 rounded-r bg-emerald-400" /> : null}
                <div className="w-16 text-center">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Task</p>
                  <p className="mt-2 text-3xl font-bold text-slate-500">{String(index + 1).padStart(2, "0")}</p>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-semibold text-white">{topic.title}</h3>
                  <p className="mt-2 max-w-2xl leading-7 text-slate-400">
                    Complete the concept workspace and run the implementation checks for this topic.
                  </p>
                </div>
                <div className="hidden items-center gap-3 md:flex">
                  <span className="rounded-md bg-zinc-800 px-3 py-2 text-sm font-bold text-slate-500">Micro</span>
                  <span className="rounded-md border border-emerald-400/35 bg-emerald-400/10 px-3 py-2 text-sm font-bold text-emerald-300">
                    {locked ? "Locked" : "Easy"}
                  </span>
                  <Circle size={32} className="text-slate-700" />
                </div>
              </div>
            );

            return locked ? (
              <div key={topic.slug}>{content}</div>
            ) : (
              <Link key={topic.slug} href={`/courses/${course.slug}/${module.slug}/${topic.slug}`}>
                {content}
              </Link>
            );
          })}
        </div>
      </section>
    </AppShell>
  );
}
