import { NextRequest } from "next/server";
import { ZodError } from "zod";
import { prisma } from "@/lib/db";
import { VerifyEduSchema } from "@/lib/schemas";
import { ok, err, zodErr } from "@/lib/api";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = VerifyEduSchema.safeParse(body);
    if (!parsed.success) {
      return zodErr(parsed.error as ZodError);
    }
    const { email, campus } = parsed.data;

    if (!email.toLowerCase().endsWith(".edu")) {
      return err("Email must end with .edu", 400);
    }

    const user = await prisma.user.upsert({
      where: { email },
      create: {
        email,
        campus,
        verified: true,
      },
      update: {
        campus,
        verified: true,
      },
    });

    await prisma.activity.create({
      data: {
        type: "user_joined",
        payload: { userId: user.id, email, campus },
      },
    });

    return ok({ userId: user.id, verified: true });
  } catch (e) {
    if (e instanceof ZodError) return zodErr(e);
    return err("Internal error", 500);
  }
}
