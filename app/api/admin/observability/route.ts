import { err, ok } from "@/lib/api";
import { observabilitySummary } from "@/lib/agents-store";

export async function GET() {
  try {
    const metrics = await observabilitySummary();
    return ok(metrics);
  } catch {
    return err("Internal error", 500);
  }
}
