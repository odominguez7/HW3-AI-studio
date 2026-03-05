import { NextRequest } from "next/server";
import { err, ok } from "@/lib/api";
import { getAgentById } from "@/lib/agents-store";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const agent = await getAgentById(params.id);
    if (!agent) return err("agent_not_found", 404);
    return ok({
      id: agent.id,
      name: agent.name,
      capabilities: agent.capabilities,
      endpoint: agent.endpoint,
      contact_email: agent.contactEmail ?? null,
      agent_type: agent.agentType,
      status: agent.status,
      last_seen: agent.lastSeen,
      sessions_today: agent.sessionsToday,
      total_sessions: agent.totalSessions,
      reports: agent.reports,
      created_at: agent.createdAt,
    });
  } catch {
    return err("Internal error", 500);
  }
}
