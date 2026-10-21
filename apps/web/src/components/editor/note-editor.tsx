"use client";

import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type RefObject } from "react";

import { BlockId, NoteMarks } from "@/components/editor/extensions";
import type { Cue, CueSuggestion, NoteBlock } from "@/lib/api";
import { blocksToDoc, docToBlocks } from "@/lib/note-doc";
import { noteStatements } from "@/lib/notes";

const CUE_WIDTH = "w-[32%] md:w-60";
const newId = (prefix: string) => `${prefix}-${crypto.randomUUID()}`;

function CueItem({
  block,
  cue,
  suggestion,
  active,
  onSave,
  onRemove,
  onAccept,
  onDismiss,
}: {
  block: NoteBlock;
  cue: Cue | undefined;
  suggestion: CueSuggestion | undefined;
  active: boolean;
  onSave: (question: string) => void;
  onRemove: () => void;
  onAccept: () => void;
  onDismiss: () => void;
}) {
  const [adding, setAdding] = useState(false);
  const field = "field-sizing-content w-full resize-none bg-transparent text-xs leading-snug font-semibold outline-none md:text-sm";

  if (cue) {
    return (
      <div className="flex items-start gap-1">
        <textarea
          aria-label="Cue"
          defaultValue={cue.question}
          onBlur={(e) => (e.target.value.trim() ? onSave(e.target.value) : onRemove())}
          rows={1}
          className={field}
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
          <button type="button" onClick={onAccept} className="text-pen hover:underline">
            Use
          </button>
          <button type="button" onClick={onDismiss} className="text-muted hover:text-ink">
            Dismiss
          </button>
        </span>
      </div>
    );
  }
  if (adding) {
    return (
      <textarea
        autoFocus
        rows={1}
        aria-label="New cue"
        placeholder="A question this answers"
        onBlur={(e) => {
          if (e.target.value.trim()) onSave(e.target.value.trim());
          setAdding(false);
        }}
        onKeyDown={(e) => e.key === "Enter" && !e.nativeEvent.isComposing && (e.preventDefault(), e.currentTarget.blur())}
        className={`${field} placeholder:font-normal placeholder:text-muted`}
      />
    );
  }
  if (!active || noteStatements(block.text).length === 0) return null;
  return (
    <button type="button" onClick={() => setAdding(true)} className="text-xs text-muted hover:text-pen md:text-sm">
      + Cue
    </button>
  );
}

export function NoteEditor({
  initialBlocks,
  known,
  cues,
  suggestions,
  showCues,
  editorRef,
  onBlocksChange,
  onCuesChange,
  onDismissSuggestion,
  onAsk,
}: {
  initialBlocks: NoteBlock[];
  known: Set<string>;
  cues: Cue[];
  suggestions: CueSuggestion[];
  showCues: boolean;
  editorRef: RefObject<Editor | null>;
  onBlocksChange: (blocks: NoteBlock[]) => void;
  onCuesChange: (cues: Cue[]) => void;
  onDismissSuggestion: (blockId: string) => void;
  onAsk: (quote: string) => void;
}) {
  const router = useRouter();
  const [blocks, setBlocks] = useState(initialBlocks);
  const [tops, setTops] = useState<Record<string, number>>({});
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selection, setSelection] = useState<{ text: string; top: number; left: number } | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const cueRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ link: false, underline: false, codeBlock: false, code: false, strike: false }),
      BlockId,
      NoteMarks.configure({
        known,
        onOpenLink: (title) => router.push(`/open?title=${encodeURIComponent(title)}`),
        onOpenTag: (tag) => router.push(`/tags/${tag}`),
      }),
    ],
    content: blocksToDoc(initialBlocks),
    editorProps: { attributes: { class: "note-editor", "aria-label": "Note" } },
    onUpdate: ({ editor }) => {
      const next = docToBlocks(editor.getJSON());
      setSelection(null);
      setBlocks(next);
      onBlocksChange(next);
    },
    onSelectionUpdate: ({ editor }) => {
      if (editor.state.selection.empty) setSelection(null);
      setActiveId((editor.state.selection.$from.node(1)?.attrs.blockId as string | undefined) ?? null);
    },
  });

  useEffect(() => {
    editorRef.current = editor;
  }, [editor, editorRef]);

  // Line each cue up with its block, pushing cues down so they never overlap.
  useEffect(() => {
    const box = boxRef.current;
    if (!editor || !box) return;
    const measure = () => {
      const next: Record<string, number> = {};
      let floor = 0;
      for (const el of Array.from(editor.view.dom.children) as HTMLElement[]) {
        const id = el.dataset.blockId;
        if (!id) continue;
        const top = Math.max(el.offsetTop, floor);
        next[id] = top;
        const cue = cueRefs.current[id];
        if (cue?.offsetHeight) floor = top + cue.offsetHeight + 8;
      }
      setTops((prev) => (JSON.stringify(prev) === JSON.stringify(next) ? prev : next));
    };
    const observer = new ResizeObserver(measure);
    observer.observe(editor.view.dom);
    Object.values(cueRefs.current).forEach((el) => el && observer.observe(el));
    const frame = requestAnimationFrame(measure);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [editor, blocks, cues, suggestions, activeId, showCues]);

  const onMouseUp = () => {
    const sel = window.getSelection();
    const text = sel?.toString().trim() ?? "";
    const box = boxRef.current;
    if (!sel || !text || !box || !editor?.view.dom.contains(sel.anchorNode)) {
      setSelection(null);
      return;
    }
    const rect = sel.getRangeAt(0).getBoundingClientRect();
    const outer = box.getBoundingClientRect();
    setSelection({ text, top: rect.bottom - outer.top + 6, left: rect.left - outer.left });
  };

  return (
    <div ref={boxRef} onMouseUp={onMouseUp} className="relative">
      <div className={showCues ? "pr-[34%] md:pr-64" : ""}>
        <EditorContent editor={editor} />
      </div>

      {showCues && (
        <div aria-label="Cues" className={`absolute inset-y-0 right-0 border-l border-rule ${CUE_WIDTH}`}>
          {blocks.map((block) => (
            <div
              key={block.id}
              ref={(el) => {
                cueRefs.current[block.id] = el;
              }}
              style={{ top: tops[block.id] ?? 0 }}
              className="absolute inset-x-0 pt-1 pl-3 md:pl-5"
            >
              <CueItem
                block={block}
                cue={cues.find((c) => c.blockId === block.id)}
                suggestion={suggestions.find((s) => s.blockId === block.id)}
                active={block.id === activeId}
                onSave={(question) => {
                  const existing = cues.find((c) => c.blockId === block.id);
                  onCuesChange(
                    existing
                      ? cues.map((c) => (c === existing ? { ...c, question } : c))
                      : [...cues, { id: newId("c"), blockId: block.id, question, origin: "learner" }],
                  );
                }}
                onRemove={() => onCuesChange(cues.filter((c) => c.blockId !== block.id))}
                onAccept={() => {
                  const s = suggestions.find((x) => x.blockId === block.id)!;
                  onCuesChange([...cues, { id: newId("c"), blockId: block.id, question: s.question, origin: "ai" }]);
                  onDismissSuggestion(block.id);
                }}
                onDismiss={() => onDismissSuggestion(block.id)}
              />
            </div>
          ))}
        </div>
      )}

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
