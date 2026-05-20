import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { AppShell } from "@/components/shell/AppShell";
import { CourseCard } from "@/components/course/CourseCard";
import { Card } from "@/components/ui/card";
import { getCoursesForDepartment, getDepartment } from "@/features/learning-engine/sample-content";

export default async function DepartmentCoursesPage({ params }: { params: Promise<{ departmentSlug: string }> }) {
  const { departmentSlug } = await params;
  const department = getDepartment(departmentSlug);
  if (!department) notFound();

  const departmentCourses = getCoursesForDepartment(department.slug);

  return (
    <AppShell>
      <Link href="/courses" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white">
        <ArrowLeft size={16} /> Back to departments
      </Link>
      <section className="mt-8 flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-300">{department.code}</p>
          <h1 className="mt-3 text-4xl font-semibold">{department.name}</h1>
          <p className="mt-3 max-w-3xl text-slate-400">
            Course tracks filtered for this department. Each course opens into a PaperLabs-style learning map.
          </p>
        </div>
        <a
          href={department.sourceHref}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-md border border-slate-800 px-4 py-3 text-sm font-semibold text-emerald-300 hover:border-emerald-300/40"
        >
          {department.sourceLabel} <ExternalLink size={16} />
        </a>
      </section>
      {departmentCourses.length ? (
        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          {departmentCourses.map((course) => (
            <CourseCard key={course.slug} {...course} />
          ))}
        </div>
      ) : (
        <Card className="mt-8 p-6">
          <p className="text-slate-300">CampusLabs courses for this department are queued for syllabus parsing.</p>
        </Card>
      )}
    </AppShell>
  );
}
