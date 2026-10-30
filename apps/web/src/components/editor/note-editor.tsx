"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useRouter } from "next/navigation";

import { BlockId, NoteMarks } from "@/components/editor/extensions";
import type { NoteBlock } from "@/lib/api";
import { blocksToDoc, docToBlocks } from "@/lib/note-doc";

// Like Apple Notes, the first line of the note is its title.
export function NoteEditor({
  initialTitle,
  initialBlocks,
  known,
  onBlocksChange,
  onTitleCommit,
}: {
  initialTitle: string;
  initialBlocks: NoteBlock[];
  known: Set<string>;
  onBlocksChange: (blocks: NoteBlock[]) => void;
  // Called whenever the cursor is off the first line, and on blur.
  onTitleCommit: (title: string) => void;
}) {
  const router = useRouter();

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
    content: {
      type: "doc",
      content: [
        { type: "paragraph", content: initialTitle ? [{ type: "text", text: initialTitle }] : [] },
        ...(blocksToDoc(initialBlocks).content ?? []),
      ],
    },
    editorProps: { attributes: { class: "note-editor", "aria-label": "Note" } },
    onUpdate: ({ editor }) => {
      const [, ...body] = docToBlocks(editor.getJSON());
      onBlocksChange(body);
    },
    onSelectionUpdate: ({ editor }) => {
      if (editor.state.selection.$anchor.index(0) !== 0) onTitleCommit(editor.state.doc.firstChild?.textContent.trim() ?? "");
    },
    onBlur: ({ editor }) => onTitleCommit(editor.state.doc.firstChild?.textContent.trim() ?? ""),
  });

  return <EditorContent editor={editor} />;
}
