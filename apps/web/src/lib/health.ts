const API_URL = process.env.API_URL ?? "http://127.0.0.1:8000";

export type HealthStatus = { ok: true; status: string } | { ok: false; error: string };

export async function getHealth(): Promise<HealthStatus> {
  try {
    const res = await fetch(`${API_URL}/health`, { cache: "no-store" });
    if (!res.ok) return { ok: false, error: `HTTP ${res.status}` };
    const body: { status: string } = await res.json();
    return { ok: true, status: body.status };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}
