"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const QUESTIONS = [
  "I love exploring wild, out-there ideas",
  "New experiences > routine",
  "I get energy from people",
  "Big groups sound fun",
  "I always deliver on promises",
  "Organization = winning",
  "Others' feelings guide me",
  "Team wins > solo wins",
  "I stay chill under pressure",
  "Drama drains me",
];

const SCALE_LABELS = [
  "Not me",
  "A little",
  "Somewhat",
  "Mostly me",
  "So me",
];

interface VibeCheckProps {
  onComplete: (answers: number[]) => void;
}

export function VibeCheck({ onComplete }: VibeCheckProps) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);

  const currentQuestion = QUESTIONS[step];
  const totalQuestions = QUESTIONS.length;
  const progress = ((step + (answers.length > step ? 1 : 0)) / totalQuestions) * 100;

  const handleSelect = (value: number) => {
    const newAnswers = [...answers];
    newAnswers[step] = value;
    setAnswers(newAnswers);

    if (step === totalQuestions - 1) {
      onComplete(newAnswers);
    } else {
      setStep(step + 1);
    }
  };

  return (
    <div className="glass mx-auto max-w-xl p-6 md:p-8">
      <div className="mb-8">
        <div className="mb-2 flex justify-between font-body text-sm text-night-400">
          <span>Question {step + 1} of {totalQuestions}</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-night-800">
          <motion.div
            className="h-full rounded-full bg-spark-500"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          <h3 className="mb-6 font-display text-xl font-semibold text-night-100 md:text-2xl">
            {currentQuestion}
          </h3>
          <div className="flex flex-col gap-3">
            {SCALE_LABELS.map((label, index) => {
              const value = index + 1;
              const isSelected = answers[step] === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => handleSelect(value)}
                  className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left font-body transition-all ${
                    isSelected
                      ? "border-spark-500 bg-spark-500/20 text-spark-400"
                      : "border-white/10 bg-white/5 text-night-200 hover:border-white/20 hover:bg-white/10"
                  }`}
                >
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${
                      isSelected
                        ? "border-spark-500 bg-spark-500 text-night-950"
                        : "border-night-500"
                    }`}
                  >
                    {isSelected && (
                      <svg
                        className="h-4 w-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </span>
                  <span>{label}</span>
                </button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
