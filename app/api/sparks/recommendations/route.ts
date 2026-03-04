import { NextRequest } from "next/server";
import { ZodError } from "zod";
import { prisma } from "@/lib/db";
import { ok, err, zodErr } from "@/lib/api";
import { affinityScore } from "@/lib/affinity";
import type { OceanProfile } from "@/lib/affinity";

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("userId");

    if (!userId) {
      const sparks = await prisma.spark.findMany({
        where: { status: "open" },
        include: { creator: true },
      });
      return ok({
        sparks: sparks.map((s) => ({ ...s, matchScore: null })),
      });
    }

    const userProfile = await prisma.affinityProfile.findUnique({
      where: { userId },
    });

    if (!userProfile) {
      const sparks = await prisma.spark.findMany({
        where: { status: "open" },
        include: { creator: true },
      });
      return ok({
        sparks: sparks.map((s) => ({ ...s, matchScore: null })),
      });
    }

    const userOcean: OceanProfile = {
      openness: userProfile.openness,
      conscientiousness: userProfile.conscientiousness,
      extraversion: userProfile.extraversion,
      agreeableness: userProfile.agreeableness,
      neuroticism: userProfile.neuroticism,
    };

    const openSparks = await prisma.spark.findMany({
      where: {
        status: "open",
        creator: {
          affinityProfile: { isNot: null },
        },
      },
      include: {
        creator: {
          include: { affinityProfile: true },
        },
      },
    });

    const scored = openSparks
      .filter((s) => s.creator.affinityProfile)
      .map((spark) => {
        const creatorOcean = spark.creator.affinityProfile!;
        const ocean: OceanProfile = {
          openness: creatorOcean.openness,
          conscientiousness: creatorOcean.conscientiousness,
          extraversion: creatorOcean.extraversion,
          agreeableness: creatorOcean.agreeableness,
          neuroticism: creatorOcean.neuroticism,
        };
        const score = affinityScore(userOcean, ocean);
        const matchScore = Math.round(score * 100);
        return { ...spark, matchScore };
      })
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 20);

    return ok({ sparks: scored });
  } catch (e) {
    if (e instanceof ZodError) return zodErr(e);
    return err("Internal error", 500);
  }
}
