import { Suspense } from "react";

import { getHealth } from "@/lib/health";

async function ApiHealth() {
  const health = await getHealth();
  return health.ok ? (
    <p className="text-green-700 dark:text-green-400">API: {health.status}</p>
  ) : (
    <p className="text-red-700 dark:text-red-400">API unreachable: {health.error}</p>
  );
}

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-6 py-24">
      <h1 className="text-3xl font-semibold tracking-tight">ai-tutor</h1>
      <Suspense fallback={<p className="text-zinc-500">Checking API…</p>}>
        <ApiHealth />
      </Suspense>
    </main>
  );
}
