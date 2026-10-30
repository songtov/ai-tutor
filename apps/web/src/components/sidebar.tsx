import Link from "next/link";
import { Suspense } from "react";

import { ApiHealth } from "@/components/api-health";
import { SidebarShell } from "@/components/sidebar-shell";
import { TopicList } from "@/components/topic-list";
import { api } from "@/lib/api";
import { sortByTitle } from "@/lib/topics";

export async function Sidebar() {
  const [topics, hashtags, due] = await Promise.all([api.listTopics(), api.listHashtags(), api.listDueReviews()]);
  const titleOf = (id: string) => topics.find((t) => t.id === id)?.title ?? id;
  return (
    <SidebarShell>
      <nav className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto">
        <div className="flex flex-col gap-1 text-sm font-semibold">
          <Link href="/" className="text-ink hover:text-pen">
            Home
          </Link>
          <Link href="/review" className="flex items-center justify-between text-ink hover:text-pen">
            Review
            {due.length > 0 && (
              <span className="rounded-full bg-highlight px-2 text-xs text-on-highlight">{due.length}</span>
            )}
          </Link>
          <Link href="/graph" className="text-ink hover:text-pen">
            Graph
          </Link>
        </div>
        {hashtags.length > 0 && (
          <div className="flex flex-col gap-2">
            <h2 className="text-sm text-muted">Hashtags</h2>
            <ul className="flex flex-col gap-0.5">
              {hashtags.map((h) => (
                <li key={h.name}>
                  <details className="group">
                    <summary className="flex cursor-pointer list-none items-center gap-1 rounded px-1 py-0.5 text-sm text-ink hover:text-pen">
                      <svg viewBox="0 0 10 10" className="size-2.5 text-muted group-open:rotate-90">
                        <path d="M3 1.5 7 5 3 8.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
                      </svg>
                      #{h.name}
                      <span className="text-muted">{h.topicIds.length}</span>
                    </summary>
                    <ul className="ml-2.5 flex flex-col gap-0.5 border-l border-rule py-1 pl-3 text-sm">
                      {h.topicIds.map((id) => (
                        <li key={id}>
                          <Link href={`/notes/${id}`} className="hover:text-pen">
                            {titleOf(id)}
                          </Link>
                        </li>
                      ))}
                      <li>
                        <Link href={`/tags/${h.name}`} className="text-pen hover:underline">
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
          <h2 className="text-sm text-muted">All notes</h2>
          <TopicList topics={sortByTitle(topics)} />
        </div>
      </nav>
      <Suspense fallback={<p className="text-xs text-muted">Checking API…</p>}>
        <ApiHealth />
      </Suspense>
    </SidebarShell>
  );
}
