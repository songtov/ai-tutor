import Link from "next/link";

import { startCycle } from "@/app/actions";
import { StageProgress } from "@/components/stage-progress";
import { StartTopic } from "@/components/start-topic";
import { api } from "@/lib/api";
import { dueLabel, formatDate, STAGE_LABELS } from "@/lib/format";
import { pathLabel } from "@/lib/topics";

export default async function TodayPage() {
  const [topics, clusters, dueReviews, activeCycles] = await Promise.all([
    api.listTopics(),
    api.listClusters(),
    api.listDueReviews(),
    api.listActiveCycles(),
  ]);
  const titleOf = (id: string) => topics.find((t) => t.id === id)?.title ?? id;
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-12">
      <header className="flex flex-col gap-4">
        <h1 className="sr-only">Today</h1>
        <p className="text-muted">{today}</p>
        <StartTopic
          topics={topics.map((t) => ({ ...t, path: pathLabel(t, topics) }))}
          tagNames={clusters.map((c) => c.name)}
        />
      </header>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Recall before you forget</h2>
        {dueReviews.length === 0 ? (
          <p className="text-muted">Nothing to review today.</p>
        ) : (
          <ul className="divide-y divide-rule border-y border-rule">
            {dueReviews.map((review) => (
              <li key={review.topicId} className="flex flex-wrap items-center gap-x-6 gap-y-2 py-4">
                <div className="flex min-w-0 flex-1 flex-col">
                  <Link
                    href={`/topics/${review.topicId}`}
                    className="font-serif text-xl font-medium hover:text-pen"
                  >
                    {titleOf(review.topicId)}
                  </Link>
                  <p className="text-sm text-muted">
                    <span className="highlight">{dueLabel(review.dueAt)}</span>
                    {review.lastReviewedAt && ` Last recalled ${formatDate(review.lastReviewedAt)}.`}
                  </p>
                </div>
                <form action={startCycle.bind(null, review.topicId, "review")}>
                  <button className="rounded-md bg-pen px-4 py-2 text-sm font-semibold text-surface hover:opacity-90">
                    Start review
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Pick up where you left off</h2>
        {activeCycles.length === 0 ? (
          <p className="text-muted">No cycle in progress.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {activeCycles.map((cycle) => (
              <li key={cycle.id}>
                <Link
                  href={`/topics/${cycle.topicId}/cycles/${cycle.id}`}
                  className="flex flex-col gap-3 rounded-lg border border-rule bg-surface p-5 hover:border-pen"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="font-serif text-xl font-medium">{titleOf(cycle.topicId)}</span>
                    <span className="text-sm text-muted">
                      Next up: {STAGE_LABELS[cycle.stages[cycle.currentIndex]]}
                    </span>
                  </div>
                  <StageProgress cycle={cycle} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
