import Link from "next/link";
import { Suspense } from "react";

import { ApiHealth } from "@/components/api-health";
import { TopicTree } from "@/components/topic-tree";
import { api } from "@/lib/api";

export async function Sidebar() {
  const [topics, clusters] = await Promise.all([api.listTopics(), api.listClusters()]);
  const titleOf = (id: string) => topics.find((t) => t.id === id)?.title ?? id;
  return (
    <aside className="flex shrink-0 flex-col gap-6 border-b border-rule bg-surface px-4 py-5 md:sticky md:top-0 md:h-screen md:w-64 md:border-r md:border-b-0 md:px-5 md:py-8">
      <Link href="/" className="font-serif text-xl font-semibold tracking-tight text-ink">
        ai-tutor
      </Link>
      <nav className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto">
        <Link href="/" className="text-sm font-semibold text-ink hover:text-pen">
          Today
        </Link>
        {clusters.some((c) => c.topicIds.length > 0) && (
          <div className="flex flex-col gap-2">
            <h2 className="text-sm text-muted">Hashtags</h2>
            <ul className="flex flex-col gap-0.5">
              {clusters
                .filter((c) => c.topicIds.length > 0)
                .map((c) => (
                  <li key={c.id}>
                    <details className="group">
                      <summary className="flex cursor-pointer list-none items-center gap-1 rounded px-1 py-0.5 text-sm text-ink hover:text-pen">
                        <svg viewBox="0 0 10 10" className="size-2.5 text-muted group-open:rotate-90">
                          <path d="M3 1.5 7 5 3 8.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
                        </svg>
                        #{c.name}
                        <span className="text-muted">{c.topicIds.length}</span>
                      </summary>
                      <ul className="ml-2.5 flex flex-col gap-0.5 border-l border-rule py-1 pl-3 text-sm">
                        {c.topicIds.map((id) => (
                          <li key={id}>
                            <Link href={`/topics/${id}`} className="hover:text-pen">
                              {titleOf(id)}
                            </Link>
                          </li>
                        ))}
                        <li>
                          <Link href={`/clusters/${c.id}`} className="text-pen hover:underline">
                            Review this hashtag
                          </Link>
                        </li>
                      </ul>
                    </details>
                  </li>
                ))}
            </ul>
          </div>
        )}
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
