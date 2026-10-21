"use client";

import { useState, useTransition } from "react";

import { goToStage, startCycle, startNewTopic } from "@/app/actions";
import type { LearningCycle, MethodName, TopicSuggestion } from "@/lib/api";

export function NextTopicPanel({
  cycle,
  defaultMethod,
  suggestions,
}: {
  cycle: LearningCycle;
  defaultMethod: MethodName;
  suggestions: TopicSuggestion[];
}) {
  const [title, setTitle] = useState("");
  const [pending, startTransition] = useTransition();

  // Moving on to the next topic finishes this cycle.
  const moveOn = (start: () => Promise<void>) =>
    startTransition(async () => {
      await goToStage(cycle.id, cycle.stages.length);
      await start();
    });
  const start = (s: TopicSuggestion) =>
    moveOn(() => (s.topic ? startCycle(s.topic.id, defaultMethod) : startNewTopic(s.title, cycle.topicId)));

  return (
    <div className="flex flex-col gap-6">
      {suggestions.length === 0 && (
        <p className="text-muted">You&apos;ve covered every topic linked to this one. Name what you want to learn next.</p>
      )}
      <ul className="flex flex-col gap-3">
        {suggestions.map((s) => (
          <li
            key={s.title}
            className="flex flex-wrap items-center gap-4 rounded-lg border border-rule bg-surface p-4"
          >
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="font-serif text-xl font-medium">{s.title}</span>
              <span className="text-sm text-muted">{s.reason}</span>
            </div>
            <button
              type="button"
              disabled={pending}
              onClick={() => start(s)}
              className="rounded-md bg-pen px-4 py-2 text-sm font-semibold text-surface disabled:opacity-40"
            >
              Start {s.title}
            </button>
          </li>
        ))}
      </ul>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (title.trim()) moveOn(() => startNewTopic(title.trim(), cycle.topicId));
        }}
        className="flex flex-wrap items-center gap-2"
      >
        <label htmlFor="new-topic" className="text-sm text-muted">
          Or learn something else:
        </label>
        <input
          id="new-topic"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Topic name"
          className="min-w-0 flex-1 rounded-md border border-rule bg-surface px-3 py-2 outline-none focus:border-pen"
        />
        <button
          disabled={pending || !title.trim()}
          className="rounded-md border border-pen px-4 py-2 text-sm font-semibold text-pen disabled:opacity-40"
        >
          Create and start
        </button>
      </form>
    </div>
  );
}
