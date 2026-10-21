"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import type { Topic } from "@/lib/api";

function TopicNode({ topic, topics, activeId }: { topic: Topic; topics: Topic[]; activeId: string | null }) {
  const children = topics.filter((t) => t.parentId === topic.id);
  const [open, setOpen] = useState(true);
  const active = topic.id === activeId;

  return (
    <li>
      <div className="flex items-center gap-1">
        {children.length > 0 ? (
          <button
            type="button"
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-label={`${open ? "Collapse" : "Expand"} ${topic.title}`}
            className="flex size-5 items-center justify-center rounded text-muted hover:text-ink"
          >
            <svg viewBox="0 0 10 10" className={`size-2.5 transition-transform ${open ? "rotate-90" : ""}`}>
              <path d="M3 1.5 7 5 3 8.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </button>
        ) : (
          <span className="size-5" />
        )}
        <Link
          href={`/topics/${topic.id}`}
          aria-current={active ? "page" : undefined}
          className={`rounded px-1.5 py-0.5 text-sm ${
            active ? "bg-pen-soft font-semibold text-pen" : "text-ink hover:text-pen"
          }`}
        >
          {topic.title}
        </Link>
      </div>
      {open && children.length > 0 && (
        <ul className="ml-2.5 border-l border-rule pl-2">
          {children.map((child) => (
            <TopicNode key={child.id} topic={child} topics={topics} activeId={activeId} />
          ))}
        </ul>
      )}
    </li>
  );
}

export function TopicTree({ topics }: { topics: Topic[] }) {
  const pathname = usePathname();
  const activeId = pathname.match(/^\/topics\/([^/]+)/)?.[1] ?? null;
  return (
    <ul className="flex flex-col gap-0.5">
      {topics
        .filter((t) => t.parentId === null)
        .map((topic) => (
          <TopicNode key={topic.id} topic={topic} topics={topics} activeId={activeId} />
        ))}
    </ul>
  );
}
