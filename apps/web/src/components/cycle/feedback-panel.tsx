import type { Attempt, Feedback } from "@/lib/api";

export function FeedbackPanel({ attempt, feedback }: { attempt: Attempt | null; feedback: Feedback | null }) {
  if (!attempt || !feedback) {
    return <p className="text-muted">Take the blank quiz first. Feedback is based on what you write from memory.</p>;
  }

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-2">
        <h3 className="text-sm text-muted">What you wrote</h3>
        {attempt.answerText && (
          <blockquote className="border-l-2 border-pen pl-4 font-serif text-lg text-pen">{attempt.answerText}</blockquote>
        )}
        {attempt.photoKeys.length > 0 && (
          <p className="text-sm text-muted">{attempt.photoKeys.join(", ")}</p>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">What you know</h3>
        <ul className="flex list-disc flex-col gap-2 pl-5">
          {feedback.known.map((k) => (
            <li key={k}>{k}</li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">What&apos;s missing</h3>
        <ul className="flex flex-col gap-2">
          {feedback.missing.map((m) => (
            <li key={m}>
              <span className="highlight leading-loose">{m}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">You should now be able to answer</h3>
        <ol className="flex list-decimal flex-col gap-2 pl-5 font-serif text-lg">
          {feedback.nextQuestions.map((q) => (
            <li key={q}>{q}</li>
          ))}
        </ol>
      </section>
    </div>
  );
}
