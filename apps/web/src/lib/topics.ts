import type { Topic } from "@/lib/api";

export function ancestorsOf(topic: Topic, topics: Topic[]): Topic[] {
  const ancestors: Topic[] = [];
  for (let p = topic.parentId; p; ) {
    const parent = topics.find((t) => t.id === p);
    if (!parent) break;
    ancestors.unshift(parent);
    p = parent.parentId;
  }
  return ancestors;
}

export function pathLabel(topic: Topic, topics: Topic[]): string {
  return ancestorsOf(topic, topics)
    .map((t) => t.title)
    .join(" › ");
}

// "#Calculus Exam" -> "calculus-exam"
export function toTagName(input: string): string {
  return input.trim().replace(/^#+/, "").trim().toLowerCase().replace(/\s+/g, "-");
}
