import { NextRequest } from "next/server";
import { ZodError } from "zod";
import { err, ok, zodErr } from "@/lib/api";
import { AgentStatusSchema } from "@/lib/schemas";
import { updateAgentStatus } from "@/lib/agents-store";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const parsed = AgentStatusSchema.safeParse(body);
    if (!parsed.success) return zodErr(parsed.error as ZodError);
    const updated = await updateAgentStatus(params.id, parsed.data.status);
    if (!updated) return err("agent_not_found", 404);
    return ok({ id: updated.id, status: updated.status });
  } catch (e) {
    if (e instanceof ZodError) return zodErr(e);
    return err("Internal error", 500);
  }
}
