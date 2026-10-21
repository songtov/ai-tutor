import type { Topic } from "@/lib/api";

export function sortByTitle(topics: Topic[]): Topic[] {
  return topics.toSorted((a, b) => a.title.localeCompare(b.title));
}

