import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type CourseCardProps = {
  slug: string;
  title: string;
  code: string;
  semester: number;
  progress: number;
  xp: number;
  href?: string;
};

export function CourseCard({ slug, title, code, semester, progress, xp, href = `/courses/${slug}` }: CourseCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-emerald-300">{code} · Semester {semester}</p>
            <CardTitle className="mt-2">{title}</CardTitle>
          </div>
          <BookOpen className="text-sky-300" size={22} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-2 overflow-hidden rounded-full bg-slate-800">
          <div className="h-full rounded-full bg-emerald-400" style={{ width: `${progress}%` }} />
        </div>
        <div className="mt-4 flex items-center justify-between text-sm text-slate-300">
          <span>{progress}% mastered</span>
          <span>{xp} XP</span>
        </div>
        <Link
          href={href}
          className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-emerald-300 hover:text-emerald-200"
        >
          Continue path <ArrowRight size={16} />
        </Link>
      </CardContent>
    </Card>
  );
}
