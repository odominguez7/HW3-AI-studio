"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const SPARK_TYPE_LOOKUP: Record<string, { emoji: string; label: string }> = {
  study_sync: { emoji: "📚", label: "Study Sync" },
  coffee_clash: { emoji: "☕", label: "Coffee Clash" },
  lunch_link: { emoji: "🍽️", label: "Lunch Link" },
  walk_wave: { emoji: "🚶", label: "Walk Wave" },
  homework_hack: { emoji: "✏️", label: "Homework Hack" },
  recess_rush: { emoji: "🏃", label: "Recess Rush" },
  blitz_brainstorm: { emoji: "💡", label: "Blitz Brainstorm" },
};

interface SparkCardProps {
  id: string;
  sparkType: string;
  locationHint: string;
  durationMinutes: number;
  startsAt: string;
  matchScore: number | null;
  creatorEmail?: string;
}

function formatStartsAt(startsAt: string): string {
  try {
    const date = new Date(startsAt);
    return date.toLocaleString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return startsAt;
  }
}

function getMatchBadgeColor(score: number): string {
  if (score >= 70) return "bg-green-500/20 text-green-400 border-green-500/30";
  if (score >= 50) return "bg-amber-500/20 text-amber-400 border-amber-500/30";
  return "bg-night-400/20 text-night-300 border-night-400/30";
}

export function SparkCard({
  id,
  sparkType,
  locationHint,
  durationMinutes,
  startsAt,
  matchScore,
}: SparkCardProps) {
  const typeInfo = SPARK_TYPE_LOOKUP[sparkType] ?? {
    emoji: "✨",
    label: sparkType,
  };

  return (
    <motion.article
      className="glass overflow-hidden p-5 transition-shadow hover:spark-glow"
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{typeInfo.emoji}</span>
          <span className="font-display font-semibold text-night-100">
            {typeInfo.label}
          </span>
        </div>
        {matchScore !== null && (
          <span
            className={`rounded-full border px-3 py-1 text-xs font-medium ${getMatchBadgeColor(matchScore)}`}
          >
            {matchScore}% vibe match
          </span>
        )}
      </div>

      <div className="mt-4 space-y-1 font-body text-sm text-night-200">
        <p>
          <span className="text-night-400">Location:</span> {locationHint}
        </p>
        <p>
          <span className="text-night-400">Duration:</span> {durationMinutes}{" "}
          min
        </p>
        <p>
          <span className="text-night-400">Time:</span> {formatStartsAt(startsAt)}
        </p>
      </div>

      <Link
        href={`/sparks/${id}`}
        className="mt-5 block w-full rounded-xl bg-spark-500 py-3 text-center font-body font-semibold text-night-950 transition-colors hover:bg-spark-400"
      >
        Commit
      </Link>
    </motion.article>
  );
}
