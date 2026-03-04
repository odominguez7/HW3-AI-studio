import { NextRequest } from "next/server";
import { ZodError } from "zod";
import { prisma } from "@/lib/db";
import { SparkFeedbackSchema } from "@/lib/schemas";
import { ok, err, zodErr } from "@/lib/api";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sparkId = params.id;

    const body = await req.json();
    const parsed = SparkFeedbackSchema.safeParse(body);
    if (!parsed.success) {
      return zodErr(parsed.error as ZodError);
    }
    const { userId, rating, repeatInterest, whatWorked } = parsed.data;

    await prisma.$transaction(async (tx) => {
      await tx.sparkFeedback.create({
        data: {
          sparkId,
          userId,
          rating,
          repeatInterest,
          whatWorked,
        },
      });

      await tx.activity.create({
        data: {
          type: "feedback_given",
          payload: { sparkId, userId },
        },
      });
    });

    return ok({ recorded: true });
  } catch (e) {
    if (e instanceof ZodError) return zodErr(e);
    return err("Internal error", 500);
  }
}
