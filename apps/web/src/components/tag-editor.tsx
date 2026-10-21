"use client";

import { useState, useTransition } from "react";

import { tagTopic, untagTopic } from "@/app/actions";
import type { Cluster } from "@/lib/api";
import { toTagName } from "@/lib/topics";

export function TagEditor({ topicId, clusters }: { topicId: string; clusters: Cluster[] }) {
  const [draft, setDraft] = useState("");
  const [pending, startTransition] = useTransition();
  const tagged = clusters.filter((c) => c.topicIds.includes(topicId));

  const add = () => {
    const name = toTagName(draft);
    setDraft("");
    if (name) startTransition(() => tagTopic(topicId, name));
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <ul className="contents" aria-label="Hashtags">
        {tagged.map((c) => (
          <li key={c.id} className="flex items-center gap-1 rounded-full bg-pen-soft py-0.5 pr-1 pl-3 text-sm text-pen">
            #{c.name}
            <button
              type="button"
              disabled={pending}
              onClick={() => startTransition(() => untagTopic(topicId, c.id))}
              aria-label={`Remove #${c.name}`}
              className="flex size-5 items-center justify-center rounded-full hover:bg-pen hover:text-surface"
            >
              ×
            </button>
          </li>
        ))}
      </ul>
      <label htmlFor="add-tag" className="sr-only">
        Add a hashtag
      </label>
      <input
        id="add-tag"
        list="known-tags"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.nativeEvent.isComposing) {
            e.preventDefault();
            add();
          }
        }}
        onBlur={add}
        placeholder="+ #hashtag"
        className="w-32 rounded-full border border-dashed border-rule bg-transparent px-3 py-0.5 text-sm outline-none focus:border-pen"
      />
      <datalist id="known-tags">
        {clusters
          .filter((c) => !c.topicIds.includes(topicId))
          .map((c) => (
            <option key={c.id} value={c.name} />
          ))}
      </datalist>
    </div>
  );
}
