import { NextRequest } from "next/server";
import { ZodError } from "zod";
import { prisma } from "@/lib/db";
import { OnboardSchema } from "@/lib/schemas";
import { ok, err, zodErr } from "@/lib/api";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = OnboardSchema.safeParse(body);
    if (!parsed.success) {
      return zodErr(parsed.error as ZodError);
    }
    const { userId, automationMode, availabilityModes, calendarConnected } =
      parsed.data;

    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: {
          automationMode,
          calendarLinked: calendarConnected,
        },
      }),
      prisma.userAvailMode.deleteMany({ where: { userId } }),
      prisma.userAvailMode.createMany({
        data: availabilityModes.map((mode) => ({ userId, mode })),
      }),
    ]);

    return ok({ success: true });
  } catch (e) {
    if (e instanceof ZodError) return zodErr(e);
    return err("Internal error", 500);
  }
}
