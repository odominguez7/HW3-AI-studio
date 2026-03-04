"use client";

import { Hero } from "@/components/Hero";
import { motion } from "framer-motion";

const HOW_IT_WORKS = [
  "Set your vibe and availability",
  "Get affinity-matched spark suggestions",
  "Meet, rate, and grow your connection graph",
];

const SPARK_TYPES = [
  { emoji: "📚", name: "Study Sync", desc: "P-set accountability" },
  { emoji: "☕", name: "Coffee Clash", desc: "Brainstorm ritual" },
  { emoji: "🍜", name: "Lunch Link", desc: "Nourish + connect" },
  { emoji: "🚶", name: "Walk Wave", desc: "Mind-flying" },
  { emoji: "🧩", name: "Homework Hack", desc: "Peer debug" },
  { emoji: "⚡", name: "Recess Rush", desc: "Stress shred" },
  { emoji: "🧠", name: "Blitz Brainstorm", desc: "Creative collision" },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function HomePage() {
  return (
    <>
      <Hero />

      <section className="px-4 py-16 md:py-24">
        <div className="mx-auto max-w-6xl">
          <motion.h2
            className="mb-10 font-display text-3xl font-bold text-night-100 md:text-4xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5 }}
          >
            How It Works
          </motion.h2>
          <motion.div
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
          >
            {HOW_IT_WORKS.map((step, i) => (
              <motion.div
                key={step}
                variants={item}
                className="glass p-6"
              >
                <span className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-spark-500/20 font-display text-lg font-bold text-spark-400">
                  {i + 1}
                </span>
                <p className="font-body text-night-200">{step}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="px-4 py-16 md:py-24">
        <div className="mx-auto max-w-6xl">
          <motion.h2
            className="mb-10 font-display text-3xl font-bold text-night-100 md:text-4xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5 }}
          >
            Spark Types
          </motion.h2>
          <motion.div
            className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
          >
            {SPARK_TYPES.map((t) => (
              <motion.article
                key={t.name}
                variants={item}
                className="glass p-5"
              >
                <span className="text-2xl">{t.emoji}</span>
                <h3 className="mt-2 font-display font-semibold text-night-100">
                  {t.name}
                </h3>
                <p className="mt-1 font-body text-sm text-night-400">{t.desc}</p>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="px-4 py-16 md:py-24">
        <div className="mx-auto max-w-6xl">
          <motion.h2
            className="mb-6 font-display text-3xl font-bold text-night-100 md:text-4xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5 }}
          >
            This Week&apos;s Insight
          </motion.h2>
          <motion.div
            className="glass p-6 md:p-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5 }}
          >
            <p className="font-body text-lg text-night-200">
              High-openness pairs in Lobby 13 had{" "}
              <span className="font-display font-semibold text-spark-400">
                2.1x repeat meets
              </span>
              .
            </p>
          </motion.div>
        </div>
      </section>
    </>
  );
}
