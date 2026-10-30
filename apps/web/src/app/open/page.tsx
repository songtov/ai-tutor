import { redirect } from "next/navigation";

import { api } from "@/lib/api";

// Following an unresolved [[link]] opens the note, creating it first if needed.
export default async function OpenPage(props: PageProps<"/open">) {
  const { title } = await props.searchParams;
  if (typeof title !== "string" || !title.trim()) redirect("/");
  const topic = (await api.findTopicByTitle(title)) ?? (await api.createTopic(title));
  redirect(`/notes/${topic.id}`);
}
