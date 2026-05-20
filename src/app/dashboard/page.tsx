import Link from "next/link";
import { AppShell } from "@/components/shell/AppShell";
import { CourseCard } from "@/components/course/CourseCard";
import { StatStrip } from "@/components/dashboard/StatStrip";
import { Card } from "@/components/ui/card";
import { courses } from "@/features/learning-engine/sample-content";

export default function DashboardPage() {
  return (
    <AppShell>
      <div className="flex flex-col gap-8">
        <section className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">Semester 3</p>
            <h1 className="mt-3 text-4xl font-semibold">Your learning cockpit</h1>
            <p className="mt-3 max-w-2xl text-slate-400">
              Continue the next unlocked topic, protect your streak, and move through modules with measurable mastery.
            </p>
          </div>
          <Card className="p-4 text-sm text-slate-300">
            Recent topic: <Link href="/courses/dbms/normalization/1nf" className="font-semibold text-emerald-300">DBMS · 1NF</Link>
          </Card>
        </section>
        <StatStrip />
        <section className="grid gap-4 lg:grid-cols-2">
          {courses.map((course) => (
            <CourseCard key={course.slug} {...course} />
          ))}
        </section>
      </div>
    </AppShell>
  );
}
