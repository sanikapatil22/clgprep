import Link from "next/link";
import { ArrowRight, BrainCircuit, GitBranch, Trophy } from "lucide-react";
import { AppShell } from "@/components/shell/AppShell";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <AppShell>
      <section className="grid min-h-[72vh] items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-300">PaperLabs for college</p>
          <h1 className="mt-5 max-w-3xl text-5xl font-semibold tracking-normal text-white md:text-7xl">
            CampusLabs
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            A concept-first learning operating system where college subjects unlock like a progression game and every topic is taught through interactive blocks.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/dashboard">
              <Button>
                Open dashboard <ArrowRight size={18} />
              </Button>
            </Link>
            <Link href="/courses/dbms/normalization/1nf">
              <Button variant="outline">Try learning engine</Button>
            </Link>
          </div>
        </div>
        <div className="grid gap-4">
          {[
            { icon: BrainCircuit, title: "Learning Blocks", body: "Text, quizzes, animations, diagrams, flashcards, PYQs, steps, and code render from JSON." },
            { icon: GitBranch, title: "Unlock Graph", body: "Students progress topic by topic with dependencies, XP, streaks, and mastery gates." },
            { icon: Trophy, title: "College Context", body: "Semester-wise courses, modules, PYQs, syllabus parsing, and Drive resource sync." },
          ].map((item) => (
            <div key={item.title} className="glass rounded-lg p-5">
              <item.icon className="text-emerald-300" />
              <h2 className="mt-4 text-xl font-semibold">{item.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">{item.body}</p>
            </div>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
