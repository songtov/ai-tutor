import { getHealth } from "@/lib/health";

export async function ApiHealth() {
  const health = await getHealth();
  return (
    <p className="flex items-center gap-2 text-xs text-muted">
      <span
        aria-hidden
        className={`size-2 rounded-full ${health.ok ? "bg-emerald-500" : "bg-red-500"}`}
      />
      {health.ok ? "API connected" : "API unreachable"}
    </p>
  );
}
