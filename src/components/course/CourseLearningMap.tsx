"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, BookOpen, CheckCircle2, Lock, X } from "lucide-react";
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
  startTopicSlug: string;
  locked: boolean;
};

export function CourseLearningMap({ course }: { course: CampusCourse }) {
  const items = useMemo<LearningMapItem[]>(
    () =>
      course.modules.map((module, index) => {
        const firstOpenTopic = module.topics.find((topic) => topic.status !== "locked") ?? module.topics[0];
        return {
          id: module.slug,
          index: index + 1,
          title: module.title,
          summary: module.summary,
          realWorldUse: module.realWorldUse,
          tasks: module.topics.length,
          progress: module.progress,
          moduleSlug: module.slug,
          startTopicSlug: firstOpenTopic.slug,
          locked: module.topics.every((topic) => topic.status === "locked"),
        };
      }),
    [course],
  );
  const [selected, setSelected] = useState<LearningMapItem | null>(null);

  return (
    <div className="relative">
      <section className="mx-auto max-w-6xl pt-8">
        <p className="text-sm font-bold uppercase tracking-[0.22em] text-emerald-300">CampusLabs Learning Map</p>
        <h1 className="mt-5 text-5xl font-semibold tracking-normal text-white md:text-6xl">{course.title}</h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-400">
          Concept-first modules for {course.code}, shaped as focused learning missions instead of a static syllabus list.
        </p>
        <div className="mt-4 flex flex-wrap gap-2 text-sm text-slate-400">
          <span className="rounded-md bg-slate-900 px-3 py-2">Semester {course.semester}</span>
          <span className="rounded-md bg-slate-900 px-3 py-2">{course.progress}% progress</span>
          <a href={course.sourceHref} target="_blank" rel="noreferrer" className="rounded-md border border-emerald-300/20 px-3 py-2 text-emerald-300">
            {course.sourceLabel}
          </a>
        </div>
      </section>

      <section className="mx-auto mt-10 grid max-w-6xl gap-5 lg:grid-cols-3">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setSelected(item)}
            className="group min-h-72 rounded-lg border border-slate-800 bg-black/50 p-5 text-left transition hover:border-emerald-300/45 hover:bg-slate-950"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-md border border-emerald-300/40 bg-emerald-400/10 text-lg font-bold text-emerald-300">
                {item.index}
              </span>
              <span className="rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-slate-300">{item.tasks} tasks</span>
            </div>
            <h2 className="mt-8 text-2xl font-semibold text-white">{item.title}</h2>
            <p className="mt-4 min-h-20 leading-7 text-slate-400">{item.summary}</p>
            <div className="mt-5 border-t border-slate-800 pt-5">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">Real-world use</p>
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
              className="w-full max-w-4xl rounded-lg border border-slate-800 bg-[#050505] p-6 shadow-2xl"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-md border border-emerald-300/35 bg-emerald-400/10 px-3 py-2 text-xs font-bold uppercase tracking-[0.16em] text-emerald-300">
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
              <div className="mt-8">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Used in real systems</p>
                <div className="mt-4 flex flex-wrap gap-3">
                  {selected.realWorldUse
                    .replace("Used in ", "")
                    .split(",")
                    .slice(0, 3)
                    .map((chip) => (
                      <span key={chip} className="rounded-md border border-emerald-300/25 bg-emerald-400/10 px-3 py-2 text-sm font-semibold text-slate-300">
                        {chip.trim()}
                      </span>
                    ))}
                </div>
              </div>
              <div className="mt-8">
                <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                  <BookOpen size={16} /> Core concepts
                </p>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {course.modules
                    .find((module) => module.slug === selected.moduleSlug)
                    ?.topics.map((topic) => (
                      <div key={topic.slug} className="flex items-center gap-3 rounded-md border border-slate-800 bg-slate-950 px-4 py-3 text-slate-300">
                        {topic.status === "locked" ? <Lock size={16} className="text-slate-600" /> : <CheckCircle2 size={16} className="text-emerald-300" />}
                        {topic.title}
                      </div>
                    ))}
                </div>
              </div>
              <div className="mt-10 flex justify-end gap-3">
                <Button variant="outline" onClick={() => setSelected(null)}>Close</Button>
                <Link href={`/courses/${course.slug}/${selected.moduleSlug}/${selected.startTopicSlug}`}>
                  <Button disabled={selected.locked}>
                    Open Concept <ArrowRight size={17} />
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
