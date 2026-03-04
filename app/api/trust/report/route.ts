import { NextRequest } from "next/server";
import { ZodError } from "zod";
import { prisma } from "@/lib/db";
import { TrustReportSchema } from "@/lib/schemas";
import { ok, err, zodErr } from "@/lib/api";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = TrustReportSchema.safeParse(body);
    if (!parsed.success) {
      return zodErr(parsed.error as ZodError);
    }
    const data = parsed.data;

    const report = await prisma.$transaction(async (tx) => {
      const created = await tx.trustReport.create({
        data: {
          reporterId: data.reporterId,
          targetUserId: data.targetUserId,
          sparkId: data.sparkId,
          reason: data.reason,
          details: data.details,
        },
      });

      await tx.activity.create({
        data: {
          type: "trust_report",
          payload: {
            reportId: created.id,
            reporterId: data.reporterId,
            targetUserId: data.targetUserId,
          },
        },
      });

      return created;
    });

    return ok({ reported: true, reportId: report.id });
  } catch (e) {
    if (e instanceof ZodError) return zodErr(e);
    return err("Internal error", 500);
  }
}
