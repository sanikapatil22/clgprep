"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Box, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CampusCourse } from "@/features/learning-engine/sample-content";

type LearningMapItem = {
  id: string;
  index: number;
  title: string;
  summary: string;
  realWorldUse: string;
  tasks: number;
  progress: number;
  moduleSlug: string;
  concepts: string[];
};

export function CourseLearningMap({ course }: { course: CampusCourse }) {
  const items = useMemo<LearningMapItem[]>(
    () =>
      course.modules.map((module, index) => ({
        id: module.slug,
        index: index + 1,
        title: module.title,
        summary: module.summary,
        realWorldUse: module.realWorldUse,
        tasks: module.topics.length,
        progress: module.progress,
        moduleSlug: module.slug,
        concepts: module.topics.map((topic) => topic.title),
      })),
    [course],
  );
  const [selected, setSelected] = useState<LearningMapItem | null>(null);

  return (
    <div className="relative min-h-[calc(100vh-8rem)] overflow-hidden">
      <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-72 select-none text-xs leading-[3.4rem] text-emerald-950/30 lg:block">
        {Array.from({ length: 30 }, (_, index) => (
          <p key={index} className="tracking-[1.8rem]">
            {index % 2 ? "0 1 0" : "1 0 1"}
          </p>
        ))}
      </div>

      <section className="relative mx-auto max-w-6xl pt-8">
        <div className="mx-auto mb-14 flex w-fit max-w-full gap-2 overflow-x-auto rounded-lg border border-slate-800 bg-black/40 p-2">
          {["Overview", "Modules", "Practice", "Progress"].map((tab, index) => (
            <span
              key={tab}
              className={`whitespace-nowrap rounded-md px-6 py-3 text-sm font-bold ${
                index === 1
                  ? "border border-sky-500/50 bg-sky-500/10 text-white"
                  : "text-slate-500"
              }`}
            >
              {tab}
            </span>
          ))}
        </div>

        <p className="text-sm font-bold uppercase tracking-[0.18em] text-sky-400">CampusLabs track</p>
        <h1 className="mt-5 max-w-4xl text-5xl font-semibold tracking-normal text-white md:text-6xl">{course.title}</h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-400">
          Concept-first modules for {course.code}, shaped as focused implementation tasks instead of a static syllabus list.
        </p>
      </section>

      <section className="relative mx-auto mt-10 grid max-w-6xl gap-5 lg:grid-cols-3">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setSelected(item)}
            className="group min-h-72 rounded-lg border border-slate-800 bg-black/55 p-6 text-left transition hover:border-sky-500/60 hover:bg-slate-950"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-md border border-sky-500/60 bg-sky-500/10 text-lg font-bold text-sky-400">
                {item.index}
              </span>
              <span className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-semibold text-slate-300">{item.tasks} tasks</span>
            </div>
            <h2 className="mt-8 text-2xl font-semibold text-white">{item.title}</h2>
            <p className="mt-4 min-h-20 leading-7 text-slate-400">{item.summary}</p>
            <div className="mt-5 border-t border-slate-800 pt-5">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-sky-400">Real-world use</p>
              <p className="mt-3 text-sm leading-6 text-slate-400">{item.realWorldUse}</p>
            </div>
          </button>
        ))}
      </section>

      <AnimatePresence>
        {selected ? (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0, y: 18 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: 18 }}
              className="w-full max-w-4xl rounded-xl border border-slate-800 bg-[#050505] p-7 shadow-2xl"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-md border border-sky-500/45 bg-sky-500/10 px-3 py-2 text-xs font-bold uppercase tracking-[0.16em] text-sky-400">
                    {course.code}
                  </span>
                  <span className="rounded-md border border-slate-800 px-3 py-2 text-xs font-bold text-slate-400">
                    Progress {selected.progress}%
                  </span>
                </div>
                <button type="button" onClick={() => setSelected(null)} className="rounded-md p-2 text-slate-500 hover:bg-slate-900 hover:text-white" aria-label="Close">
                  <X size={20} />
                </button>
              </div>
              <h2 className="mt-10 text-4xl font-semibold text-white">{selected.title}</h2>
              <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-400">{selected.summary}</p>

              <div className="mt-9">
                <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                  <Box size={16} /> Core concepts
                </p>
                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  {selected.concepts.map((concept) => (
                    <div key={concept} className="flex items-center gap-4 rounded-md border border-slate-800 bg-zinc-950 px-4 py-4 text-slate-300">
                      <span className="h-2 w-2 rounded-full bg-sky-500" />
                      {concept}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-10 flex justify-end gap-3">
                <Button variant="outline" onClick={() => setSelected(null)}>Close</Button>
                <Link href={`/courses/${course.slug}/${selected.moduleSlug}`}>
                  <Button>
                    Start Learning <ArrowRight size={17} />
                  </Button>
                </Link>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
