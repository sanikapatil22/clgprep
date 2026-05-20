import Link from "next/link";
import { ArrowRight, Building2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CampusDepartment } from "@/features/learning-engine/sample-content";

export function DepartmentCard({
  department,
  courseCount,
  href = `/departments/${department.slug}`,
}: {
  department: CampusDepartment;
  courseCount: number;
  href?: string;
}) {
  return (
    <Card className="group overflow-hidden transition hover:border-emerald-300/40">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">{department.code}</p>
            <CardTitle className="mt-3">{department.name}</CardTitle>
          </div>
          <Building2 className="text-slate-500 transition group-hover:text-emerald-300" size={22} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2 text-sm">
          <span className="rounded-md bg-slate-900 px-3 py-2 text-slate-300">{department.kind}</span>
          <span className="rounded-md bg-slate-900 px-3 py-2 text-slate-300">{courseCount} CampusLabs courses</span>
        </div>
        <Link
          href={href}
          className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-emerald-300 hover:text-emerald-200"
        >
          View courses <ArrowRight size={16} />
        </Link>
      </CardContent>
    </Card>
  );
}
