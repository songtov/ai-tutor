import Link from "next/link";
import { notFound } from "next/navigation";

import { startCycle } from "@/app/actions";
import { api } from "@/lib/api";
import { dueLabel } from "@/lib/format";
import { pathLabel } from "@/lib/topics";

export default async function ClusterPage(props: PageProps<"/clusters/[id]">) {
  const { id } = await props.params;
  const cluster = await api.getCluster(id);
  if (!cluster) notFound();

  const topics = await api.listTopics();
  const rows = await Promise.all(
    cluster.topicIds.map(async (topicId) => ({
      topic: topics.find((t) => t.id === topicId)!,
      review: await api.getReviewSchedule(topicId),
    })),
  );
  // Most overdue first; topics never reviewed go last.
  rows.sort((a, b) => (a.review?.dueAt ?? "￿").localeCompare(b.review?.dueAt ?? "￿"));
  const now = new Date();
  const due = rows.filter((r) => r.review && new Date(r.review.dueAt) <= now).length;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8">
      <header className="flex flex-col gap-1">
        <h1 className="font-serif text-4xl font-semibold tracking-tight">#{cluster.name}</h1>
        <p className="text-muted">
          {rows.length} {rows.length === 1 ? "topic" : "topics"}, {due} due for review
        </p>
      </header>

      {rows.length === 0 ? (
        <p className="text-muted">No topics have this hashtag. Add it from a topic page.</p>
      ) : (
        <ul className="divide-y divide-rule border-y border-rule">
          {rows.map(({ topic, review }) => {
            const isDue = review && new Date(review.dueAt) <= now;
            return (
              <li key={topic.id} className="flex flex-wrap items-center gap-x-6 gap-y-2 py-4">
                <div className="flex min-w-0 flex-1 flex-col">
                  <Link href={`/topics/${topic.id}`} className="font-serif text-xl font-medium hover:text-pen">
                    {topic.title}
                  </Link>
                  <p className="text-sm text-muted">
                    {pathLabel(topic, topics) && `${pathLabel(topic, topics)}. `}
                    {review ? (
                      <span className={isDue ? "highlight" : undefined}>{dueLabel(review.dueAt)}</span>
                    ) : (
                      "Not reviewed yet"
                    )}
                  </p>
                </div>
                {review && (
                  <form action={startCycle.bind(null, topic.id, "review")}>
                    <button
                      className={`rounded-md px-4 py-2 text-sm font-semibold ${
                        isDue ? "bg-pen text-surface hover:opacity-90" : "border border-rule hover:border-pen"
                      }`}
                    >
                      Start review
                    </button>
                  </form>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
