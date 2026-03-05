import { err, ok } from "@/lib/api";
import { listAgents } from "@/lib/agents-store";

export async function GET() {
  try {
    const agents = await listAgents();
    return ok({
      agents: agents.map((a) => ({
        id: a.id,
        name: a.name,
        capabilities: a.capabilities,
        endpoint: a.endpoint,
        contact_email: a.contactEmail ?? null,
        agent_type: a.agentType,
        status: a.status,
        last_seen: a.lastSeen,
        sessions_today: a.sessionsToday,
        total_sessions: a.totalSessions,
        reports_count: a.reports.length,
        created_at: a.createdAt,
      })),
    });
  } catch {
    return err("Internal error", 500);
  }
}
