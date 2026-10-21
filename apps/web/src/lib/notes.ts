// Links and hashtags live in the note text, like Obsidian.

// Lowercased titles of existing notes, mapped to their ids.
export type NoteIndex = Record<string, string>;

export const LINK_PATTERN = /\[\[([^\]|#]+)(?:[|#][^\]]*)?\]\]/g;
export const TAG_PATTERN = /(^|\s)#([\p{L}\p{N}_-]+)/gu;
const PROMPT_PREFIX = "Explain in your own words:";

export function parseLinks(body: string): string[] {
  return [...new Set([...body.matchAll(LINK_PATTERN)].map((m) => m[1].trim()))];
}

export function parseTags(body: string): string[] {
  return [...new Set([...body.matchAll(TAG_PATTERN)].map((m) => m[2].toLowerCase()))];
}

// The note as plain statements: what a Test me answer is compared against.
export function noteStatements(body: string): string[] {
  return body
    .split("\n")
    .map((line) =>
      line
        .replace(/^\s*(#{1,6}\s|[-*]\s|>\s|\d+\.\s)/, "")
        .replace(LINK_PATTERN, "$1")
        .replace(TAG_PATTERN, "$1")
        .trim(),
    )
    .flatMap((line) => line.split(/(?<=[.!?])\s+(?=[A-Z])/))
    .filter((line) => line.split(/\s+/).length >= 4 && !line.startsWith(PROMPT_PREFIX));
}


export function explainPrompt(point: string, source?: { title: string; url: string }): string {
  const cite = source ? ` ([${source.title}](${source.url}))` : "";
  return `> ${PROMPT_PREFIX} ${point}${cite}\n`;
}

export function bodyOf(blocks: { text: string }[]): string {
  return blocks.map((b) => b.text).join("\n\n");
}
