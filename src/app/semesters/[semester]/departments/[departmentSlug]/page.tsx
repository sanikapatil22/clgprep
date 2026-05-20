import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { AppShell } from "@/components/shell/AppShell";
import { CourseCard } from "@/components/course/CourseCard";
import { Card } from "@/components/ui/card";
import {
  getCoursesForSemesterAndDepartment,
  getDepartment,
  getSemesters,
} from "@/features/learning-engine/sample-content";

export default async function SemesterDepartmentCoursesPage({
  params,
}: {
  params: Promise<{ semester: string; departmentSlug: string }>;
}) {
  const { semester: semesterParam, departmentSlug } = await params;
  const semester = Number(semesterParam);
  const department = getDepartment(departmentSlug);
  if (!department || !Number.isInteger(semester) || !getSemesters().includes(semester)) notFound();

  const departmentCourses = getCoursesForSemesterAndDepartment(semester, department.slug);

  return (
    <AppShell>
      <Link
        href={`/semesters/${semester}`}
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white"
      >
        <ArrowLeft size={16} /> Back to departments
      </Link>
      <section className="mt-8 flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-300">
            Semester {semester} / {department.code}
          </p>
          <h1 className="mt-3 text-4xl font-semibold">{department.name}</h1>
          <p className="mt-3 max-w-3xl text-slate-400">
            Courses for this department in semester {semester}. Open a course to continue into modules and topics.
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
            <CourseCard key={course.slug} {...course} href={`/courses/${course.slug}`} />
          ))}
        </div>
      ) : (
        <Card className="mt-8 p-6">
          <p className="text-slate-300">CampusLabs courses for this semester and department are queued for syllabus parsing.</p>
        </Card>
      )}
    </AppShell>
  );
}
