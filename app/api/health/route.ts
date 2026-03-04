import { ok, err } from "@/lib/api";

export async function GET() {
  try {
    return ok({
      status: "ok",
      app: "serendipity",
      timestamp: new Date().toISOString(),
    });
  } catch {
    return err("Internal error", 500);
  }
}
