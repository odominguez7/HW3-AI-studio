import { NextRequest } from "next/server";
import { ZodError } from "zod";
import { err, ok, zodErr } from "@/lib/api";
import { AgentReportSchema } from "@/lib/schemas";
import { reportAgent } from "@/lib/agents-store";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const parsed = AgentReportSchema.safeParse(body);
    if (!parsed.success) return zodErr(parsed.error as ZodError);

    const report = await reportAgent(params.id, parsed.data);
    if (!report) return err("agent_not_found", 404);
    return ok({ reported: true, reportId: report.id, timestamp: report.timestamp });
  } catch (e) {
    if (e instanceof ZodError) return zodErr(e);
    return err("Internal error", 500);
  }
}
