import { NextRequest } from "next/server";
import { ZodError } from "zod";
import { prisma } from "@/lib/db";
import { SparkCommitSchema } from "@/lib/schemas";
import { ok, err, zodErr } from "@/lib/api";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sparkId = params.id;

    const body = await req.json();
    const parsed = SparkCommitSchema.safeParse(body);
    if (!parsed.success) {
      return zodErr(parsed.error as ZodError);
    }
    const { userId, note } = parsed.data;

    await prisma.$transaction(async (tx) => {
      await tx.sparkCommitment.create({
        data: {
          sparkId,
          userId,
          note,
        },
      });

      await tx.activity.create({
        data: {
          type: "spark_committed",
          payload: { sparkId, userId },
        },
      });
    });

    return ok({ committed: true, sparkId });
  } catch (e) {
    if (e instanceof ZodError) return zodErr(e);
    return err("Internal error", 500);
  }
}
