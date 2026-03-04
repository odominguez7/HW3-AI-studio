import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const PERSONAS = [
  {
    email: "maya@sloan.mit.edu",
    campus: "mit" as const,
    ocean: { openness: 0.9, conscientiousness: 0.85, extraversion: 0.6, agreeableness: 0.55, neuroticism: 0.3 },
    modes: ["founder_mode" as const, "casual" as const],
  },
  {
    email: "leo@csail.mit.edu",
    campus: "mit" as const,
    ocean: { openness: 0.9, conscientiousness: 0.85, extraversion: 0.25, agreeableness: 0.5, neuroticism: 0.35 },
    modes: ["study_only" as const],
  },
  {
    email: "ananya@mit.edu",
    campus: "mit" as const,
    ocean: { openness: 0.85, conscientiousness: 0.8, extraversion: 0.55, agreeableness: 0.85, neuroticism: 0.25 },
    modes: ["study_only" as const, "casual" as const],
  },
  {
    email: "sam@mit.edu",
    campus: "mit" as const,
    ocean: { openness: 0.65, conscientiousness: 0.5, extraversion: 0.8, agreeableness: 0.8, neuroticism: 0.4 },
    modes: ["casual" as const],
  },
  {
    email: "noah@media.mit.edu",
    campus: "mit" as const,
    ocean: { openness: 0.95, conscientiousness: 0.5, extraversion: 0.65, agreeableness: 0.6, neuroticism: 0.3 },
    modes: ["casual" as const, "founder_mode" as const],
  },
  {
    email: "leila@mit.edu",
    campus: "mit" as const,
    ocean: { openness: 0.65, conscientiousness: 0.8, extraversion: 0.35, agreeableness: 0.9, neuroticism: 0.2 },
    modes: ["zen_only" as const],
  },
  {
    email: "ethan@harvard.edu",
    campus: "harvard" as const,
    ocean: { openness: 0.85, conscientiousness: 0.5, extraversion: 0.8, agreeableness: 0.55, neuroticism: 0.45 },
    modes: ["casual" as const, "founder_mode" as const],
  },
];

const SPARKS = [
  { type: "study_sync" as const, location: "Stata Center, Room 32-G449", duration: 60, hoursFromNow: 2 },
  { type: "coffee_clash" as const, location: "Lobby 13 Cafe", duration: 45, hoursFromNow: 4 },
  { type: "walk_wave" as const, location: "Charles River Path", duration: 30, hoursFromNow: 6 },
  { type: "blitz_brainstorm" as const, location: "Media Lab, E14", duration: 90, hoursFromNow: 8 },
  { type: "lunch_link" as const, location: "Kendall Food Trucks", duration: 45, hoursFromNow: 24 },
  { type: "homework_hack" as const, location: "Barker Library", duration: 60, hoursFromNow: 26 },
  { type: "recess_rush" as const, location: "Z Center Courts", duration: 45, hoursFromNow: 28 },
  { type: "coffee_clash" as const, location: "Anna's Taqueria, Cambridge", duration: 30, hoursFromNow: 30 },
];

const OFFERS = [
  { want: "GTM feedback for robotics startup", offer: "Coffee + pitch deck review" },
  { want: "Diffusion models explained simply", offer: "30min system design critique" },
  { want: "Meditation session for lab burnout", offer: "Pizza for your time" },
  { want: "React performance optimization help", offer: "Figma mockups for your project" },
  { want: "Intro to VC fundraising process", offer: "Help debug your ML pipeline" },
];

async function main() {
  console.log("Seeding Serendipity database...");

  const users = [];
  for (const p of PERSONAS) {
    const user = await prisma.user.upsert({
      where: { email: p.email },
      update: {},
      create: {
        email: p.email,
        campus: p.campus,
        verified: true,
        automationMode: "assisted",
        calendarLinked: false,
      },
    });

    await prisma.affinityProfile.upsert({
      where: { userId: user.id },
      update: p.ocean,
      create: { userId: user.id, ...p.ocean },
    });

    for (const mode of p.modes) {
      await prisma.userAvailMode.upsert({
        where: { userId_mode: { userId: user.id, mode } },
        update: {},
        create: { userId: user.id, mode },
      });
    }

    users.push(user);
    console.log("  Done: " + p.email);
  }

  for (let i = 0; i < SPARKS.length; i++) {
    const s = SPARKS[i];
    const creator = users[i % users.length];
    const startsAt = new Date(Date.now() + s.hoursFromNow * 3600000);

    await prisma.spark.create({
      data: {
        creatorId: creator.id,
        sparkType: s.type,
        locationHint: s.location,
        durationMinutes: s.duration,
        startsAt,
        visibility: "public",
        status: "open",
      },
    });
    console.log("  Done: Spark " + s.type + " at " + s.location);
  }

  for (let i = 0; i < OFFERS.length; i++) {
    const user = users[i % users.length];
    await prisma.offer.create({
      data: {
        userId: user.id,
        want: OFFERS[i].want,
        offer: OFFERS[i].offer,
      },
    });
    console.log("  Done: Offer - " + OFFERS[i].want);
  }

  await prisma.activity.createMany({
    data: users.map((u) => ({
      type: "user_joined" as const,
      payload: { userId: u.id, email: u.email },
    })),
  });

  console.log("\nSeed complete. 7 users, 8 sparks, 5 offers, 7 activities.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
