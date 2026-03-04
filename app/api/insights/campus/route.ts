import { NextRequest } from "next/server";
import { ZodError } from "zod";
import { prisma } from "@/lib/db";
import { ok, err, zodErr } from "@/lib/api";

export async function GET(req: NextRequest) {
  try {
    const [totalSparks, totalCommitments, totalFeedbacks, avgRatingResult, locationGroups, sparkTypeGroups, commitmentByUser] =
      await Promise.all([
        prisma.spark.count(),
        prisma.sparkCommitment.count(),
        prisma.sparkFeedback.count(),
        prisma.sparkFeedback.aggregate({
          _avg: { rating: true },
        }),
        prisma.spark.groupBy({
          by: ["locationHint"],
          _count: { locationHint: true },
        }),
        prisma.spark.groupBy({
          by: ["sparkType"],
          _count: { sparkType: true },
        }),
        prisma.sparkCommitment.groupBy({
          by: ["userId"],
          _count: { userId: true },
        }),
      ]);

    const avgRating = avgRatingResult._avg.rating ?? 0;

    const totalUsersWithCommitment = commitmentByUser.length;
    const usersWithRepeatMeet = commitmentByUser.filter(
      (u) => u._count.userId >= 2
    ).length;
    const repeatMeetRate =
      totalUsersWithCommitment > 0
        ? usersWithRepeatMeet / totalUsersWithCommitment
        : 0;

    const topLocations = locationGroups
      .sort((a, b) => b._count.locationHint - a._count.locationHint)
      .slice(0, 5)
      .map((g) => g.locationHint);

    const topSparkTypes = sparkTypeGroups
      .sort((a, b) => b._count.sparkType - a._count.sparkType)
      .slice(0, 5)
      .map((g) => g.sparkType);

    return ok({
      totalSparks,
      totalCommitments,
      totalFeedbacks,
      avgRating,
      repeatMeetRate,
      topLocations,
      topSparkTypes,
      generatedAt: new Date().toISOString(),
    });
  } catch (e) {
    if (e instanceof ZodError) return zodErr(e);
    return err("Internal error", 500);
  }
}
