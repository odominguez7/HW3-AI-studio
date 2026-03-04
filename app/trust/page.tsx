"use client";

import { useState } from "react";
import { motion } from "framer-motion";

const REPORT_REASONS = [
  { value: "safety", label: "Safety concern" },
  { value: "harassment", label: "Harassment" },
  { value: "no_show", label: "No-show" },
  { value: "other", label: "Other" },
];

export default function TrustPage() {
  const [reportReporterId, setReportReporterId] = useState("");
  const [reportTargetUserId, setReportTargetUserId] = useState("");
  const [reportReason, setReportReason] = useState("safety");
  const [reportDetails, setReportDetails] = useState("");
  const [reportLoading, setReportLoading] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);
  const [reportError, setReportError] = useState("");

  const [blockRequesterId, setBlockRequesterId] = useState("");
  const [blockTargetUserId, setBlockTargetUserId] = useState("");
  const [blockLoading, setBlockLoading] = useState(false);
  const [blockSuccess, setBlockSuccess] = useState(false);
  const [blockError, setBlockError] = useState("");

  const handleReport = async () => {
    setReportLoading(true);
    setReportSuccess(false);
    setReportError("");
    try {
      const res = await fetch("/api/trust/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reporterId: reportReporterId,
          targetUserId: reportTargetUserId,
          reason: reportReason,
          details: reportDetails,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Report failed");
      setReportSuccess(true);
    } catch (e) {
      setReportError(e instanceof Error ? e.message : "Report failed");
    } finally {
      setReportLoading(false);
    }
  };

  const handleBlock = async () => {
    setBlockLoading(true);
    setBlockSuccess(false);
    setBlockError("");
    try {
      const res = await fetch("/api/trust/block", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requesterId: blockRequesterId,
          blockedUserId: blockTargetUserId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Block failed");
      setBlockSuccess(true);
    } catch (e) {
      setBlockError(e instanceof Error ? e.message : "Block failed");
    } finally {
      setBlockLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-12"
      >
        <h1 className="font-display text-3xl font-bold text-night-100 md:text-4xl">
          Trust & Safety
        </h1>

        <section className="space-y-6">
          <h2 className="font-display text-xl font-semibold text-night-100">
            Safety Controls
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="glass p-6">
              <h3 className="mb-2 font-display font-medium text-night-100">
                Block & Report
              </h3>
              <p className="font-body text-sm text-night-400">
                Block users to prevent future matches. Report issues for
                moderation review.
              </p>
            </div>
            <div className="glass p-6">
              <h3 className="mb-2 font-display font-medium text-night-100">
                Public Location Preference
              </h3>
              <p className="font-body text-sm text-night-400">
                Sparks default to public campus locations. You can choose
                group-only or invite-only visibility.
              </p>
            </div>
            <div className="glass p-6">
              <h3 className="mb-2 font-display font-medium text-night-100">
                Group-Only Mode
              </h3>
              <p className="font-body text-sm text-night-400">
                Limit matches to group settings for added comfort. Toggle in
                spark creation.
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-8 md:grid-cols-2">
          <div className="glass p-6">
            <h2 className="mb-4 font-display text-xl font-semibold text-night-100">
              Report an Issue
            </h2>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block font-body text-sm text-night-300">
                  Your userId (reporter)
                </label>
                <input
                  type="text"
                  value={reportReporterId}
                  onChange={(e) => setReportReporterId(e.target.value)}
                  placeholder="reporterId"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 font-body text-night-100 placeholder:text-night-500"
                />
              </div>
              <div>
                <label className="mb-2 block font-body text-sm text-night-300">
                  Target userId
                </label>
                <input
                  type="text"
                  value={reportTargetUserId}
                  onChange={(e) => setReportTargetUserId(e.target.value)}
                  placeholder="targetUserId"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 font-body text-night-100 placeholder:text-night-500"
                />
              </div>
              <div>
                <label className="mb-2 block font-body text-sm text-night-300">
                  Reason
                </label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 font-body text-night-100"
                >
                  {REPORT_REASONS.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block font-body text-sm text-night-300">
                  Details
                </label>
                <textarea
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                  placeholder="Describe what happened…"
                  rows={4}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 font-body text-night-100 placeholder:text-night-500"
                />
              </div>
              {reportError && (
                <p className="font-body text-sm text-red-400">{reportError}</p>
              )}
              {reportSuccess && (
                <p className="font-body text-sm text-green-400">
                  Report submitted.
                </p>
              )}
              <button
                type="button"
                onClick={handleReport}
                disabled={
                  reportLoading ||
                  !reportReporterId ||
                  !reportTargetUserId ||
                  reportDetails.length < 3
                }
                className="w-full rounded-xl bg-spark-500 py-3 font-body font-semibold text-night-950 hover:bg-spark-400 disabled:opacity-50"
              >
                {reportLoading ? "Submitting…" : "Submit Report"}
              </button>
            </div>
          </div>

          <div className="glass p-6">
            <h2 className="mb-4 font-display text-xl font-semibold text-night-100">
              Block a User
            </h2>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block font-body text-sm text-night-300">
                  Your userId (requester)
                </label>
                <input
                  type="text"
                  value={blockRequesterId}
                  onChange={(e) => setBlockRequesterId(e.target.value)}
                  placeholder="requesterId"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 font-body text-night-100 placeholder:text-night-500"
                />
              </div>
              <div>
                <label className="mb-2 block font-body text-sm text-night-300">
                  User to block
                </label>
                <input
                  type="text"
                  value={blockTargetUserId}
                  onChange={(e) => setBlockTargetUserId(e.target.value)}
                  placeholder="blockedUserId"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 font-body text-night-100 placeholder:text-night-500"
                />
              </div>
              {blockError && (
                <p className="font-body text-sm text-red-400">{blockError}</p>
              )}
              {blockSuccess && (
                <p className="font-body text-sm text-green-400">
                  User blocked.
                </p>
              )}
              <button
                type="button"
                onClick={handleBlock}
                disabled={
                  blockLoading || !blockRequesterId || !blockTargetUserId
                }
                className="w-full rounded-xl bg-spark-500 py-3 font-body font-semibold text-night-950 hover:bg-spark-400 disabled:opacity-50"
              >
                {blockLoading ? "Blocking…" : "Block User"}
              </button>
            </div>
          </div>
        </section>

        <section className="glass p-6">
          <h2 className="mb-4 font-display text-xl font-semibold text-night-100">
            Trust Policy
          </h2>
          <div className="prose prose-invert max-w-none font-body text-night-300">
            <p className="mb-4">
              Reports are reviewed by our moderation team within 48 hours. We
              follow a clear lifecycle: triage → investigation → resolution.
              Blocked users will not appear in your recommendations or be able to
              see your sparks. All actions are reversible from your settings.
            </p>
            <p>
              We prioritize campus safety. MIT/Harvard verification, public
              location defaults, and group-only options help keep meets safe and
              accountable.
            </p>
          </div>
        </section>
      </motion.div>
    </div>
  );
}
