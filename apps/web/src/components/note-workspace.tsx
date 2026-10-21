"use client";

import type { Editor } from "@tiptap/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";

import { renameNote, saveNote, suggestCues } from "@/app/actions";
import { CornellTest } from "@/components/cornell/cornell-test";
import { NoteEditor } from "@/components/editor/note-editor";
import { Drawer, type DrawerTab } from "@/components/study/drawer";
import type { Attempt, CueSuggestion, Feedback, Material, NoteDoc, Question, ReviewSchedule, Topic } from "@/lib/api";
import { dueLabel, formatDate } from "@/lib/format";
import { bodyOf, parseLinks, type NoteIndex } from "@/lib/notes";

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
  const [title, setTitle] = useState(topic.title);
  const [titleError, setTitleError] = useState<string | null>(null);
  const [suggesting, startSuggest] = useTransition();
  const [, startRename] = useTransition();
  const lastSaved = useRef(JSON.stringify(doc));
  const [showCues, setShowCues] = useState(true);
  const editorRef = useRef<Editor | null>(null);

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

  // Inserts a prompt (a quote block) at the end of the note; the learner writes the answer.
  const addToNote = (text: string) => {
    const editor = editorRef.current;
    if (!editor) return;
    const quote = text.replace(/^>\s?/, "").trim();
    editor
      .chain()
      .insertContentAt(editor.state.doc.content.size, {
        type: "blockquote",
        content: [{ type: "paragraph", content: [{ type: "text", text: quote }] }],
      })
      .run();
  };

  const counts: Record<DrawerTab, number> = {
    materials: props.materials.length,
    questions: props.questions.length,
    links: parseLinks(body).length + props.backlinks.length,
  };

  return (
    <div className={`mx-auto flex flex-col gap-6 ${showCues ? "max-w-5xl" : "max-w-3xl"}`}>
      <header className="flex flex-col gap-3 border-b border-rule pb-3">
        <h1 className="sr-only">{title}</h1>
        <input
          aria-label="Note title"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            setTitleError(null);
          }}
          onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
          onBlur={() => {
            const next = title.trim();
            if (!next || next === topic.title) return setTitle(topic.title);
            startRename(async () => {
              const error = await renameNote(topic.id, next);
              if (error) {
                setTitleError(error);
                setTitle(topic.title);
              }
            });
          }}
          className="w-full bg-transparent font-serif text-3xl font-semibold tracking-tight outline-none md:text-4xl"
        />
        {titleError && <p className="text-sm text-red-600 dark:text-red-400">{titleError}</p>}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
          {props.review ? (
            <span className={due ? "highlight" : undefined}>Review {dueLabel(props.review.dueAt).toLowerCase()}</span>
          ) : (
            <span>Not tested yet</span>
          )}
          {lastTest?.feedback && (
            <span>
              Last test {formatDate(lastTest.attempt.createdAt)}:{" "}
              {lastTest.feedback.results.reduce((n, r) => n + r.missing.length, 0)} gaps
            </span>
          )}
          <span className="ml-auto text-xs">{saved ? "Saved" : "Saving…"}</span>
        </div>
        {!testing && (
          <nav aria-label="Note tools" className="-ml-2 flex flex-wrap items-center gap-1 text-sm">
            <button
              type="button"
              disabled={doc.cues.length === 0}
              title={doc.cues.length === 0 ? "Add a cue first: Test me asks you the cues" : undefined}
              onClick={() => setTesting(true)}
              className="rounded-md bg-pen px-3 py-1.5 font-semibold text-surface hover:opacity-90 disabled:opacity-40"
            >
              Test me
            </button>
            <button
              type="button"
              disabled={suggesting}
              onClick={() => startSuggest(async () => setSuggestions(await suggestCues(topic.id)))}
              title="Suggest questions for paragraphs without a cue"
              className="rounded-md px-2 py-1.5 text-pen hover:bg-pen-soft disabled:opacity-40"
            >
              ✦ Suggest cues
            </button>
            <span aria-hidden className="mx-1 h-4 w-px bg-rule" />
            {(["materials", "questions", "links"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                aria-pressed={drawer === tab}
                onClick={() => setDrawer(drawer === tab ? null : tab)}
                className={`rounded-md px-2 py-1.5 capitalize ${
                  drawer === tab ? "bg-pen-soft font-semibold text-pen" : "text-muted hover:bg-pen-soft hover:text-ink"
                }`}
              >
                {tab}
                {counts[tab] > 0 && <span className="ml-1 text-xs">{counts[tab]}</span>}
              </button>
            ))}
            <button
              type="button"
              aria-pressed={showCues}
              onClick={() => setShowCues(!showCues)}
              title={showCues ? "Hide the cue column" : "Show the cue column"}
              className="ml-auto rounded-md px-2 py-1.5 text-muted hover:bg-pen-soft hover:text-ink"
            >
              {showCues ? "Hide cues ⇥" : "⇤ Cues"}
            </button>
          </nav>
        )}
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
        <>
          <NoteEditor
            initialBlocks={doc.blocks}
            known={new Set(Object.keys(props.index))}
            cues={doc.cues}
            suggestions={suggestions}
            showCues={showCues}
            editorRef={editorRef}
            onBlocksChange={(blocks) => setDoc((d) => ({ ...d, blocks }))}
            onCuesChange={(cues) => setDoc((d) => ({ ...d, cues }))}
            onDismissSuggestion={(blockId) => setSuggestions((all) => all.filter((s) => s.blockId !== blockId))}
            onAsk={(text) => {
              setQuote(text);
              setDrawer("questions");
            }}
          />
          <section className="flex flex-col gap-1 border-t border-rule pt-4">
            <label htmlFor="summary" className="text-sm font-semibold text-muted">
              Summary
            </label>
            <textarea
              id="summary"
              value={doc.summary}
              onChange={(e) => setDoc((d) => ({ ...d, summary: e.target.value }))}
              placeholder="The whole note in two or three sentences, in your own words."
              rows={2}
              className="field-sizing-content min-h-12 w-full resize-none bg-transparent font-serif text-base leading-relaxed outline-none placeholder:text-muted/70 md:text-lg"
            />
          </section>
        </>
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
