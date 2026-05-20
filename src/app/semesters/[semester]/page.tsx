import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { AppShell } from "@/components/shell/AppShell";
import { DepartmentCard } from "@/components/course/DepartmentCard";
import { departments, getCoursesForSemesterAndDepartment, getSemesters } from "@/features/learning-engine/sample-content";

export default async function SemesterDepartmentsPage({ params }: { params: Promise<{ semester: string }> }) {
  const { semester: semesterParam } = await params;
  const semester = Number(semesterParam);
  if (!Number.isInteger(semester) || !getSemesters().includes(semester)) notFound();

  const semesterDepartments = departments.filter(
    (department) => getCoursesForSemesterAndDepartment(semester, department.slug).length > 0
  );

  return (
    <AppShell>
      <Link href="/courses" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white">
        <ArrowLeft size={16} /> Back to semesters
      </Link>
      <section className="mt-8">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-300">Semester {semester}</p>
        <h1 className="mt-3 text-4xl font-semibold">Choose your department</h1>
        <p className="mt-3 max-w-2xl text-slate-400">
          Departments below have mapped courses for this semester. Pick one to see the course path.
        </p>
      </section>
      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        {semesterDepartments.map((department) => (
          <DepartmentCard
            key={department.slug}
            department={department}
            courseCount={getCoursesForSemesterAndDepartment(semester, department.slug).length}
            href={`/semesters/${semester}/departments/${department.slug}`}
          />
        ))}
      </div>
    </AppShell>
  );
}
