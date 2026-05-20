"use client";

import { motion } from "framer-motion";

export function DiagramBlock({ title, nodes, edges }: { title: string; nodes: string[]; edges: [number, number][] }) {
  return (
    <motion.section initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="glass rounded-lg p-6">
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className="mt-6 grid gap-3 md:grid-cols-4">
        {nodes.map((node, index) => (
          <motion.div
            key={node}
            initial={{ opacity: 0, scale: 0.94 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.08 }}
            className="relative rounded-md border border-sky-300/20 bg-sky-300/8 p-4 text-center text-sm font-medium"
          >
            {node}
            {edges.some(([from]) => from === index) ? (
              <span className="absolute -right-4 top-1/2 hidden -translate-y-1/2 text-slate-500 md:block">→</span>
            ) : null}
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
