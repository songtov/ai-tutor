"use client";

import Link from "next/link";
import { useState, useTransition } from "react";

import { askQuestion, findMaterials, saveMaterial } from "@/app/actions";
import type { Material, Question, Topic } from "@/lib/api";
import { explainPrompt, parseLinks, type NoteIndex } from "@/lib/notes";

export type DrawerTab = "materials" | "questions" | "links";

const TABS: { id: DrawerTab; label: string }[] = [
  { id: "materials", label: "Materials" },
  { id: "questions", label: "Questions" },
  { id: "links", label: "Links" },
];

function MaterialsTab({
  topicId,
  materials,
  onAddToNote,
}: {
  topicId: string;
  materials: Material[];
  onAddToNote: (text: string) => void;
}) {
  const [pending, startTransition] = useTransition();
  const [added, setAdded] = useState<string[]>([]);
  const sorted = materials.toSorted((a, b) => Number(b.saved) - Number(a.saved));
  return (
    <div className="flex flex-col gap-4">
      <button
        type="button"
        disabled={pending}
        onClick={() => startTransition(() => findMaterials(topicId))}
        className="rounded-md border border-pen px-4 py-2 text-sm font-semibold text-pen hover:bg-pen-soft disabled:opacity-40"
      >
        {pending ? "Searching…" : "Find materials"}
      </button>
      {sorted.length === 0 && (
        <p className="text-sm text-muted">Videos and articles for this note show up here, aimed at what you missed.</p>
      )}
      <ul className="flex flex-col gap-4">
        {sorted.map((m) => (
          <li key={m.id} className="flex flex-col gap-2 border-b border-rule pb-4 last:border-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex min-w-0 flex-col">
                <a href={m.url} target="_blank" rel="noreferrer" className="font-semibold hover:text-pen">
                  {m.title}
                </a>
                <span className="text-xs text-muted">
                  {m.kind === "video" ? "Video" : m.kind === "article" ? "Article" : "Link"} from {m.source}
                </span>
                {m.foundFor && <span className="mt-1 text-xs text-muted">For your gap: {m.foundFor}</span>}
              </div>
              {!m.saved && (
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => startTransition(() => saveMaterial(m.id))}
                  className="shrink-0 rounded-md border border-rule px-2.5 py-1 text-xs hover:border-pen"
                >
                  Save
                </button>
              )}
            </div>
            {m.saved && m.summary.length > 0 && (
              <ul className="flex flex-col gap-2 rounded-md bg-paper p-3 text-sm">
                {m.summary.map((p) => {
                  const key = `${m.id}:${p.text}`;
                  return (
                    <li key={p.text} className="flex items-start justify-between gap-2">
                      <span>
                        {p.timestamp && <span className="mr-1.5 text-muted">{p.timestamp}</span>}
                        {p.text}
                      </span>
                      <button
                        type="button"
                        disabled={added.includes(key)}
                        title="Adds a prompt to your note to explain this in your own words"
                        onClick={() => {
                          onAddToNote(explainPrompt(p.text, { title: m.title, url: m.url }));
                          setAdded([...added, key]);
                        }}
                        className="shrink-0 text-xs font-semibold text-pen disabled:text-muted"
                      >
                        {added.includes(key) ? "Added" : "+ note"}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function QuestionsTab({
  topicId,
  questions,
  quote,
  onClearQuote,
}: {
  topicId: string;
  questions: Question[];
  quote: string | null;
  onClearQuote: () => void;
}) {
  const [draft, setDraft] = useState("");
  const [pending, startTransition] = useTransition();
  return (
    <div className="flex flex-col gap-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const question = draft.trim();
          if (!question) return;
          setDraft("");
          onClearQuote();
          startTransition(() => askQuestion(topicId, quote, question));
        }}
        className="flex flex-col gap-2"
      >
        {quote ? (
          <div className="flex items-start justify-between gap-2 border-l-2 border-pen pl-3 text-sm text-muted">
            <span className="font-serif">“{quote}”</span>
            <button type="button" onClick={onClearQuote} aria-label="Clear selected text" className="hover:text-ink">
              ×
            </button>
          </div>
        ) : (
          <p className="text-xs text-muted">Tip: select text in your note to ask about it.</p>
        )}
        <label htmlFor="question" className="sr-only">
          Question
        </label>
        <textarea
          id="question"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={3}
          placeholder="What's confusing?"
          className="rounded-md border border-rule bg-paper p-2 text-sm outline-none focus:border-pen"
        />
        <button
          disabled={pending || !draft.trim()}
          className="self-end rounded-md bg-pen px-3 py-1.5 text-sm font-semibold text-surface disabled:opacity-40"
        >
          Ask
        </button>
      </form>
      <ul className="flex flex-col gap-4">
        {questions.toReversed().map((q) => (
          <li key={q.id} className="flex flex-col gap-1.5 border-t border-rule pt-3 text-sm">
            {q.quote && <span className="font-serif text-muted">“{q.quote}”</span>}
            <span className="font-semibold">{q.question}</span>
            <span>{q.answer}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function LinksTab({ body, index, backlinks }: { body: string; index: NoteIndex; backlinks: Topic[] }) {
  const links = parseLinks(body);
  return (
    <div className="flex flex-col gap-5 text-sm">
      <section className="flex flex-col gap-2">
        <h3 className="text-muted">This note links to</h3>
        {links.length === 0 && <p className="text-muted">Type [[Note title]] in your note to link it.</p>}
        <ul className="flex flex-col gap-1">
          {links.map((title) => {
            const id = index[title.toLowerCase()];
            return (
              <li key={title}>
                <Link
                  href={id ? `/notes/${id}` : `/open?title=${encodeURIComponent(title)}`}
                  className={id ? "text-pen hover:underline" : "text-pen/70 hover:text-pen"}
                >
                  [[{title}]]
                </Link>
                {!id && <span className="ml-2 text-xs text-muted">not written yet</span>}
              </li>
            );
          })}
        </ul>
      </section>
      <section className="flex flex-col gap-2">
        <h3 className="text-muted">Linked from</h3>
        {backlinks.length === 0 && <p className="text-muted">No other note links here yet.</p>}
        <ul className="flex flex-col gap-1">
          {backlinks.map((t) => (
            <li key={t.id}>
              <Link href={`/notes/${t.id}`} className="text-pen hover:underline">
                [[{t.title}]]
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export function Drawer(props: {
  topic: Topic;
  body: string;
  index: NoteIndex;
  materials: Material[];
  questions: Question[];
  backlinks: Topic[];
  tab: DrawerTab;
  onTab: (tab: DrawerTab) => void;
  onClose: () => void;
  quote: string | null;
  onClearQuote: () => void;
  onAddToNote: (text: string) => void;
}) {
  return (
    <aside
      aria-label="Study tools"
      className="fixed inset-y-0 right-0 z-40 flex w-full max-w-sm flex-col gap-5 overflow-y-auto border-l border-rule bg-surface p-5 shadow-xl"
    >
      <div className="flex items-center justify-between gap-2 border-b border-rule">
        <div role="tablist" className="flex gap-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              role="tab"
              type="button"
              aria-selected={props.tab === t.id}
              onClick={() => props.onTab(t.id)}
              className={`-mb-px border-b-2 px-2 pb-2 text-sm ${
                props.tab === t.id ? "border-pen font-semibold text-pen" : "border-transparent text-muted hover:text-ink"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <button type="button" onClick={props.onClose} aria-label="Close" className="pb-2 text-xl text-muted hover:text-ink">
          ×
        </button>
      </div>
      <div role="tabpanel">
        {props.tab === "materials" && (
          <MaterialsTab topicId={props.topic.id} materials={props.materials} onAddToNote={props.onAddToNote} />
        )}
        {props.tab === "questions" && (
          <QuestionsTab
            topicId={props.topic.id}
            questions={props.questions}
            quote={props.quote}
            onClearQuote={props.onClearQuote}
          />
        )}
        {props.tab === "links" && <LinksTab body={props.body} index={props.index} backlinks={props.backlinks} />}
      </div>
    </aside>
  );
}
