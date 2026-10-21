"use client";

import { useTransition } from "react";

import { goToStage, skipStage } from "@/app/actions";
import type { LearningCycle } from "@/lib/api";
import { STAGE_LABELS } from "@/lib/format";

export function StageStepper({ cycle, strictOrder }: { cycle: LearningCycle; strictOrder: boolean }) {
  const [pending, startTransition] = useTransition();
  const go = (index: number) => startTransition(() => goToStage(cycle.id, index));

  return (
    <nav aria-label="Cycle stages" className="overflow-x-auto pb-1">
      <ol
        className="grid"
        style={{ gridTemplateColumns: `repeat(${cycle.stages.length}, minmax(4.5rem, 1fr))` }}
      >
        {cycle.stages.map((stage, i) => {
          const current = i === cycle.currentIndex && cycle.completedAt === null;
          const skipped = cycle.skipped.includes(i);
          const done = !skipped && (cycle.completedAt !== null || i < cycle.currentIndex);
          return (
            <li key={i} className="relative flex justify-center">
              {i > 0 && (
                <span
                  aria-hidden
                  className={`absolute top-3 right-1/2 -left-1/2 h-px ${done || current ? "bg-pen" : "bg-rule"}`}
                />
              )}
              <button
                type="button"
                disabled={pending || strictOrder || current}
                onClick={() => go(i)}
                aria-current={current ? "step" : undefined}
                className="group relative flex flex-col items-center gap-1.5 px-1 disabled:cursor-default"
              >
                <span
                  className={`flex size-6 items-center justify-center rounded-full border-2 text-xs font-semibold ${
                    current
                      ? "border-pen bg-surface text-pen ring-4 ring-pen-soft"
                      : done
                        ? "border-pen bg-pen text-surface"
                        : skipped
                          ? "border-dashed border-muted bg-paper text-muted"
                          : "border-rule bg-surface text-muted group-enabled:group-hover:border-pen"
                  }`}
                >
                  {i + 1}
                </span>
                <span
                  className={`text-center text-xs leading-tight ${
                    current ? "font-semibold text-ink" : "text-muted"
                  } ${skipped ? "line-through" : ""}`}
                >
                  {STAGE_LABELS[stage]}
                  {skipped && <span className="sr-only"> (skipped)</span>}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export function StageControls({ cycle }: { cycle: LearningCycle }) {
  const [pending, startTransition] = useTransition();
  if (cycle.completedAt) return null;

  const last = cycle.currentIndex === cycle.stages.length - 1;
  const next = cycle.stages[cycle.currentIndex + 1];

  return (
    <div className="flex flex-wrap items-center justify-end gap-3 border-t border-rule pt-5">
      {!last && (
        <button
          type="button"
          disabled={pending}
          onClick={() => startTransition(() => skipStage(cycle.id))}
          className="px-3 py-2 text-sm text-muted hover:text-ink"
        >
          Skip this stage
        </button>
      )}
      <button
        type="button"
        disabled={pending}
        onClick={() => startTransition(() => goToStage(cycle.id, cycle.currentIndex + 1))}
        className="rounded-md border border-pen px-4 py-2 text-sm font-semibold text-pen hover:bg-pen-soft disabled:opacity-50"
      >
        {last ? "Finish cycle" : `Continue to ${STAGE_LABELS[next].toLowerCase()}`}
      </button>
    </div>
  );
}
