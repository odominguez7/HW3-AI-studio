"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";

const SPARK_TYPE_LOOKUP: Record<string, { emoji: string; label: string }> = {
  study_sync: { emoji: "📚", label: "Study Sync" },
  coffee_clash: { emoji: "☕", label: "Coffee Clash" },
  lunch_link: { emoji: "🍜", label: "Lunch Link" },
  walk_wave: { emoji: "🚶", label: "Walk Wave" },
  homework_hack: { emoji: "🧩", label: "Homework Hack" },
  recess_rush: { emoji: "⚡", label: "Recess Rush" },
  blitz_brainstorm: { emoji: "🧠", label: "Blitz Brainstorm" },
};

type Spark = {
  id: string;
  sparkType: string;
  locationHint: string;
  durationMinutes: number;
  startsAt: string;
  creator?: { email?: string };
};

function formatStartsAt(startsAt: string): string {
  try {
    return new Date(startsAt).toLocaleString(undefined, {
      weekday: "long",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return startsAt;
  }
}

export default function SparkDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [spark, setSpark] = useState<Spark | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"details" | "feedback">("details");

  const [commitUserId, setCommitUserId] = useState("");
  const [commitNote, setCommitNote] = useState("");
  const [commitLoading, setCommitLoading] = useState(false);
  const [commitSuccess, setCommitSuccess] = useState(false);

  const [feedbackUserId, setFeedbackUserId] = useState("");
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackRepeat, setFeedbackRepeat] = useState(true);
  const [feedbackWhatWorked, setFeedbackWhatWorked] = useState("");
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  useEffect(() => {
    async function fetchSpark() {
      try {
        const res = await fetch("/api/sparks/recommendations");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to fetch");
        const sparks = data.sparks ?? [];
        const found = sparks.find((s: Spark) => s.id === id);
        setSpark(found ?? null);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to fetch spark");
      } finally {
        setLoading(false);
      }
    }
    fetchSpark();
  }, [id]);

  const handleCommit = async () => {
    setCommitLoading(true);
    setCommitSuccess(false);
    try {
      const res = await fetch(`/api/sparks/${id}/commit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: commitUserId, note: commitNote || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Commit failed");
      setCommitSuccess(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Commit failed");
    } finally {
      setCommitLoading(false);
    }
  };

  const handleFeedback = async () => {
    setFeedbackLoading(true);
    setFeedbackSuccess(false);
    try {
      const res = await fetch(`/api/sparks/${id}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: feedbackUserId,
          rating: feedbackRating,
          repeatInterest: feedbackRepeat,
          whatWorked: feedbackWhatWorked,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Feedback failed");
      setFeedbackSuccess(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Feedback failed");
    } finally {
      setFeedbackLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12">
        <p className="font-body text-night-400">Loading…</p>
      </div>
    );
  }

  if (error || !spark) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12">
        <div className="glass p-6">
          <p className="font-body text-red-400">
            {error || "Spark not found"}
          </p>
        </div>
      </div>
    );
  }

  const typeInfo = SPARK_TYPE_LOOKUP[spark.sparkType] ?? {
    emoji: "✨",
    label: spark.sparkType,
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <div className="glass p-6">
          <div className="mb-4 flex items-center gap-2">
            <span className="text-3xl">{typeInfo.emoji}</span>
            <h1 className="font-display text-2xl font-bold text-night-100">
              {typeInfo.label}
            </h1>
          </div>

          <div className="flex gap-4 border-b border-white/10">
            <button
              type="button"
              onClick={() => setActiveTab("details")}
              className={`border-b-2 pb-2 font-body font-medium transition-colors ${
                activeTab === "details"
                  ? "border-spark-500 text-spark-400"
                  : "border-transparent text-night-400 hover:text-night-200"
              }`}
            >
              Details
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("feedback")}
              className={`border-b-2 pb-2 font-body font-medium transition-colors ${
                activeTab === "feedback"
                  ? "border-spark-500 text-spark-400"
                  : "border-transparent text-night-400 hover:text-night-200"
              }`}
            >
              Feedback
            </button>
          </div>

          {activeTab === "details" && (
            <div className="mt-6 space-y-4">
              <p className="font-body text-night-200">
                <span className="text-night-400">Location:</span>{" "}
                {spark.locationHint}
              </p>
              <p className="font-body text-night-200">
                <span className="text-night-400">Time:</span>{" "}
                {formatStartsAt(spark.startsAt)}
              </p>
              <p className="font-body text-night-200">
                <span className="text-night-400">Duration:</span>{" "}
                {spark.durationMinutes} min
              </p>
              {spark.creator?.email && (
                <p className="font-body text-night-200">
                  <span className="text-night-400">Creator:</span>{" "}
                  {spark.creator.email}
                </p>
              )}

              <div className="mt-6 border-t border-white/10 pt-6">
                <h3 className="mb-3 font-display font-semibold text-night-100">
                  Commit to this Spark
                </h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={commitUserId}
                    onChange={(e) => setCommitUserId(e.target.value)}
                    placeholder="Your userId"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 font-body text-night-100 placeholder:text-night-500"
                  />
                  <input
                    type="text"
                    value={commitNote}
                    onChange={(e) => setCommitNote(e.target.value)}
                    placeholder="Note (optional)"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 font-body text-night-100 placeholder:text-night-500"
                  />
                  <button
                    type="button"
                    onClick={handleCommit}
                    disabled={commitLoading || !commitUserId}
                    className="w-full rounded-xl bg-spark-500 py-3 font-body font-semibold text-night-950 hover:bg-spark-400 disabled:opacity-50"
                  >
                    {commitLoading ? "Committing…" : "Commit"}
                  </button>
                  {commitSuccess && (
                    <p className="font-body text-sm text-green-400">
                      Committed successfully!
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "feedback" && (
            <div className="mt-6">
              <h3 className="mb-4 font-display font-semibold text-night-100">
                Rate this Spark
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block font-body text-sm text-night-300">
                    Your userId
                  </label>
                  <input
                    type="text"
                    value={feedbackUserId}
                    onChange={(e) => setFeedbackUserId(e.target.value)}
                    placeholder="userId"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 font-body text-night-100 placeholder:text-night-500"
                  />
                </div>
                <div>
                  <label className="mb-2 block font-body text-sm text-night-300">
                    Rating (1–5)
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setFeedbackRating(r)}
                        className={`h-10 w-10 rounded-lg font-body transition-colors ${
                          feedbackRating === r
                            ? "bg-spark-500 text-night-950"
                            : "bg-white/10 text-night-300 hover:bg-white/20"
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      checked={feedbackRepeat}
                      onChange={(e) => setFeedbackRepeat(e.target.checked)}
                      className="rounded border-night-500"
                    />
                    <span className="font-body text-night-200">
                      Would you meet again?
                    </span>
                  </label>
                </div>
                <div>
                  <label className="mb-2 block font-body text-sm text-night-300">
                    What worked?
                  </label>
                  <textarea
                    value={feedbackWhatWorked}
                    onChange={(e) => setFeedbackWhatWorked(e.target.value)}
                    placeholder="Share your experience…"
                    rows={4}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 font-body text-night-100 placeholder:text-night-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleFeedback}
                  disabled={
                    feedbackLoading || !feedbackUserId || !feedbackWhatWorked
                  }
                  className="w-full rounded-xl bg-spark-500 py-3 font-body font-semibold text-night-950 hover:bg-spark-400 disabled:opacity-50"
                >
                  {feedbackLoading ? "Submitting…" : "Submit Feedback"}
                </button>
                {feedbackSuccess && (
                  <p className="font-body text-sm text-green-400">
                    Feedback recorded!
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
