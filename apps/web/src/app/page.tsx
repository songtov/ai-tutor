import Link from "next/link";

import { StartNote } from "@/components/start-note";
import { api } from "@/lib/api";
import { dueLabel, formatDate } from "@/lib/format";
import { bodyOf, noteStatements } from "@/lib/notes";
import { sortByTitle } from "@/lib/topics";

export default async function HomePage() {
  const [topics, due] = await Promise.all([api.listTopics(), api.listDueReviews()]);
  const titleOf = (id: string) => topics.find((t) => t.id === id)?.title ?? id;
  const recent = topics.toSorted((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 6);
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-12">
      <header className="flex flex-col gap-3">
        <p className="text-sm text-muted">{today}</p>
        <h1 className="font-serif text-3xl font-semibold tracking-tight md:text-4xl">What do you want to learn?</h1>
        <StartNote topics={sortByTitle(topics)} />
      </header>

      <section className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="text-lg font-semibold">Recall before you forget</h2>
          {due.length > 1 && (
            <Link href="/review" className="text-sm font-semibold text-pen hover:underline">
              Review all {due.length}
            </Link>
          )}
        </div>
        {due.length === 0 ? (
          <p className="text-muted">Nothing to review today.</p>
        ) : (
          <ul className="divide-y divide-rule border-y border-rule">
            {due.map((review) => (
              <li key={review.topicId} className="flex flex-wrap items-center gap-x-6 gap-y-2 py-3">
                <div className="flex min-w-0 flex-1 flex-col">
                  <Link href={`/notes/${review.topicId}`} className="font-serif text-lg font-medium hover:text-pen">
                    {titleOf(review.topicId)}
                  </Link>
                  <p className="text-sm text-muted">
                    <span className="highlight">{dueLabel(review.dueAt)}</span>
                    {review.lastReviewedAt && ` Last tested ${formatDate(review.lastReviewedAt)}.`}
                  </p>
                </div>
                <Link
                  href={`/notes/${review.topicId}?test=1`}
                  className="rounded-md bg-pen px-3 py-1.5 text-sm font-semibold text-surface hover:opacity-90"
                >
                  Test me
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Recent notes</h2>
        <ul className="divide-y divide-rule border-y border-rule">
          {recent.map((t) => (
            <li key={t.id}>
              <Link href={`/notes/${t.id}`} className="flex flex-col gap-0.5 py-3 hover:text-pen">
                <span className="flex items-baseline justify-between gap-3">
                  <span className="font-serif text-lg font-medium">{t.title}</span>
                  <span className="shrink-0 text-xs text-muted">{formatDate(t.updatedAt)}</span>
                </span>
                <span className="line-clamp-1 text-sm text-muted">{noteStatements(bodyOf(t.blocks))[0] ?? "Empty note"}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
