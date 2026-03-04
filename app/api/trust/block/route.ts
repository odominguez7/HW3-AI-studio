import { NextRequest } from "next/server";
import { ZodError } from "zod";
import { prisma } from "@/lib/db";
import { TrustBlockSchema } from "@/lib/schemas";
import { ok, err, zodErr } from "@/lib/api";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = TrustBlockSchema.safeParse(body);
    if (!parsed.success) {
      return zodErr(parsed.error as ZodError);
    }
    const { requesterId, blockedUserId } = parsed.data;

    await prisma.block.upsert({
      where: {
        requesterId_blockedUserId: { requesterId, blockedUserId },
      },
      create: {
        requesterId,
        blockedUserId,
      },
      update: {},
    });

    return ok({ blocked: true });
  } catch (e) {
    if (e instanceof ZodError) return zodErr(e);
    return err("Internal error", 500);
  }
}
