import Link from "next/link";
import { Check, Lock, Radio } from "lucide-react";
import type { TopicNode } from "@/types/learning";

export function ProgressRail({ topics }: { topics: TopicNode[] }) {
  return (
    <aside className="glass sticky top-24 h-fit rounded-lg p-5">
      <p className="text-sm font-semibold text-slate-200">Topic Roadmap</p>
      <div className="mt-5 space-y-3">
        {topics.map((topic) => {
          const Icon = topic.status === "complete" ? Check : topic.status === "active" ? Radio : Lock;
          return (
            <Link
              key={topic.slug}
              href={topic.status === "locked" ? "#" : `/courses/dbms/normalization/${topic.slug}`}
              className="flex items-center gap-3 rounded-md border border-slate-800 bg-slate-900/55 p-3"
            >
              <span
                className={
                  topic.status === "complete"
                    ? "text-emerald-300"
                    : topic.status === "active"
                      ? "text-sky-300"
                      : "text-slate-500"
                }
              >
                <Icon size={18} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">{topic.title}</span>
                <span className="text-xs text-slate-500">{topic.xp} XP</span>
              </span>
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
