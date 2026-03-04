"use client";

import { useState } from "react";
import { motion } from "framer-motion";

const AUTOMATION_OPTIONS = [
  { value: "manual", label: "Manual" },
  { value: "assisted", label: "Assisted" },
  { value: "autopilot", label: "Autopilot" },
];

const NOTIFICATION_OPTIONS = [
  { value: "realtime", label: "Realtime" },
  { value: "daily", label: "Daily digest" },
  { value: "weekly", label: "Weekly digest" },
  { value: "off", label: "Off" },
];

const VISIBILITY_OPTIONS = [
  { value: "public", label: "Public" },
  { value: "friends_only", label: "Friends only" },
  { value: "hidden", label: "Hidden" },
];

export default function SettingsPage() {
  const [automationLevel, setAutomationLevel] = useState("manual");
  const [calendarPermission, setCalendarPermission] = useState(false);
  const [notificationCadence, setNotificationCadence] = useState("daily");
  const [visibility, setVisibility] = useState("public");

  const handleSave = () => {
    alert("Settings saved!");
  };

  const handleExportData = () => {
    alert("Coming soon");
  };

  const handleDeleteAccount = () => {
    alert("Coming soon");
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <h1 className="font-display text-3xl font-bold text-night-100 md:text-4xl">
          Settings
        </h1>

        <div className="glass p-6">
          <h2 className="mb-4 font-display text-lg font-semibold text-night-100">
            Automation
          </h2>
          <div className="flex flex-wrap gap-3">
            {AUTOMATION_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className="flex cursor-pointer items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 transition-colors has-[:checked]:border-spark-500 has-[:checked]:bg-spark-500/20"
              >
                <input
                  type="radio"
                  name="automation"
                  value={opt.value}
                  checked={automationLevel === opt.value}
                  onChange={() => setAutomationLevel(opt.value)}
                  className="border-night-500"
                />
                <span className="font-body text-night-200">{opt.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="glass p-6">
          <h2 className="mb-4 font-display text-lg font-semibold text-night-100">
            Calendar
          </h2>
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={calendarPermission}
              onChange={(e) => setCalendarPermission(e.target.checked)}
              className="rounded border-night-500"
            />
            <span className="font-body text-night-200">
              Allow calendar access for scheduling
            </span>
          </label>
        </div>

        <div className="glass p-6">
          <h2 className="mb-4 font-display text-lg font-semibold text-night-100">
            Notifications
          </h2>
          <label className="mb-2 block font-body text-sm text-night-300">
            Notification cadence
          </label>
          <select
            value={notificationCadence}
            onChange={(e) => setNotificationCadence(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-body text-night-100"
          >
            {NOTIFICATION_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="glass p-6">
          <h2 className="mb-4 font-display text-lg font-semibold text-night-100">
            Visibility
          </h2>
          <div className="flex flex-wrap gap-3">
            {VISIBILITY_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className="flex cursor-pointer items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 transition-colors has-[:checked]:border-spark-500 has-[:checked]:bg-spark-500/20"
              >
                <input
                  type="radio"
                  name="visibility"
                  value={opt.value}
                  checked={visibility === opt.value}
                  onChange={() => setVisibility(opt.value)}
                  className="border-night-500"
                />
                <span className="font-body text-night-200">{opt.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleSave}
            className="rounded-xl bg-spark-500 px-8 py-3 font-body font-semibold text-night-950 hover:bg-spark-400"
          >
            Save Settings
          </button>
        </div>

        <div className="glass p-6 space-y-4">
          <h2 className="font-display text-lg font-semibold text-night-100">
            Account
          </h2>
          <div className="flex flex-wrap gap-4">
            <button
              type="button"
              onClick={handleExportData}
              className="rounded-xl border border-white/20 bg-white/5 px-6 py-2 font-body font-medium text-night-200 transition-colors hover:bg-white/10"
            >
              Export My Data
            </button>
            <button
              type="button"
              onClick={handleDeleteAccount}
              className="rounded-xl border border-red-500/30 bg-red-500/10 px-6 py-2 font-body font-medium text-red-400 transition-colors hover:bg-red-500/20"
            >
              Delete Account
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
