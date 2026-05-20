"use client";

import { useState } from "react";
import { motion } from "framer-motion";

export function FlashcardBlock({ front, back }: { front: string; back: string }) {
  const [flipped, setFlipped] = useState(false);

  return (
    <button type="button" onClick={() => setFlipped((value) => !value)} className="w-full text-left">
      <motion.section whileHover={{ y: -2 }} className="glass rounded-lg p-6">
        <p className="text-xs uppercase tracking-[0.18em] text-sky-300">Flashcard</p>
        <p className="mt-4 text-lg font-semibold">{flipped ? back : front}</p>
      </motion.section>
    </button>
  );
}
