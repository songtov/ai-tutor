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
      className="relative"
    >
      <label htmlFor="open-note" className="sr-only">
        Open a note or start a new one
      </label>
      <input
        id="open-note"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="What do you want to learn? Open or start a note"
        autoComplete="off"
        className="w-full rounded-md border border-rule bg-surface px-4 py-2.5 font-serif text-lg text-pen outline-none placeholder:font-sans placeholder:text-base placeholder:text-muted focus:border-pen"
      />
      {title && (
        <ul className="absolute inset-x-0 top-full z-10 mt-1 divide-y divide-rule rounded-md border border-rule bg-surface shadow-lg">
          {matches.map((t) => (
            <li key={t.id}>
              <Link href={`/notes/${t.id}`} className="flex justify-between gap-2 px-4 py-2.5 hover:bg-pen-soft">
                <span className="font-semibold">{t.title}</span>
                <span className="text-sm text-pen">Open</span>
              </Link>
            </li>
          ))}
          {!exact && (
            <li>
              <button disabled={pending} className="flex w-full justify-between gap-2 px-4 py-2.5 text-left hover:bg-pen-soft">
                <span>
                  New note: <span className="font-serif font-semibold text-pen">{title}</span>
                </span>
                <span className="text-sm text-pen">Start writing</span>
              </button>
            </li>
          )}
        </ul>
      )}
    </form>
  );
}
