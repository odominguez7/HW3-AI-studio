"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { InsightCard } from "@/components/InsightCard";

const SPARK_TYPE_LABELS: Record<string, string> = {
  study_sync: "Study Sync",
  coffee_clash: "Coffee Clash",
  lunch_link: "Lunch Link",
  walk_wave: "Walk Wave",
  homework_hack: "Homework Hack",
  recess_rush: "Recess Rush",
  blitz_brainstorm: "Blitz Brainstorm",
};

type InsightsData = {
  totalSparks: number;
  totalCommitments: number;
  avgRating: number;
  repeatMeetRate: number;
  topLocations: string[];
  topSparkTypes: string[];
};

export default function InsightsPage() {
  const [data, setData] = useState<InsightsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchInsights() {
      try {
        const res = await fetch("/api/insights/campus");
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Failed to fetch");
        setData(json);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to fetch insights");
      } finally {
        setLoading(false);
      }
    }
    fetchInsights();
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12">
        <p className="font-body text-night-400">Loading insights…</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="glass p-6">
          <p className="font-body text-red-400">
            {error || "Failed to load insights"}
          </p>
        </div>
      </div>
    );
  }

  const repeatRatePercent = (data.repeatMeetRate * 100).toFixed(1);
  const avgRatingFormatted = data.avgRating.toFixed(1);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-12"
      >
        <header>
          <h1 className="font-display text-3xl font-bold text-night-100 md:text-4xl">
            Campus Pulse
          </h1>
          <p className="mt-2 font-body text-night-400">
            Aggregate, privacy-safe intelligence
          </p>
        </header>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <InsightCard label="Total Sparks" value={data.totalSparks} />
          <InsightCard label="Total Commitments" value={data.totalCommitments} />
          <InsightCard
            label="Avg Rating"
            value={avgRatingFormatted}
            subtitle="Out of 5"
          />
          <InsightCard
            label="Repeat Meet Rate"
            value={`${repeatRatePercent}%`}
            subtitle="Users who met 2+ times"
          />
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <div className="glass p-6">
            <h2 className="mb-4 font-display text-xl font-semibold text-night-100">
              Top Locations
            </h2>
            {data.topLocations.length === 0 ? (
              <p className="font-body text-night-400">No location data yet.</p>
            ) : (
              <ul className="space-y-2">
                {data.topLocations.map((loc, i) => (
                  <li
                    key={loc}
                    className="flex items-center gap-2 font-body text-night-200"
                  >
                    <span className="text-spark-400">{i + 1}.</span>
                    {loc}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="glass p-6">
            <h2 className="mb-4 font-display text-xl font-semibold text-night-100">
              Top Spark Types
            </h2>
            {data.topSparkTypes.length === 0 ? (
              <p className="font-body text-night-400">No spark type data yet.</p>
            ) : (
              <ul className="space-y-2">
                {data.topSparkTypes.map((type, i) => (
                  <li
                    key={type}
                    className="flex items-center gap-2 font-body text-night-200"
                  >
                    <span className="text-spark-400">{i + 1}.</span>
                    {SPARK_TYPE_LABELS[type] ?? type}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
