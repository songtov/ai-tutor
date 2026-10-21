"use client";

import { useRef, useState } from "react";

import { NoteView, type NoteIndex } from "@/components/note-view";
import type { CueSuggestion, NoteBlock, NoteDoc } from "@/lib/api";
import { noteStatements } from "@/lib/notes";

const newId = (prefix: string) => `${prefix}-${crypto.randomUUID()}`;

// The Cornell split: notes on the left, a cue column about a third wide on the right.
export const CORNELL_COLS = "grid-cols-[minmax(0,1fr)_32%] md:grid-cols-[minmax(0,1fr)_15rem]";

function CueCell({
  doc,
  block,
  suggestion,
  onChange,
  onDismiss,
}: {
  doc: NoteDoc;
  block: NoteBlock;
  suggestion: CueSuggestion | undefined;
  onChange: (doc: NoteDoc) => void;
  onDismiss: (blockId: string) => void;
}) {
  const cue = doc.cues.find((c) => c.blockId === block.id);
  const [adding, setAdding] = useState(false);
  const setCues = (cues: NoteDoc["cues"]) => onChange({ ...doc, cues });

  if (cue) {
    return (
      <div className="group/cue flex items-start gap-1">
        <label htmlFor={`cue-${cue.id}`} className="sr-only">
          Cue
        </label>
        <textarea
          id={`cue-${cue.id}`}
          value={cue.question}
          onChange={(e) => setCues(doc.cues.map((c) => (c.id === cue.id ? { ...c, question: e.target.value } : c)))}
          onBlur={(e) => !e.target.value.trim() && setCues(doc.cues.filter((c) => c.id !== cue.id))}
          rows={1}
          className="field-sizing-content w-full resize-none bg-transparent text-xs leading-snug font-semibold outline-none md:text-sm"
        />
        {cue.origin === "ai" && (
          <span title="Suggested by AI, accepted by you" className="text-xs text-muted">
            ✦
          </span>
        )}
      </div>
    );
  }

  if (suggestion) {
    return (
      <div className="flex flex-col gap-1.5 text-xs md:text-sm">
        <span className="text-muted italic">✦ {suggestion.question}</span>
        <span className="flex gap-3 text-xs font-semibold">
          <button
            type="button"
            onClick={() =>
              setCues([...doc.cues, { id: newId("c"), blockId: block.id, question: suggestion.question, origin: "ai" }])
            }
            className="text-pen hover:underline"
          >
            Use
          </button>
          <button type="button" onClick={() => onDismiss(block.id)} className="text-muted hover:text-ink">
            Dismiss
          </button>
        </span>
      </div>
    );
  }

  // Headings and hashtag lines have nothing to recall.
  if (!adding && noteStatements(block.text).length === 0) return null;

  if (adding) {
    return (
      <textarea
        autoFocus
        rows={1}
        aria-label="New cue"
        placeholder="A question this answers"
        onBlur={(e) => {
          const question = e.target.value.trim();
          if (question) setCues([...doc.cues, { id: newId("c"), blockId: block.id, question, origin: "learner" }]);
          setAdding(false);
        }}
        onKeyDown={(e) => e.key === "Enter" && !e.nativeEvent.isComposing && (e.preventDefault(), e.currentTarget.blur())}
        className="field-sizing-content w-full resize-none bg-transparent text-xs leading-snug font-semibold outline-none placeholder:font-normal placeholder:text-muted md:text-sm"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setAdding(true)}
      className="text-xs text-muted/70 hover:text-pen md:text-sm md:opacity-0 md:group-focus-within/row:opacity-100 md:group-hover/row:opacity-100 md:focus:opacity-100"
    >
      + Cue
    </button>
  );
}

export function CornellNote({
  doc,
  index,
  suggestions,
  onChange,
  onDismissSuggestion,
  onAsk,
}: {
  doc: NoteDoc;
  index: NoteIndex;
  suggestions: CueSuggestion[];
  onChange: (doc: NoteDoc) => void;
  onDismissSuggestion: (blockId: string) => void;
  onAsk: (quote: string) => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(doc.blocks.length === 1 && !doc.blocks[0].text ? doc.blocks[0].id : null);
  const [selection, setSelection] = useState<{ text: string; top: number; left: number } | null>(null);
  const sheetRef = useRef<HTMLDivElement>(null);

  const setBlocks = (blocks: NoteBlock[], cues = doc.cues) => onChange({ ...doc, blocks, cues });

  const onMouseUp = () => {
    const sel = window.getSelection();
    const text = sel?.toString().trim() ?? "";
    const sheet = sheetRef.current;
    const anchor = sel?.anchorNode?.parentElement;
    if (!sel || !text || !sheet || !anchor?.closest("[data-note-text]")) {
      setSelection(null);
      return;
    }
    const rect = sel.getRangeAt(0).getBoundingClientRect();
    const box = sheet.getBoundingClientRect();
    setSelection({ text, top: rect.bottom - box.top + 6, left: rect.left - box.left });
  };

  return (
    <div ref={sheetRef} onMouseUp={onMouseUp} className="relative">
      {doc.blocks.map((block, i) => (
        <div key={block.id} className={`group/row grid ${CORNELL_COLS}`}>
          <div className="py-1.5 pr-4 md:pr-8">
            {editingId === block.id ? (
              <textarea
                autoFocus
                aria-label="Note paragraph"
                value={block.text}
                placeholder={i === 0 ? "Write what you understand, in your own words. [[Link]] notes and add #hashtags." : ""}
                onChange={(e) => setBlocks(doc.blocks.map((b) => (b.id === block.id ? { ...b, text: e.target.value } : b)))}
                onBlur={() => setEditingId(null)}
                onKeyDown={(e) => {
                  const el = e.currentTarget;
                  const atEnd = el.selectionStart === el.value.length;
                  // A blank line ends the paragraph and starts the next one.
                  if (e.key === "Enter" && !e.nativeEvent.isComposing && atEnd && el.value.endsWith("\n")) {
                    e.preventDefault();
                    const next = { id: newId("b"), text: "" };
                    const blocks = doc.blocks.flatMap((b) =>
                      b.id === block.id ? [{ ...b, text: b.text.replace(/\n+$/, "") }, next] : [b],
                    );
                    setBlocks(blocks);
                    setEditingId(next.id);
                  }
                  if (e.key === "Backspace" && el.value === "" && doc.blocks.length > 1) {
                    e.preventDefault();
                    setBlocks(
                      doc.blocks.filter((b) => b.id !== block.id),
                      doc.cues.filter((c) => c.blockId !== block.id),
                    );
                    setEditingId(doc.blocks[Math.max(0, i - 1)].id);
                  }
                }}
                className="field-sizing-content min-h-8 w-full resize-none bg-transparent font-serif text-base leading-relaxed outline-none placeholder:text-muted/70 md:text-lg"
              />
            ) : (
              <div
                data-note-text
                onClick={(e) => {
                  if (!(e.target as HTMLElement).closest("a") && !window.getSelection()?.toString()) setEditingId(block.id);
                }}
                className="min-h-8 cursor-text"
              >
                {block.text.trim() ? (
                  <NoteView body={block.text} index={index} />
                ) : (
                  <span className="font-serif text-base text-muted/70 md:text-lg">Write here…</span>
                )}
              </div>
            )}
          </div>
          <div className="border-l border-rule py-2 pl-3 md:pl-5">
            <CueCell
              doc={doc}
              block={block}
              suggestion={suggestions.find((s) => s.blockId === block.id)}
              onChange={onChange}
              onDismiss={onDismissSuggestion}
            />
          </div>
        </div>
      ))}

      <div className={`grid ${CORNELL_COLS}`}>
        <div className="py-3 pr-4">
          <button
            type="button"
            onClick={() => {
              const next = { id: newId("b"), text: "" };
              setBlocks([...doc.blocks, next]);
              setEditingId(next.id);
            }}
            className="text-sm text-muted hover:text-pen"
          >
            + Paragraph
          </button>
        </div>
        <div className="min-h-16 border-l border-rule" />
      </div>

      <div className="flex flex-col gap-1 border-t border-rule pt-4">
        <label htmlFor="summary" className="text-sm font-semibold text-muted">
          Summary
        </label>
        <textarea
          id="summary"
          value={doc.summary}
          onChange={(e) => onChange({ ...doc, summary: e.target.value })}
          placeholder="The whole note in two or three sentences, in your own words."
          rows={2}
          className="field-sizing-content min-h-12 w-full resize-none bg-transparent font-serif text-base leading-relaxed outline-none placeholder:text-muted/70 md:text-lg"
        />
      </div>

      {selection && (
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            onAsk(selection.text);
            setSelection(null);
          }}
          style={{ top: selection.top, left: selection.left }}
          className="absolute z-10 rounded-md bg-ink px-3 py-1.5 text-sm font-semibold text-paper shadow-md"
        >
          Ask about this
        </button>
      )}
    </div>
  );
}
