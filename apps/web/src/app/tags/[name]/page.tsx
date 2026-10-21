import Link from "next/link";
import { notFound } from "next/navigation";

import { api } from "@/lib/api";
import { dueLabel } from "@/lib/format";

export default async function TagPage(props: PageProps<"/tags/[name]">) {
  const { name } = await props.params;
  const tag = (await api.listHashtags()).find((h) => h.name === decodeURIComponent(name));
  if (!tag) notFound();

  const topics = await api.listTopics();
  const rows = await Promise.all(
    tag.topicIds.map(async (id) => ({
      topic: topics.find((t) => t.id === id)!,
      review: await api.getReviewSchedule(id),
    })),
  );
  // Most overdue first; notes never tested go last.
  rows.sort((a, b) => (a.review?.dueAt ?? "￿").localeCompare(b.review?.dueAt ?? "￿"));
  const now = new Date();

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8">
      <header className="flex flex-col gap-1">
        <h1 className="font-serif text-4xl font-semibold tracking-tight">#{tag.name}</h1>
        <p className="text-muted">
          {rows.length} {rows.length === 1 ? "note" : "notes"}
        </p>
      </header>
      <ul className="divide-y divide-rule border-y border-rule">
        {rows.map(({ topic, review }) => {
          const due = review && new Date(review.dueAt) <= now;
          return (
            <li key={topic.id} className="flex flex-wrap items-center gap-x-6 gap-y-2 py-4">
              <div className="flex min-w-0 flex-1 flex-col">
                <Link href={`/notes/${topic.id}`} className="font-serif text-xl font-medium hover:text-pen">
                  {topic.title}
                </Link>
                <p className="text-sm text-muted">
                  {review ? <span className={due ? "highlight" : undefined}>{dueLabel(review.dueAt)}</span> : "Not tested yet"}
                </p>
              </div>
              <Link
                href={`/notes/${topic.id}?test=1`}
                className={`rounded-md px-4 py-2 text-sm font-semibold ${
                  due ? "bg-pen text-surface hover:opacity-90" : "border border-rule hover:border-pen"
                }`}
              >
                Test me
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
