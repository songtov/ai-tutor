"use client";

import { useTransition } from "react";

import { setMaterialPicked } from "@/app/actions";
import type { Material } from "@/lib/api";

const KIND_LABELS: Record<Material["kind"], string> = { video: "Video", article: "Article", other: "Link" };

export function MaterialsPanel({ topicTitle, materials }: { topicTitle: string; materials: Material[] }) {
  const [pending, startTransition] = useTransition();
  const picked = materials.filter((m) => m.picked).length;

  return (
    <div className="flex flex-col gap-5">
      <p className="text-muted">
        Found {materials.length} materials for {topicTitle}. Pick the ones you want to study. You picked {picked}.
      </p>
      <ul className="flex flex-col gap-3">
        {materials.map((m) => (
          <li
            key={m.id}
            className={`flex flex-wrap items-center gap-4 rounded-lg border bg-surface p-4 ${
              m.picked ? "border-pen" : "border-rule"
            }`}
          >
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <a href={m.url} target="_blank" rel="noreferrer" className="font-semibold hover:text-pen">
                {m.title}
              </a>
              <span className="text-sm text-muted">
                {KIND_LABELS[m.kind]} from {m.source}
              </span>
            </div>
            <button
              type="button"
              disabled={pending}
              aria-pressed={m.picked}
              onClick={() => startTransition(() => setMaterialPicked(m.id, !m.picked))}
              className={`rounded-md px-3 py-1.5 text-sm font-semibold ${
                m.picked ? "bg-pen text-surface" : "border border-rule text-ink hover:border-pen"
              }`}
            >
              {m.picked ? "Picked" : "Pick"}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
