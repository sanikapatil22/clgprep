"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export function AnimationBlock({ title, frames }: { title: string; frames: string[] }) {
  const [index, setIndex] = useState(0);

  return (
    <section className="glass rounded-lg p-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-semibold">{title}</h2>
        <Button variant="secondary" size="sm" onClick={() => setIndex((value) => (value + 1) % frames.length)}>
          Transform
        </Button>
      </div>
      <div className="mt-6 flex min-h-40 items-center justify-center rounded-lg border border-slate-800 bg-slate-950/70 p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={frames[index]}
            initial={{ opacity: 0, y: 20, rotateX: -18 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            exit={{ opacity: 0, y: -20, rotateX: 18 }}
            className="max-w-md text-center text-lg font-semibold text-sky-200"
          >
            {frames[index]}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
