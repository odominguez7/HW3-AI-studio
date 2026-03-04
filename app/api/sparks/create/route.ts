import { NextRequest } from "next/server";
import { ZodError } from "zod";
import { prisma } from "@/lib/db";
import { SparkCreateSchema } from "@/lib/schemas";
import { ok, err, zodErr } from "@/lib/api";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = SparkCreateSchema.safeParse(body);
    if (!parsed.success) {
      return zodErr(parsed.error as ZodError);
    }
    const data = parsed.data;

    const spark = await prisma.$transaction(async (tx) => {
      const created = await tx.spark.create({
        data: {
          creatorId: data.creatorId,
          sparkType: data.sparkType,
          locationHint: data.locationHint,
          durationMinutes: data.durationMinutes,
          startsAt: new Date(data.startsAt),
          visibility: data.visibility,
        },
      });

      await tx.activity.create({
        data: {
          type: "spark_created",
          payload: { sparkId: created.id, sparkType: data.sparkType },
        },
      });

      return created;
    });

    return ok(spark);
  } catch (e) {
    if (e instanceof ZodError) return zodErr(e);
    return err("Internal error", 500);
  }
}
