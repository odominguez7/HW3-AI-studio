"use client";

import { useEffect, useState } from "react";
import { animate, motion } from "framer-motion";

interface InsightCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
}

export function InsightCard({ label, value, subtitle }: InsightCardProps) {
  const isNumeric = typeof value === "number";
  const [displayValue, setDisplayValue] = useState(isNumeric ? 0 : value);

  useEffect(() => {
    if (!isNumeric) {
      setDisplayValue(value);
      return;
    }
    const controls = animate(0, value as number, {
      duration: 1.5,
      ease: "easeOut",
      onUpdate: (v) => setDisplayValue(Math.round(v)),
    });
    return () => controls.stop();
  }, [value, isNumeric]);

  return (
    <motion.article
      className="glass p-5"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <p className="mb-1 font-body text-xs font-medium uppercase tracking-wider text-night-400">
        {label}
      </p>
      <p className="font-display text-3xl font-bold text-night-100 md:text-4xl">
        {displayValue}
      </p>
      {subtitle && (
        <p className="mt-2 font-body text-sm text-night-400">{subtitle}</p>
      )}
    </motion.article>
  );
}
