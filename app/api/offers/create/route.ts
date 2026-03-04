import { NextRequest } from "next/server";
import { ZodError } from "zod";
import { prisma } from "@/lib/db";
import { OfferCreateSchema } from "@/lib/schemas";
import { ok, err, zodErr } from "@/lib/api";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = OfferCreateSchema.safeParse(body);
    if (!parsed.success) {
      return zodErr(parsed.error as ZodError);
    }
    const data = parsed.data;

    const offer = await prisma.$transaction(async (tx) => {
      const created = await tx.offer.create({
        data: {
          userId: data.userId,
          want: data.want,
          offer: data.offer,
          preferredDurationMinutes: data.preferredDurationMinutes,
        },
      });

      await tx.activity.create({
        data: {
          type: "offer_posted",
          payload: { offerId: created.id, userId: data.userId },
        },
      });

      return created;
    });

    return ok(offer);
  } catch (e) {
    if (e instanceof ZodError) return zodErr(e);
    return err("Internal error", 500);
  }
}

export async function GET(req: NextRequest) {
  try {
    const offers = await prisma.offer.findMany({
      where: { fulfilled: false },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        user: {
          select: { email: true },
        },
      },
    });

    return ok(offers);
  } catch (e) {
    if (e instanceof ZodError) return zodErr(e);
    return err("Internal error", 500);
  }
}
