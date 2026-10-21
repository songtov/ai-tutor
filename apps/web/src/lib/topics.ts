import type { Topic } from "@/lib/api";

export function sortByTitle(topics: Topic[]): Topic[] {
  return topics.toSorted((a, b) => a.title.localeCompare(b.title));
}

// "#Calculus Exam" -> "calculus-exam"
export function toTagName(input: string): string {
  return input.trim().replace(/^#+/, "").trim().toLowerCase().replace(/\s+/g, "-");
}
