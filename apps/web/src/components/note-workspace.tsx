"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";

import { saveNote, suggestCues } from "@/app/actions";
import { CornellNote } from "@/components/cornell/cornell-note";
import { CornellTest } from "@/components/cornell/cornell-test";
import type { NoteIndex } from "@/components/note-view";
import { Drawer, type DrawerTab } from "@/components/study/drawer";
import type { Attempt, CueSuggestion, Feedback, Material, NoteDoc, Question, ReviewSchedule, Topic } from "@/lib/api";
import { dueLabel, formatDate } from "@/lib/format";
import { bodyOf, parseLinks } from "@/lib/notes";

export function NoteWorkspace(props: {
  topic: Topic;
  index: NoteIndex;
  review: ReviewSchedule | null;
  attempts: { attempt: Attempt; feedback: Feedback | null }[];
  materials: Material[];
  questions: Question[];
  backlinks: Topic[];
  startInTest: boolean;
  fromReview: boolean;
}) {
  const { topic } = props;
  const router = useRouter();
  const [doc, setDoc] = useState<NoteDoc>({ blocks: topic.blocks, cues: topic.cues, summary: topic.summary });
  const [testing, setTesting] = useState(props.startInTest && topic.cues.length > 0);
  const [drawer, setDrawer] = useState<DrawerTab | null>(null);
  const [quote, setQuote] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<CueSuggestion[]>([]);
  const [saved, setSaved] = useState(true);
  const [suggesting, startSuggest] = useTransition();
  const lastSaved = useRef(JSON.stringify(doc));

  // Autosave, like any note app. Each save keeps the previous version.
  useEffect(() => {
    const json = JSON.stringify(doc);
    if (json === lastSaved.current) return;
    const timer = setTimeout(async () => {
      setSaved(false);
      await saveNote(topic.id, doc);
      lastSaved.current = json;
      setSaved(true);
    }, 700);
    return () => clearTimeout(timer);
  }, [doc, topic.id]);

  const body = bodyOf(doc.blocks);
  const lastTest = props.attempts.at(-1);
  const due = props.review && new Date(props.review.dueAt) <= new Date();

  const addToNote = (text: string) =>
    setDoc((d) => ({ ...d, blocks: [...d.blocks, { id: `b-${crypto.randomUUID()}`, text: text.trim() }] }));

  const counts: Record<DrawerTab, number> = {
    materials: props.materials.length,
    questions: props.questions.length,
    links: parseLinks(body).length + props.backlinks.length,
  };

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-5">
      <header className="flex flex-col gap-3">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h1 className="font-serif text-4xl font-semibold tracking-tight">{topic.title}</h1>
          <span className="text-xs text-muted">{saved ? `Saved. Edited ${formatDate(topic.updatedAt)}` : "Saving…"}</span>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          {!testing && (
            <button
              type="button"
              disabled={doc.cues.length === 0}
              title={doc.cues.length === 0 ? "Add a cue first: Test me asks you the cues" : undefined}
              onClick={() => setTesting(true)}
              className="rounded-md bg-pen px-4 py-2 text-sm font-semibold text-surface hover:opacity-90 disabled:opacity-40"
            >
              Test me
            </button>
          )}
          <span className="text-sm">
            {props.review ? (
              <span className={due ? "highlight" : "text-muted"}>Review {dueLabel(props.review.dueAt).toLowerCase()}</span>
            ) : (
              <span className="text-muted">Not tested yet</span>
            )}
            {lastTest?.feedback && !testing && (
              <span className="text-muted">
                {" "}
                Last test {formatDate(lastTest.attempt.createdAt)}:{" "}
                {lastTest.feedback.results.reduce((n, r) => n + r.missing.length, 0)} gaps.
              </span>
            )}
          </span>
          {!testing && (
            <div className="ml-auto flex gap-1">
              {(["materials", "questions", "links"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  aria-pressed={drawer === tab}
                  onClick={() => setDrawer(drawer === tab ? null : tab)}
                  className={`rounded-md px-3 py-1.5 text-sm capitalize ${
                    drawer === tab ? "bg-pen-soft font-semibold text-pen" : "text-muted hover:bg-pen-soft hover:text-ink"
                  }`}
                >
                  {tab}
                  {counts[tab] > 0 && <span className="ml-1 text-xs">{counts[tab]}</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      {testing ? (
        <CornellTest
          topicId={topic.id}
          doc={doc}
          onDone={() => {
            setTesting(false);
            if (props.fromReview) router.push("/review");
          }}
        />
      ) : (
        <CornellNote
          doc={doc}
          index={props.index}
          suggestions={suggestions}
          onChange={setDoc}
          onDismissSuggestion={(blockId) => setSuggestions(suggestions.filter((s) => s.blockId !== blockId))}
          onSuggest={() => startSuggest(async () => setSuggestions(await suggestCues(topic.id)))}
          suggesting={suggesting}
          onAsk={(text) => {
            setQuote(text);
            setDrawer("questions");
          }}
        />
      )}

      {drawer && !testing && (
        <Drawer
          topic={topic}
          body={body}
          index={props.index}
          materials={props.materials}
          questions={props.questions}
          backlinks={props.backlinks}
          tab={drawer}
          onTab={setDrawer}
          onClose={() => setDrawer(null)}
          quote={quote}
          onClearQuote={() => setQuote(null)}
          onAddToNote={addToNote}
        />
      )}
    </div>
  );
}
