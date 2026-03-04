import { NextRequest } from "next/server";
import { ZodError } from "zod";
import { prisma } from "@/lib/db";
import { AffinityProfileSchema } from "@/lib/schemas";
import { ok, err, zodErr } from "@/lib/api";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = AffinityProfileSchema.safeParse(body);
    if (!parsed.success) {
      return zodErr(parsed.error as ZodError);
    }
    const {
      userId,
      openness,
      conscientiousness,
      extraversion,
      agreeableness,
      neuroticism,
    } = parsed.data;

    const profile = await prisma.affinityProfile.upsert({
      where: { userId },
      create: {
        userId,
        openness,
        conscientiousness,
        extraversion,
        agreeableness,
        neuroticism,
      },
      update: {
        openness,
        conscientiousness,
        extraversion,
        agreeableness,
        neuroticism,
      },
    });

    return ok({ profileId: profile.id, affinityScore: "recorded" });
  } catch (e) {
    if (e instanceof ZodError) return zodErr(e);
    return err("Internal error", 500);
  }
}
