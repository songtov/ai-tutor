import { notFound } from "next/navigation";

import { NoteWorkspace } from "@/components/note-workspace";
import { api } from "@/lib/api";

export default async function NotePage(props: PageProps<"/notes/[id]">) {
  const { id } = await props.params;
  const search = await props.searchParams;
  const topic = await api.getTopic(id);
  if (!topic) notFound();

  const [topics, review, attempts, materials, questions, backlinks] = await Promise.all([
    api.listTopics(),
    api.getReviewSchedule(id),
    api.listAttempts(id),
    api.listMaterials(id),
    api.listQuestions(id),
    api.listBacklinks(id),
  ]);

  return (
    <NoteWorkspace
      // Remount when the note changes so local state starts from the saved body.
      key={`${topic.id}-${search.test ?? ""}`}
      topic={topic}
      index={Object.fromEntries(topics.map((t) => [t.title.toLowerCase(), t.id]))}
      review={review}
      attempts={attempts}
      materials={materials}
      questions={questions}
      backlinks={backlinks}
      startInTest={search.test === "1"}
      fromReview={search.from === "review"}
    />
  );
}
