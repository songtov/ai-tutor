import type { LearningCycle } from "@/lib/api";
import { STAGE_LABELS } from "@/lib/format";

// Compact, read-only view of where a cycle is.
export function StageProgress({ cycle }: { cycle: LearningCycle }) {
  return (
    <ol className="flex gap-1" aria-label="Stages">
      {cycle.stages.map((stage, i) => {
        const skipped = cycle.skipped.includes(i);
        const done = cycle.completedAt !== null || i < cycle.currentIndex;
        return (
          <li
            key={i}
            title={`${STAGE_LABELS[stage]}${skipped ? " (skipped)" : ""}`}
            className={`h-1.5 flex-1 rounded-full ${
              skipped
                ? "border border-dashed border-muted"
                : done
                  ? "bg-pen"
                  : i === cycle.currentIndex
                    ? "bg-pen/40"
                    : "bg-rule"
            }`}
          >
            <span className="sr-only">
              {STAGE_LABELS[stage]}: {skipped ? "skipped" : done ? "done" : "not done"}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
