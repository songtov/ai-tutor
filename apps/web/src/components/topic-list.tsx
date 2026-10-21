"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import type { Topic } from "@/lib/api";

export function TopicList({ topics }: { topics: Topic[] }) {
  const pathname = usePathname();
  const activeId = pathname.match(/^\/notes\/([^/]+)/)?.[1] ?? null;
  return (
    <ul className="flex flex-col gap-0.5">
      {topics.map((topic) => {
        const active = topic.id === activeId;
        return (
          <li key={topic.id}>
            <Link
              href={`/notes/${topic.id}`}
              aria-current={active ? "page" : undefined}
              className={`block rounded px-1.5 py-0.5 text-sm ${
                active ? "bg-pen-soft font-semibold text-pen" : "text-ink hover:text-pen"
              }`}
            >
              {topic.title}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
