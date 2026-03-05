import { NextRequest } from "next/server";
import { err, ok } from "@/lib/api";
import { listActivity } from "@/lib/agents-store";

export async function GET(req: NextRequest) {
  try {
    const limit = Number(req.nextUrl.searchParams.get("limit") ?? "100");
    const offset = Number(req.nextUrl.searchParams.get("offset") ?? "0");
    const activity = await listActivity(limit, offset);
    return ok({ activity, limit, offset });
  } catch {
    return err("Internal error", 500);
  }
}
