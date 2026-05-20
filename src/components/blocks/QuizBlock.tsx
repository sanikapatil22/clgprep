"use client";

import { useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export function QuizBlock({
  question,
  options,
  answer,
  explanation,
}: {
  question: string;
  options: string[];
  answer: number;
  explanation: string;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const isAnswered = selected !== null;
  const isCorrect = selected === answer;

  return (
    <motion.section initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="glass rounded-lg p-6">
      <p className="text-xs uppercase tracking-[0.18em] text-emerald-300">Inline Checkpoint</p>
      <h2 className="mt-3 text-xl font-semibold">{question}</h2>
      <div className="mt-5 grid gap-3">
        {options.map((option, index) => (
          <Button
            key={option}
            type="button"
            variant={selected === index ? "default" : "outline"}
            className="h-auto justify-start px-4 py-3 text-left"
            onClick={() => setSelected(index)}
          >
            {option}
          </Button>
        ))}
      </div>
      {isAnswered ? (
        <div className="mt-5 flex gap-3 rounded-md bg-slate-900 p-4 text-sm text-slate-300">
          {isCorrect ? <CheckCircle2 className="text-emerald-300" size={20} /> : <XCircle className="text-rose-300" size={20} />}
          <p>{explanation}</p>
        </div>
      ) : null}
    </motion.section>
  );
}
