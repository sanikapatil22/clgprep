import Link from "next/link";
import { ArrowRight, CalendarDays } from "lucide-react";
import { AppShell } from "@/components/shell/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCoursesForSemester, getSemesters } from "@/features/learning-engine/sample-content";

export default function CoursesPage() {
  const semesters = getSemesters();

  return (
    <AppShell>
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-300">BMSIT autonomous structure</p>
        <h1 className="mt-3 text-4xl font-semibold">Choose your semester</h1>
        <p className="mt-3 max-w-2xl text-slate-400">
          Follow the academic flow: select a semester, choose your department, then open the matching courses and topics.
        </p>
        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          {semesters.map((semester) => (
            <Card key={semester} className="group overflow-hidden transition hover:border-emerald-300/40">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">Semester</p>
                    <CardTitle className="mt-3">Semester {semester}</CardTitle>
                  </div>
                  <CalendarDays className="text-slate-500 transition group-hover:text-emerald-300" size={22} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 text-sm">
                  <span className="rounded-md bg-slate-900 px-3 py-2 text-slate-300">
                    {getCoursesForSemester(semester).length} CampusLabs courses
                  </span>
                  <span className="rounded-md bg-slate-900 px-3 py-2 text-slate-300">Departments next</span>
                </div>
                <Link
                  href={`/semesters/${semester}`}
                  className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-emerald-300 hover:text-emerald-200"
                >
                  View departments <ArrowRight size={16} />
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
