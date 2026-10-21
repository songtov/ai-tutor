"use client";

import { useTransition } from "react";

import { scheduleReview } from "@/app/actions";
import type { ReviewSchedule } from "@/lib/api";
import { dueLabel } from "@/lib/format";

const OPTIONS = [
  { days: 1, label: "Tomorrow", hint: "I barely remembered" },
  { days: 3, label: "In 3 days", hint: "Some gaps" },
  { days: 7, label: "In a week", hint: "Mostly solid" },
  { days: 30, label: "In a month", hint: "I knew it cold" },
];

export function ReviewPanel({ topicId, schedule }: { topicId: string; schedule: ReviewSchedule | null }) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex flex-col gap-5">
      <p className="text-muted">
        How well did you recall it? Pick when you want to be asked again.
        {schedule && ` Next review: ${dueLabel(schedule.dueAt).toLowerCase()}.`}
      </p>
      <div className="grid gap-3 sm:grid-cols-4">
        {OPTIONS.map((o) => {
          const selected = schedule?.intervalDays === o.days;
          return (
            <button
              key={o.days}
              type="button"
              disabled={pending}
              aria-pressed={selected}
              onClick={() => startTransition(() => scheduleReview(topicId, o.days))}
              className={`flex flex-col gap-1 rounded-lg border p-4 text-left ${
                selected ? "border-pen bg-pen-soft" : "border-rule bg-surface hover:border-pen"
              }`}
            >
              <span className="font-semibold">{o.label}</span>
              <span className="text-sm text-muted">{o.hint}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
