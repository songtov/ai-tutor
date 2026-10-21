"use client";

import Link from "next/link";
import { useState, useTransition } from "react";

import { createTopicAndStart } from "@/app/actions";
import type { Topic } from "@/lib/api";
import { toTagName } from "@/lib/topics";

export type TopicOption = Topic & { path: string };

function Chip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <li className="flex items-center gap-1 rounded-full bg-pen-soft py-0.5 pr-1 pl-3 text-sm text-pen">
      {label}
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${label}`}
        className="flex size-5 items-center justify-center rounded-full hover:bg-pen hover:text-surface"
      >
        ×
      </button>
    </li>
  );
}

function TopicMultiPicker({
  label,
  options,
  selected,
  onChange,
}: {
  label: string;
  options: TopicOption[];
  selected: string[];
  onChange: (ids: string[]) => void;
}) {
  const id = label.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm text-muted">
        {label}
      </label>
      <div className="flex flex-wrap items-center gap-2">
        <ul className="contents">
          {selected.map((sid) => (
            <Chip
              key={sid}
              label={options.find((o) => o.id === sid)!.title}
              onRemove={() => onChange(selected.filter((s) => s !== sid))}
            />
          ))}
        </ul>
        <select
          id={id}
          value=""
          onChange={(e) => e.target.value && onChange([...selected, e.target.value])}
          className="rounded-md border border-rule bg-paper px-2 py-1 text-sm"
        >
          <option value="">Add a topic</option>
          {options
            .filter((o) => !selected.includes(o.id))
            .map((o) => (
              <option key={o.id} value={o.id}>
                {o.path ? `${o.path} › ${o.title}` : o.title}
              </option>
            ))}
        </select>
      </div>
    </div>
  );
}

export function StartTopic({ topics, tagNames }: { topics: TopicOption[]; tagNames: string[] }) {
  const [query, setQuery] = useState("");
  const [parentId, setParentId] = useState("");
  const [learnFirstIds, setLearnFirstIds] = useState<string[]>([]);
  const [relatedIds, setRelatedIds] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagDraft, setTagDraft] = useState("");
  const [pending, startTransition] = useTransition();

  const title = query.trim();
  const q = title.toLowerCase();
  const matches = q ? topics.filter((t) => t.title.toLowerCase().includes(q)).slice(0, 5) : [];
  const exact = matches.some((t) => t.title.toLowerCase() === q);

  const addTag = (raw: string) => {
    const tag = toTagName(raw);
    if (tag && !tags.includes(tag)) setTags([...tags, tag]);
    setTagDraft("");
  };

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <label htmlFor="what-to-learn" className="font-serif text-4xl font-semibold tracking-tight">
          What do you want to learn?
        </label>
        <input
          id="what-to-learn"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Derivatives, the French subjunctive, how vaccines work…"
          autoComplete="off"
          className="border-b-2 border-rule bg-transparent pb-2 font-serif text-2xl text-pen outline-none placeholder:text-muted/60 focus:border-pen"
        />
      </div>

      {matches.length > 0 && (
        <div className="flex flex-col gap-2">
          <h2 className="text-sm text-muted">Already in your topics</h2>
          <ul className="divide-y divide-rule rounded-lg border border-rule bg-surface">
            {matches.map((t) => (
              <li key={t.id}>
                <Link
                  href={`/topics/${t.id}`}
                  className="flex flex-wrap items-baseline justify-between gap-2 px-4 py-3 hover:bg-pen-soft"
                >
                  <span>
                    <span className="font-semibold">{t.title}</span>
                    {t.path && <span className="ml-2 text-sm text-muted">{t.path}</span>}
                  </span>
                  <span className="text-sm font-semibold text-pen">Continue</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {title && !exact && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            startTransition(() =>
              createTopicAndStart({
                title,
                parentId: parentId || null,
                learnFirstIds,
                relatedIds,
                tags: tagDraft.trim() ? [...tags, toTagName(tagDraft)] : tags,
              }),
            );
          }}
          className="flex flex-col gap-5 rounded-lg border border-rule bg-surface p-5"
        >
          <h2 className="font-semibold">
            Start <span className="font-serif text-pen">{title}</span> as a new topic
          </h2>

          <div className="flex flex-col gap-2">
            <label htmlFor="parent" className="text-sm text-muted">
              Put under
            </label>
            <select
              id="parent"
              value={parentId}
              onChange={(e) => setParentId(e.target.value)}
              className="self-start rounded-md border border-rule bg-paper px-2 py-1 text-sm"
            >
              <option value="">Nothing (a new top-level topic)</option>
              {topics.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.path ? `${t.path} › ${t.title}` : t.title}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <TopicMultiPicker
              label="Learn first"
              options={topics}
              selected={learnFirstIds}
              onChange={setLearnFirstIds}
            />
            <TopicMultiPicker label="Related" options={topics} selected={relatedIds} onChange={setRelatedIds} />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="tags" className="text-sm text-muted">
              Hashtags
            </label>
            <div className="flex flex-wrap items-center gap-2">
              <ul className="contents">
                {tags.map((tag) => (
                  <Chip key={tag} label={`#${tag}`} onRemove={() => setTags(tags.filter((t) => t !== tag))} />
                ))}
              </ul>
              <input
                id="tags"
                value={tagDraft}
                onChange={(e) => setTagDraft(e.target.value)}
                onKeyDown={(e) => {
                  if ((e.key === "Enter" || e.key === ",") && !e.nativeEvent.isComposing) {
                    e.preventDefault();
                    addTag(tagDraft);
                  }
                }}
                placeholder="#exam-prep"
                className="min-w-32 flex-1 rounded-md border border-rule bg-paper px-2 py-1 text-sm outline-none focus:border-pen"
              />
            </div>
            {tagNames.some((n) => !tags.includes(n)) && (
              <div className="flex flex-wrap gap-2">
                {tagNames
                  .filter((n) => !tags.includes(n))
                  .map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => addTag(n)}
                      className="text-sm text-muted hover:text-pen"
                    >
                      #{n}
                    </button>
                  ))}
              </div>
            )}
          </div>

          <button
            disabled={pending}
            className="self-start rounded-md bg-pen px-5 py-2 font-semibold text-surface disabled:opacity-40"
          >
            Start learning
          </button>
        </form>
      )}
    </section>
  );
}
