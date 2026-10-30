import Link from "next/link";
import { redirect } from "next/navigation";

import { api } from "@/lib/api";

// Takes the learner through due notes one at a time.
export default async function ReviewPage() {
  const [next] = await api.listDueReviews();
  if (next) redirect(`/notes/${next.topicId}?test=1&from=review`);

  return (
    <div className="mx-auto flex max-w-xl flex-col items-start gap-4 py-16">
      <h1 className="font-serif text-4xl font-semibold tracking-tight">All caught up</h1>
      <p className="text-lg text-muted">No notes are due for review today.</p>
      <Link href="/" className="font-semibold text-pen hover:underline">
        Back to Today
      </Link>
    </div>
  );
}
