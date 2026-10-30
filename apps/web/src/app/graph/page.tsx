import Link from "next/link";

import { GraphView, type GraphEdge, type GraphNode } from "@/components/graph-view";
import { StartNote } from "@/components/start-note";
import { api } from "@/lib/api";
import { bodyOf, parseLinks, parseTags } from "@/lib/notes";
import { sortByTitle } from "@/lib/topics";

export default async function GraphPage() {
  const [topics, hashtags, due] = await Promise.all([api.listTopics(), api.listHashtags(), api.listDueReviews()]);
  const idByTitle = new Map(topics.map((t) => [t.title.toLowerCase(), t.id]));
  const dueIds = new Set(due.map((d) => d.topicId));

  const nodes: GraphNode[] = topics.map((t) => ({
    id: t.id,
    title: t.title,
    noteId: t.id,
    tag: parseTags(bodyOf(t.blocks))[0] ?? null,
    due: dueIds.has(t.id),
  }));
  const edges: GraphEdge[] = [];
  for (const t of topics) {
    for (const title of parseLinks(bodyOf(t.blocks))) {
      let target = idByTitle.get(title.toLowerCase());
      if (!target) {
        target = `ghost:${title.toLowerCase()}`;
        if (!nodes.some((n) => n.id === target)) nodes.push({ id: target, title, noteId: null, tag: null, due: false });
      }
      const [a, b] = [t.id, target].sort();
      if (a !== b && !edges.some(([x, y]) => x === a && y === b)) edges.push([a, b]);
    }
  }

  return (
    <div className="flex h-[calc(100dvh-8rem)] min-h-[28rem] flex-col gap-4 md:h-[calc(100dvh-6rem)]">
      <header className="flex flex-wrap items-center gap-3">
        <h1 className="sr-only">Graph</h1>
        <div className="min-w-0 flex-1">
          <StartNote topics={sortByTitle(topics)} />
        </div>
        {due.length > 0 && (
          <Link href="/review" className="rounded-md bg-pen px-4 py-2 text-sm font-semibold text-surface hover:opacity-90">
            Review {due.length} due
          </Link>
        )}
      </header>
      <div className="min-h-0 flex-1 overflow-hidden rounded-lg border border-rule bg-surface">
        <GraphView nodes={nodes} edges={edges} tags={hashtags.map((h) => h.name)} />
      </div>
    </div>
  );
}
