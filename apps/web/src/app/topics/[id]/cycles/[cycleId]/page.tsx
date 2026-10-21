import Link from "next/link";
import { notFound } from "next/navigation";

import { ChatPanel } from "@/components/cycle/chat-panel";
import { FeedbackPanel } from "@/components/cycle/feedback-panel";
import { MaterialsPanel } from "@/components/cycle/materials-panel";
import { NextTopicPanel } from "@/components/cycle/next-topic-panel";
import { NotesPanel } from "@/components/cycle/notes-panel";
import { QuizPanel } from "@/components/cycle/quiz-panel";
import { ReviewPanel } from "@/components/cycle/review-panel";
import { StageControls, StageStepper } from "@/components/cycle/stage-stepper";
import { api, type LearningCycle, type Settings, type Topic } from "@/lib/api";
import { formatDate, METHOD_LABELS, STAGE_LABELS } from "@/lib/format";

async function StagePanel({ cycle, topic, settings }: { cycle: LearningCycle; topic: Topic; settings: Settings }) {
  switch (cycle.stages[cycle.currentIndex]) {
    case "chat":
      return <ChatPanel cycleId={cycle.id} messages={await api.listMessages(cycle.id)} />;
    case "materials":
      return <MaterialsPanel topicTitle={topic.title} materials={await api.listMaterials(cycle.id)} />;
    case "quiz":
      return <QuizPanel cycleId={cycle.id} topicTitle={topic.title} attempts={await api.listAttempts(cycle.id)} />;
    case "feedback": {
      const attempt = (await api.listAttempts(cycle.id)).at(-1) ?? null;
      const feedback = attempt ? await api.getFeedback(attempt.id) : null;
      return <FeedbackPanel attempt={attempt} feedback={feedback} />;
    }
    case "notes": {
      const note = (await api.listNotes(topic.id)).find((n) => n.cycleId === cycle.id);
      const attempt = (await api.listAttempts(cycle.id)).at(-1);
      const feedback = attempt ? await api.getFeedback(attempt.id) : null;
      const draft = feedback ? `${feedback.known.join(" ")}\n\nStill shaky: ${feedback.missing.join(" ")}` : "";
      return <NotesPanel topicId={topic.id} cycleId={cycle.id} initialBody={note?.body ?? draft} saved={!!note} />;
    }
    case "review":
      return <ReviewPanel topicId={topic.id} schedule={await api.getReviewSchedule(topic.id)} />;
    case "next_topic":
      return (
        <NextTopicPanel
          cycle={cycle}
          defaultMethod={settings.defaultMethod}
          suggestions={await api.suggestNextTopics(topic.id)}
        />
      );
  }
}

export default async function CyclePage(props: PageProps<"/topics/[id]/cycles/[cycleId]">) {
  const { id, cycleId } = await props.params;
  const [topic, cycle, settings] = await Promise.all([api.getTopic(id), api.getCycle(cycleId), api.getSettings()]);
  if (!topic || !cycle || cycle.topicId !== id) notFound();

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8">
      <header className="flex flex-col gap-1">
        <Link href={`/topics/${id}`} className="text-sm text-muted hover:text-pen">
          {topic.title}
        </Link>
        <h1 className="font-serif text-4xl font-semibold tracking-tight">
          {STAGE_LABELS[cycle.stages[cycle.currentIndex]]}
        </h1>
        <p className="text-sm text-muted">
          {METHOD_LABELS[cycle.method]} cycle, started {formatDate(cycle.startedAt)}
          {cycle.completedAt && `, finished ${formatDate(cycle.completedAt)}`}.
          {settings.strictOrder && " Strict order is on."}
        </p>
      </header>

      <StageStepper cycle={cycle} strictOrder={settings.strictOrder} />

      <StagePanel key={`${cycle.id}-${cycle.currentIndex}`} cycle={cycle} topic={topic} settings={settings} />

      <StageControls cycle={cycle} />
    </div>
  );
}
