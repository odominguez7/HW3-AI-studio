import { NextRequest } from "next/server";
import { ZodError } from "zod";
import { ok, err, zodErr } from "@/lib/api";
import { AgentRegisterSchema } from "@/lib/schemas";
import { registerAgent } from "@/lib/agents-store";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = AgentRegisterSchema.safeParse(body);
    if (!parsed.success) return zodErr(parsed.error as ZodError);

    const data = parsed.data;
    const agent = await registerAgent({
      name: data.name,
      capabilities: data.capabilities,
      endpoint: data.endpoint,
      contactEmail: data.contact_email || undefined,
      agentType: data.agent_type,
    });

    return ok({
      id: agent.id,
      name: agent.name,
      agent_type: agent.agentType,
      status: agent.status,
      endpoint: agent.endpoint,
      capabilities: agent.capabilities,
      contact_email: agent.contactEmail ?? null,
      agent_token: agent.agentToken,
      created_at: agent.createdAt,
    }, 201);
  } catch (e) {
    if (e instanceof ZodError) return zodErr(e);
    return err("Internal error", 500);
  }
}
