import type { JSONContent } from "@tiptap/react";

import type { NoteBlock } from "@/lib/api";

// Notes are stored as blocks of Markdown-like text, each with an id that cues attach to.
// The editor holds one continuous document; each top-level node carries its block's id.

function inlineToJson(text: string): JSONContent[] {
  const out: JSONContent[] = [];
  text.split("\n").forEach((line, i) => {
    if (i > 0) out.push({ type: "hardBreak" });
    for (const part of line.split(/(\*\*[^*]+\*\*)/)) {
      if (!part) continue;
      const bold = part.match(/^\*\*([^*]+)\*\*$/);
      out.push(bold ? { type: "text", text: bold[1], marks: [{ type: "bold" }] } : { type: "text", text: part });
    }
  });
  return out;
}

function inlineToText(content: JSONContent[] = []): string {
  return content
    .map((n) => {
      if (n.type === "hardBreak") return "\n";
      const text = n.text ?? inlineToText(n.content);
      return n.marks?.some((m) => m.type === "bold") ? `**${text}**` : text;
    })
    .join("");
}

export function blocksToDoc(blocks: NoteBlock[]): JSONContent {
  const content = blocks.map((b): JSONContent => {
    const attrs = { blockId: b.id };
    const heading = b.text.match(/^(#{1,3})\s+(.*)$/);
    if (heading) return { type: "heading", attrs: { ...attrs, level: heading[1].length }, content: inlineToJson(heading[2]) };
    const lines = b.text.split("\n");
    if (lines.every((l) => /^\s*[-*]\s/.test(l))) {
      return {
        type: "bulletList",
        attrs,
        content: lines.map((l) => ({
          type: "listItem",
          content: [{ type: "paragraph", content: inlineToJson(l.replace(/^\s*[-*]\s/, "")) }],
        })),
      };
    }
    if (lines.every((l) => /^>\s?/.test(l))) {
      return {
        type: "blockquote",
        attrs,
        content: [{ type: "paragraph", content: inlineToJson(lines.map((l) => l.replace(/^>\s?/, "")).join("\n")) }],
      };
    }
    return { type: "paragraph", attrs, content: inlineToJson(b.text) };
  });
  return { type: "doc", content: content.length ? content : [{ type: "paragraph" }] };
}

function nodeToText(node: JSONContent): string {
  switch (node.type) {
    case "heading":
      return `${"#".repeat(node.attrs?.level ?? 2)} ${inlineToText(node.content)}`;
    case "bulletList":
    case "orderedList":
      return (node.content ?? []).map((item) => `- ${(item.content ?? []).map(nodeToText).join(" ")}`).join("\n");
    case "blockquote":
      return (node.content ?? []).map((p) => `> ${nodeToText(p)}`).join("\n");
    default:
      return inlineToText(node.content);
  }
}

export function docToBlocks(doc: JSONContent): NoteBlock[] {
  return (doc.content ?? []).map((node) => ({ id: node.attrs?.blockId as string, text: nodeToText(node) }));
}
