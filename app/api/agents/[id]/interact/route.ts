import { NextRequest } from "next/server";
import { ZodError } from "zod";
import { err, ok, zodErr } from "@/lib/api";
import { AgentInteractSchema } from "@/lib/schemas";
import { interactWithAgent } from "@/lib/agents-store";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const parsed = AgentInteractSchema.safeParse(body);
    if (!parsed.success) return zodErr(parsed.error as ZodError);

    const result = await interactWithAgent({
      id: params.id,
      body: parsed.data,
      idempotencyKey: req.headers.get("x-idempotency-key") ?? undefined,
    });

    if ("error" in result) {
      if (result.error === "agent_not_found") return err("agent_not_found", 404);
      if (result.error === "agent_paused") return err("agent_paused", 403);
      if (result.error === "rate_limit_exceeded")
        return ok({ error: "rate_limit_exceeded", retry_after: 60 }, 429);
      return err("agent_unreachable", 502);
    }

    if ("cached" in result && result.cached) {
      return ok(result.data);
    }
    return ok(result.data);
  } catch (e) {
    if (e instanceof ZodError) return zodErr(e);
    return err("Internal error", 500);
  }
}
