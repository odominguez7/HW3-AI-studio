export type OceanProfile = {
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
};

/**
 * Cosine similarity between two OCEAN vectors. Returns 0–1.
 */
export function affinityScore(a: OceanProfile, b: OceanProfile): number {
  const keys: (keyof OceanProfile)[] = [
    "openness",
    "conscientiousness",
    "extraversion",
    "agreeableness",
    "neuroticism",
  ];
  let dot = 0;
  let magA = 0;
  let magB = 0;
  for (const k of keys) {
    dot += a[k] * b[k];
    magA += a[k] * a[k];
    magB += b[k] * b[k];
  }
  const denom = Math.sqrt(magA) * Math.sqrt(magB);
  return denom === 0 ? 0 : dot / denom;
}

/**
 * Convert 10-question 1-5 scale answers into OCEAN 0–1 profile.
 * Questions map: 1-2 Openness, 3-4 Extraversion, 5-6 Conscientiousness,
 * 7-8 Agreeableness, 9-10 (reversed) Neuroticism.
 */
export function vibeCheckToOcean(answers: number[]): OceanProfile {
  if (answers.length !== 10) throw new Error("Expected 10 answers");
  const norm = (v: number) => (v - 1) / 4;
  return {
    openness: (norm(answers[0]) + norm(answers[1])) / 2,
    extraversion: (norm(answers[2]) + norm(answers[3])) / 2,
    conscientiousness: (norm(answers[4]) + norm(answers[5])) / 2,
    agreeableness: (norm(answers[6]) + norm(answers[7])) / 2,
    neuroticism: 1 - (norm(answers[8]) + norm(answers[9])) / 2,
  };
}

export const SPARK_TYPE_LABELS: Record<string, { label: string; emoji: string }> = {
  study_sync: { label: "Study Sync", emoji: "📚" },
  coffee_clash: { label: "Coffee Clash", emoji: "☕" },
  lunch_link: { label: "Lunch Link", emoji: "🍜" },
  walk_wave: { label: "Walk Wave", emoji: "🚶" },
  homework_hack: { label: "Homework Hack", emoji: "🧩" },
  recess_rush: { label: "Recess Rush", emoji: "⚡" },
  blitz_brainstorm: { label: "Blitz Brainstorm", emoji: "🧠" },
};
