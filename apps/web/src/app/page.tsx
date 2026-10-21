import Link from "next/link";

import { StartNote } from "@/components/start-note";
import { api } from "@/lib/api";
import { dueLabel, formatDate } from "@/lib/format";
import { bodyOf, noteStatements } from "@/lib/notes";
import { sortByTitle } from "@/lib/topics";

export default async function TodayPage() {
  const [topics, dueReviews] = await Promise.all([api.listTopics(), api.listDueReviews()]);
  const titleOf = (id: string) => topics.find((t) => t.id === id)?.title ?? id;
  const recent = topics.toSorted((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 4);
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-12">
      <header className="flex flex-col gap-4">
        <h1 className="sr-only">Today</h1>
        <p className="text-muted">{today}</p>
        <StartNote topics={sortByTitle(topics)} />
      </header>

      <section className="flex flex-col gap-4">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="text-lg font-semibold">Recall before you forget</h2>
          {dueReviews.length > 1 && (
            <Link href="/review" className="text-sm font-semibold text-pen hover:underline">
              Review all {dueReviews.length}
            </Link>
          )}
        </div>
        {dueReviews.length === 0 ? (
          <p className="text-muted">Nothing to review today.</p>
        ) : (
          <ul className="divide-y divide-rule border-y border-rule">
            {dueReviews.map((review) => (
              <li key={review.topicId} className="flex flex-wrap items-center gap-x-6 gap-y-2 py-4">
                <div className="flex min-w-0 flex-1 flex-col">
                  <Link href={`/notes/${review.topicId}`} className="font-serif text-xl font-medium hover:text-pen">
                    {titleOf(review.topicId)}
                  </Link>
                  <p className="text-sm text-muted">
                    <span className="highlight">{dueLabel(review.dueAt)}</span>
                    {review.lastReviewedAt && ` Last tested ${formatDate(review.lastReviewedAt)}.`}
                  </p>
                </div>
                <Link
                  href={`/notes/${review.topicId}?test=1`}
                  className="rounded-md bg-pen px-4 py-2 text-sm font-semibold text-surface hover:opacity-90"
                >
                  Test me
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Recently edited</h2>
        <ul className="grid gap-3 sm:grid-cols-2">
          {recent.map((t) => (
            <li key={t.id}>
              <Link
                href={`/notes/${t.id}`}
                className="flex h-full flex-col gap-1 rounded-lg border border-rule bg-surface p-4 hover:border-pen"
              >
                <span className="font-serif text-lg font-medium">{t.title}</span>
                <span className="line-clamp-2 text-sm text-muted">
                  {noteStatements(bodyOf(t.blocks))[0] ?? "Empty note"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
