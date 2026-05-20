"use client";

import { motion } from "framer-motion";

export function TextBlock({ title, body, callout }: { title: string; body: string; callout?: string }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="glass rounded-lg p-6"
    >
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="mt-3 leading-7 text-slate-300">{body}</p>
      {callout ? <p className="mt-5 rounded-md bg-emerald-400/10 p-4 text-sm text-emerald-200">{callout}</p> : null}
    </motion.section>
  );
}
