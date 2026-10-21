import Link from "next/link";
import { notFound } from "next/navigation";

import { startCycleFromForm } from "@/app/actions";
import { StageProgress } from "@/components/stage-progress";
import { api, METHODS, type MethodName, type Topic } from "@/lib/api";
import { dueLabel, formatDate, METHOD_LABELS } from "@/lib/format";

function TopicLinks({ label, topics }: { label: string; topics: Topic[] }) {
  if (topics.length === 0) return null;
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-sm text-muted">{label}</dt>
      <dd className="flex flex-wrap gap-x-3 gap-y-1">
        {topics.map((t) => (
          <Link key={t.id} href={`/topics/${t.id}`} className="text-pen underline-offset-4 hover:underline">
            {t.title}
          </Link>
        ))}
      </dd>
    </div>
  );
}

export default async function TopicPage(props: PageProps<"/topics/[id]">) {
  const { id } = await props.params;
  const topic = await api.getTopic(id);
  if (!topic) notFound();

  const [topics, links, clusters, cycles, notes, review, settings] = await Promise.all([
    api.listTopics(),
    api.listLinks(id),
    api.listClusters(),
    api.listCycles(id),
    api.listNotes(id),
    api.getReviewSchedule(id),
    api.getSettings(),
  ]);
  const byId = (topicId: string) => topics.find((t) => t.id === topicId)!;

  const ancestors: Topic[] = [];
  for (let p = topic.parentId; p; p = byId(p).parentId) ancestors.unshift(byId(p));
  const children = topics.filter((t) => t.parentId === id);
  const learnFirst = links.filter((l) => l.kind === "prerequisite" && l.toTopicId === id);
  const unlocks = links.filter((l) => l.kind === "prerequisite" && l.fromTopicId === id);
  const related = links.filter((l) => l.kind === "related");
  const topicClusters = clusters.filter((c) => c.topicIds.includes(id));

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-10">
      <header className="flex flex-col gap-3">
        {ancestors.length > 0 && (
          <nav aria-label="Breadcrumb" className="flex flex-wrap gap-1.5 text-sm text-muted">
            {ancestors.map((a) => (
              <span key={a.id} className="flex gap-1.5">
                <Link href={`/topics/${a.id}`} className="hover:text-pen">
                  {a.title}
                </Link>
                <span aria-hidden>›</span>
              </span>
            ))}
          </nav>
        )}
        <h1 className="font-serif text-4xl font-semibold tracking-tight">{topic.title}</h1>
        {topic.description && <p className="max-w-prose text-lg text-muted">{topic.description}</p>}
        {topicClusters.length > 0 && (
          <ul className="flex flex-wrap gap-2" aria-label="Clusters">
            {topicClusters.map((c) => (
              <li key={c.id} className="rounded-full bg-pen-soft px-3 py-0.5 text-sm text-pen">
                {c.name}
              </li>
            ))}
          </ul>
        )}
      </header>

      <section className="flex flex-wrap items-end justify-between gap-4 rounded-lg border border-rule bg-surface p-5">
        <div className="flex flex-col gap-1">
          <h2 className="font-semibold">Start a learning cycle</h2>
          <p className="text-sm text-muted">
            {review ? (
              <span className={new Date(review.dueAt) <= new Date() ? "highlight" : undefined}>
                Review {dueLabel(review.dueAt).toLowerCase()}.
              </span>
            ) : (
              "You haven't studied this topic yet."
            )}
          </p>
        </div>
        <form action={startCycleFromForm.bind(null, id)} className="flex flex-wrap items-center gap-2">
          <label htmlFor="method" className="sr-only">
            Learning method
          </label>
          <select
            id="method"
            name="method"
            defaultValue={settings.defaultMethod}
            className="rounded-md border border-rule bg-paper px-3 py-2 text-sm"
          >
            {(Object.keys(METHODS) as MethodName[]).map((m) => (
              <option key={m} value={m}>
                {METHOD_LABELS[m]}
              </option>
            ))}
          </select>
          <button className="rounded-md bg-pen px-4 py-2 text-sm font-semibold text-surface hover:opacity-90">
            Start
          </button>
        </form>
      </section>

      {(learnFirst.length > 0 || unlocks.length > 0 || related.length > 0 || children.length > 0) && (
        <dl className="grid gap-5 sm:grid-cols-2">
          <TopicLinks label="Learn first" topics={learnFirst.map((l) => byId(l.fromTopicId))} />
          <TopicLinks label="Unlocks" topics={unlocks.map((l) => byId(l.toTopicId))} />
          <TopicLinks
            label="Related"
            topics={related.map((l) => byId(l.fromTopicId === id ? l.toTopicId : l.fromTopicId))}
          />
          <TopicLinks label="Subtopics" topics={children} />
        </dl>
      )}

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Notes</h2>
        {notes.length === 0 ? (
          <p className="text-muted">Notes appear here after your first feedback.</p>
        ) : (
          notes.map((note) => (
            <article key={note.id} className="flex flex-col gap-2 border-l-2 border-pen pl-5">
              <p className="text-sm text-muted">{formatDate(note.updatedAt)}</p>
              <div className="max-w-prose whitespace-pre-line font-serif text-lg leading-relaxed">
                {note.body}
              </div>
            </article>
          ))
        )}
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Cycles</h2>
        {cycles.length === 0 ? (
          <p className="text-muted">No cycles yet.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {cycles.toReversed().map((cycle) => (
              <li key={cycle.id}>
                <Link
                  href={`/topics/${id}/cycles/${cycle.id}`}
                  className="flex flex-col gap-3 rounded-lg border border-rule bg-surface p-4 hover:border-pen"
                >
                  <div className="flex flex-wrap justify-between gap-2 text-sm">
                    <span className="font-semibold">{METHOD_LABELS[cycle.method]}</span>
                    <span className="text-muted">
                      {cycle.completedAt
                        ? `Finished ${formatDate(cycle.completedAt)}`
                        : `Started ${formatDate(cycle.startedAt)}`}
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
