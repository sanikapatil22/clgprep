import { AppShell } from "@/components/shell/AppShell";
import { DepartmentCard } from "@/components/course/DepartmentCard";
import { departments, getCoursesForDepartment } from "@/features/learning-engine/sample-content";

export default function CoursesPage() {
  return (
    <AppShell>
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-300">BMSIT autonomous structure</p>
        <h1 className="mt-3 text-4xl font-semibold">Choose your department</h1>
        <p className="mt-3 max-w-2xl text-slate-400">
          Departments are modeled from the BMSIT autonomous page and department navigation. Courses are shown only after a department is selected.
        </p>
        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          {departments.map((department) => (
            <DepartmentCard
              key={department.slug}
              department={department}
              courseCount={getCoursesForDepartment(department.slug).length}
            />
          ))}
        </div>
      </div>
    </AppShell>
  );
}
