"use client";

import { useState, useTransition } from "react";

import { submitAttempt } from "@/app/actions";
import type { Attempt } from "@/lib/api";
import { formatDate } from "@/lib/format";

export function QuizPanel({
  cycleId,
  topicTitle,
  attempts,
}: {
  cycleId: string;
  topicTitle: string;
  attempts: Attempt[];
}) {
  const prompt = `Write down everything you remember about ${topicTitle}. Don't look at your materials.`;
  const [answer, setAnswer] = useState("");
  const [photos, setPhotos] = useState<{ name: string; url: string }[]>([]);
  const [pending, startTransition] = useTransition();

  const empty = !answer.trim() && photos.length === 0;

  return (
    <div className="flex flex-col gap-6">
      <p className="font-serif text-xl">{prompt}</p>

      <div className="rounded-lg border border-rule bg-surface px-5 py-3 shadow-[0_1px_0_var(--rule)]">
        <label htmlFor="quiz-answer" className="sr-only">
          Your answer
        </label>
        <textarea
          id="quiz-answer"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          rows={10}
          className="ruled w-full resize-y bg-transparent font-serif text-lg text-pen outline-none"
        />
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <label className="cursor-pointer rounded-md border border-dashed border-muted px-4 py-2 text-sm hover:border-pen hover:text-pen">
          Add a photo of handwritten work
          <input
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            onChange={(e) =>
              setPhotos([
                ...photos,
                ...Array.from(e.target.files ?? []).map((f) => ({ name: f.name, url: URL.createObjectURL(f) })),
              ])
            }
          />
        </label>
        {photos.map((photo) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={photo.url} src={photo.url} alt={photo.name} className="size-16 rounded-md border border-rule object-cover" />
        ))}
      </div>

      <button
        type="button"
        disabled={pending || empty}
        onClick={() =>
          startTransition(() =>
            submitAttempt(cycleId, {
              prompt,
              answerText: answer.trim() || null,
              photoKeys: photos.map((p) => p.name),
            }),
          )
        }
        className="self-start rounded-md bg-pen px-5 py-2 font-semibold text-surface disabled:opacity-40"
      >
        Submit for feedback
      </button>

      {attempts.length > 0 && (
        <section className="flex flex-col gap-3">
          <h3 className="text-sm text-muted">Earlier attempts in this cycle</h3>
          {attempts.toReversed().map((a) => (
            <article key={a.id} className="border-l-2 border-rule pl-4">
              <p className="text-sm text-muted">{formatDate(a.createdAt)}</p>
              {a.answerText && <p className="font-serif text-pen">{a.answerText}</p>}
              {a.photoKeys.length > 0 && (
                <p className="text-sm text-muted">{a.photoKeys.length} photo(s) attached</p>
              )}
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
