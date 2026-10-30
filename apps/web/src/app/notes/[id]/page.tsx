import { notFound } from "next/navigation";

import { NoteWorkspace } from "@/components/note-workspace";
import { api } from "@/lib/api";

export default async function NotePage(props: PageProps<"/notes/[id]">) {
  const { id } = await props.params;
  const topic = await api.getTopic(id);
  if (!topic) notFound();

  const topics = await api.listTopics();

  return (
    <NoteWorkspace
      // Remount when the note changes so local state starts from the saved body.
      key={topic.id}
      topic={topic}
      index={Object.fromEntries(topics.map((t) => [t.title.toLowerCase(), t.id]))}
    />
  );
}
