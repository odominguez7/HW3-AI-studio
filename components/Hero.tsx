"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const trustItems = [
  "MIT/Harvard verified",
  "Campus-safe defaults",
  "Always reversible",
];

export function Hero() {
  return (
    <section className="flex min-h-screen flex-col items-center justify-center px-4 py-16">
      <motion.div
        className="mx-auto max-w-4xl text-center"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <h1 className="font-display text-5xl font-bold text-gradient md:text-7xl">
          Find your next real-world breakthrough.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl font-body text-lg text-night-200 md:text-xl">
          Serendipity matches you with people, places, and moments that turn
          shared interests into real connection.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/onboarding"
            className="w-full rounded-xl bg-spark-500 px-8 py-4 font-body font-semibold text-night-950 transition-colors hover:bg-spark-400 sm:w-auto"
          >
            Start Your Vibe Check
          </Link>
          <Link
            href="/sparks"
            className="w-full rounded-xl border border-white/20 bg-white/5 px-8 py-4 font-body font-semibold backdrop-blur-xl transition-colors hover:bg-white/10 sm:w-auto"
          >
            Browse Live Sparks
          </Link>
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 font-body text-sm text-night-300">
          {trustItems.map((item) => (
            <span key={item} className="flex items-center gap-2">
              <span className="text-spark-400">✓</span>
              {item}
            </span>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
