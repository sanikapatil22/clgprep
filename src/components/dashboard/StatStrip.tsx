import { Flame, Medal, Zap } from "lucide-react";
import { Card } from "@/components/ui/card";

const stats = [
  { label: "Current streak", value: "12 days", icon: Flame, tone: "text-rose-300" },
  { label: "XP this sem", value: "4,820", icon: Zap, tone: "text-emerald-300" },
  { label: "Badges", value: "18", icon: Medal, tone: "text-sky-300" },
];

export function StatStrip() {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      {stats.map((stat) => (
        <Card key={stat.label} className="flex items-center justify-between p-5">
          <div>
            <p className="text-sm text-slate-400">{stat.label}</p>
            <p className="mt-1 text-2xl font-semibold">{stat.value}</p>
          </div>
          <stat.icon className={stat.tone} size={28} />
        </Card>
      ))}
    </div>
  );
}
