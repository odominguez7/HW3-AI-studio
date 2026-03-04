"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { VibeCheck } from "@/components/VibeCheck";
import { vibeCheckToOcean } from "@/lib/affinity";

const CAMPUS_OPTIONS = [
  { value: "mit", label: "MIT" },
  { value: "harvard", label: "Harvard" },
];

const AVAILABILITY_MODES = [
  { value: "casual", label: "Casual" },
  { value: "study_only", label: "Study Only" },
  { value: "founder_mode", label: "Founder Mode" },
  { value: "zen_only", label: "Zen Only" },
];

const AUTOMATION_OPTIONS = [
  { value: "manual", label: "Manual" },
  { value: "assisted", label: "Assisted" },
  { value: "autopilot", label: "Autopilot" },
];

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [campus, setCampus] = useState<"mit" | "harvard">("mit");
  const [userId, setUserId] = useState<string | null>(null);
  const [verifyError, setVerifyError] = useState("");
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [affinityError, setAffinityError] = useState("");
  const [affinityLoading, setAffinityLoading] = useState(false);
  const [onboardError, setOnboardError] = useState("");
  const [onboardLoading, setOnboardLoading] = useState(false);
  const [availabilityModes, setAvailabilityModes] = useState<string[]>([]);
  const [automationMode, setAutomationMode] = useState<
    "manual" | "assisted" | "autopilot"
  >("manual");
  const [calendarConnected, setCalendarConnected] = useState(false);

  const toggleAvailability = (mode: string) => {
    setAvailabilityModes((prev) =>
      prev.includes(mode) ? prev.filter((m) => m !== mode) : [...prev, mode]
    );
  };

  const handleVerify = async () => {
    setVerifyError("");
    setVerifyLoading(true);
    try {
      const res = await fetch("/api/users/verify-edu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, campus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Verification failed");
      setUserId(data.userId);
      setStep(2);
    } catch (e) {
      setVerifyError(e instanceof Error ? e.message : "Verification failed");
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleVibeComplete = async (answers: number[]) => {
    if (!userId) return;
    setAffinityError("");
    setAffinityLoading(true);
    try {
      const ocean = vibeCheckToOcean(answers);
      const res = await fetch("/api/affinity/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          ...ocean,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Profile save failed");
      setStep(3);
    } catch (e) {
      setAffinityError(e instanceof Error ? e.message : "Profile save failed");
    } finally {
      setAffinityLoading(false);
    }
  };

  const handleOnboard = async () => {
    if (!userId) return;
    setOnboardError("");
    setOnboardLoading(true);
    try {
      const res = await fetch("/api/users/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          automationMode,
          availabilityModes,
          calendarConnected,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Onboarding failed");
      setStep(4);
    } catch (e) {
      setOnboardError(e instanceof Error ? e.message : "Onboarding failed");
    } finally {
      setOnboardLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="glass p-6 md:p-8"
          >
            <h1 className="mb-6 font-display text-2xl font-bold text-night-100 md:text-3xl">
              Verify your campus
            </h1>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block font-body text-sm text-night-300">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@university.edu"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-body text-night-100 placeholder:text-night-500 focus:border-spark-500 focus:outline-none focus:ring-1 focus:ring-spark-500"
                />
              </div>
              <div>
                <label className="mb-2 block font-body text-sm text-night-300">
                  Campus
                </label>
                <div className="flex gap-3">
                  {CAMPUS_OPTIONS.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setCampus(c.value as "mit" | "harvard")}
                      className={`flex-1 rounded-xl border px-4 py-3 font-body transition-colors ${
                        campus === c.value
                          ? "border-spark-500 bg-spark-500/20 text-spark-400"
                          : "border-white/10 bg-white/5 text-night-200 hover:border-white/20"
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>
              {verifyError && (
                <p className="font-body text-sm text-red-400">{verifyError}</p>
              )}
              <button
                type="button"
                onClick={handleVerify}
                disabled={verifyLoading || !email}
                className="w-full rounded-xl bg-spark-500 py-3 font-body font-semibold text-night-950 transition-colors hover:bg-spark-400 disabled:opacity-50"
              >
                {verifyLoading ? "Verifying…" : "Verify"}
              </button>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {userId && (
              <p className="mb-4 font-body text-sm text-night-400">
                Verified as user: {userId}
              </p>
            )}
            {affinityError && (
              <p className="mb-4 font-body text-sm text-red-400">
                {affinityError}
              </p>
            )}
            <VibeCheck onComplete={handleVibeComplete} />
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="glass p-6 md:p-8"
          >
            <h1 className="mb-6 font-display text-2xl font-bold text-night-100 md:text-3xl">
              Availability & automation
            </h1>
            <div className="space-y-6">
              <div>
                <label className="mb-3 block font-body text-sm text-night-300">
                  Availability modes
                </label>
                <div className="flex flex-wrap gap-2">
                  {AVAILABILITY_MODES.map((m) => (
                    <label
                      key={m.value}
                      className="flex cursor-pointer items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 transition-colors has-[:checked]:border-spark-500 has-[:checked]:bg-spark-500/20"
                    >
                      <input
                        type="checkbox"
                        checked={availabilityModes.includes(m.value)}
                        onChange={() => toggleAvailability(m.value)}
                        className="rounded border-night-500"
                      />
                      <span className="font-body text-night-200">
                        {m.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-3 block font-body text-sm text-night-300">
                  Automation level
                </label>
                <div className="flex gap-2">
                  {AUTOMATION_OPTIONS.map((a) => (
                    <button
                      key={a.value}
                      type="button"
                      onClick={() =>
                        setAutomationMode(
                          a.value as "manual" | "assisted" | "autopilot"
                        )
                      }
                      className={`flex-1 rounded-xl border px-4 py-3 font-body text-sm transition-colors ${
                        automationMode === a.value
                          ? "border-spark-500 bg-spark-500/20 text-spark-400"
                          : "border-white/10 bg-white/5 text-night-200 hover:border-white/20"
                      }`}
                    >
                      {a.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    checked={calendarConnected}
                    onChange={(e) => setCalendarConnected(e.target.checked)}
                    className="rounded border-night-500"
                  />
                  <span className="font-body text-night-200">
                    Connect calendar
                  </span>
                </label>
              </div>
              {onboardError && (
                <p className="font-body text-sm text-red-400">{onboardError}</p>
              )}
              <button
                type="button"
                onClick={handleOnboard}
                disabled={onboardLoading}
                className="w-full rounded-xl bg-spark-500 py-3 font-body font-semibold text-night-950 transition-colors hover:bg-spark-400 disabled:opacity-50"
              >
                {onboardLoading ? "Saving…" : "Continue"}
              </button>
            </div>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="glass p-6 md:p-8 text-center"
          >
            <h1 className="mb-4 font-display text-3xl font-bold text-night-100">
              You&apos;re in!
            </h1>
            <p className="mb-8 font-body text-night-300">
              Your profile is set. Start exploring sparks.
            </p>
            <Link
              href="/sparks"
              className="inline-block rounded-xl bg-spark-500 px-8 py-3 font-body font-semibold text-night-950 transition-colors hover:bg-spark-400"
            >
              Go to Sparks
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
