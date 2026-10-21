"use client";

import Link from "next/link";
import { useState, useTransition } from "react";

import { openNote } from "@/app/actions";
import type { Topic } from "@/lib/api";

export function StartNote({ topics }: { topics: Topic[] }) {
  const [query, setQuery] = useState("");
  const [pending, startTransition] = useTransition();
  const title = query.trim();
  const q = title.toLowerCase();
  const matches = q ? topics.filter((t) => t.title.toLowerCase().includes(q)).slice(0, 5) : [];
  const exact = matches.find((t) => t.title.toLowerCase() === q);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (title) startTransition(() => openNote(title));
      }}
      className="flex flex-col gap-4"
    >
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
      {title && (
        <ul className="divide-y divide-rule rounded-lg border border-rule bg-surface">
          {matches.map((t) => (
            <li key={t.id}>
              <Link href={`/notes/${t.id}`} className="flex justify-between gap-2 px-4 py-3 hover:bg-pen-soft">
                <span className="font-semibold">{t.title}</span>
                <span className="text-sm font-semibold text-pen">Open note</span>
              </Link>
            </li>
          ))}
          {!exact && (
            <li>
              <button
                disabled={pending}
                className="flex w-full justify-between gap-2 px-4 py-3 text-left hover:bg-pen-soft"
              >
                <span>
                  New note: <span className="font-serif font-semibold text-pen">{title}</span>
                </span>
                <span className="text-sm font-semibold text-pen">Start writing</span>
              </button>
            </li>
          )}
        </ul>
      )}
    </form>
  );
}
