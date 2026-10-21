import Link from "next/link";
import { Suspense } from "react";

import { ApiHealth } from "@/components/api-health";
import { TopicTree } from "@/components/topic-tree";
import { api } from "@/lib/api";

export async function Sidebar() {
  const topics = await api.listTopics();
  return (
    <aside className="flex shrink-0 flex-col gap-6 border-b border-rule bg-surface px-4 py-5 md:sticky md:top-0 md:h-screen md:w-64 md:border-r md:border-b-0 md:px-5 md:py-8">
      <Link href="/" className="font-serif text-xl font-semibold tracking-tight text-ink">
        ai-tutor
      </Link>
      <nav className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto">
        <Link href="/" className="text-sm font-semibold text-ink hover:text-pen">
          Today
        </Link>
        <div className="flex flex-col gap-2">
          <h2 className="text-sm text-muted">Topics</h2>
          <TopicTree topics={topics} />
        </div>
      </nav>
      <Suspense fallback={<p className="text-xs text-muted">Checking API…</p>}>
        <ApiHealth />
      </Suspense>
    </aside>
  );
}
