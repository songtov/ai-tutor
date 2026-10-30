import { Extension } from "@tiptap/react";
import { Plugin } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";

import { LINK_PATTERN, parseTags, TAG_PATTERN } from "@/lib/notes";

const BLOCK_TYPES = ["paragraph", "heading", "bulletList", "orderedList", "blockquote"];

// Every top-level block keeps a stable id, so cues stay attached while the text is edited.
export const BlockId = Extension.create({
  name: "blockId",
  addGlobalAttributes() {
    return [
      {
        types: BLOCK_TYPES,
        attributes: {
          blockId: {
            default: null,
            keepOnSplit: false,
            parseHTML: (el) => el.getAttribute("data-block-id"),
            renderHTML: (attrs) => (attrs.blockId ? { "data-block-id": attrs.blockId } : {}),
          },
        },
      },
    ];
  },
  addProseMirrorPlugins() {
    return [
      new Plugin({
        // A split or paste can leave a block without an id, or with a copy of another's.
        appendTransaction: (_transactions, _old, state) => {
          const seen = new Set<string>();
          const tr = state.tr;
          state.doc.forEach((node, offset) => {
            const id = node.attrs.blockId as string | null;
            if (!BLOCK_TYPES.includes(node.type.name)) return;
            if (id && !seen.has(id)) {
              seen.add(id);
              return;
            }
            const fresh = `b-${crypto.randomUUID()}`;
            seen.add(fresh);
            tr.setNodeAttribute(offset, "blockId", fresh);
          });
          return tr.docChanged ? tr : null;
        },
      }),
    ];
  },
});

function tagChips(tags: string[], onOpenTag: (tag: string) => void): HTMLElement {
  const row = document.createElement("div");
  row.className = "note-tags";
  row.contentEditable = "false";
  for (const tag of tags) {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "hashtag";
    chip.textContent = `#${tag}`;
    chip.title = "See notes with this hashtag";
    chip.addEventListener("mousedown", (e) => e.preventDefault());
    chip.addEventListener("click", () => onOpenTag(tag));
    row.append(chip);
  }
  return row;
}

export type NoteMarksOptions = {
  // Lowercased titles of existing notes.
  known: Set<string>;
  onOpenLink: (title: string) => void;
  onOpenTag: (tag: string) => void;
};

// [[Links]] and #hashtags stay plain text, like Obsidian; they are only colored. ⌘/Ctrl-click follows them.
export const NoteMarks = Extension.create<NoteMarksOptions>({
  name: "noteMarks",
  addOptions() {
    return { known: new Set(), onOpenLink: () => {}, onOpenTag: () => {} };
  },
  addProseMirrorPlugins() {
    const { known, onOpenLink, onOpenTag } = this.options;
    return [
      new Plugin({
        props: {
          decorations(state) {
            const decorations: Decoration[] = [];
            state.doc.descendants((node, pos) => {
              if (!node.isText || !node.text) return;
              for (const m of node.text.matchAll(LINK_PATTERN)) {
                const title = m[1].trim();
                decorations.push(
                  Decoration.inline(pos + m.index!, pos + m.index! + m[0].length, {
                    class: known.has(title.toLowerCase()) ? "wikilink" : "wikilink wikilink-new",
                    "data-title": title,
                    title: known.has(title.toLowerCase()) ? "⌘-click to open" : "No note yet. ⌘-click to create it.",
                  }),
                );
              }
              for (const m of node.text.matchAll(TAG_PATTERN)) {
                const start = pos + m.index! + m[1].length;
                decorations.push(
                  Decoration.inline(start, start + m[2].length + 1, {
                    class: "hashtag",
                    "data-tag": m[2].toLowerCase(),
                    title: "⌘-click to see notes with this hashtag",
                  }),
                );
              }
            });
            // The note's hashtags, as chips under the title (the first line).
            const tags = parseTags(state.doc.textBetween(0, state.doc.content.size, "\n"));
            if (tags.length && state.doc.firstChild) {
              decorations.push(
                Decoration.widget(state.doc.firstChild.nodeSize, () => tagChips(tags, onOpenTag), {
                  key: `tags:${tags.join(",")}`,
                  side: -1,
                  ignoreSelection: true,
                }),
              );
            }
            return DecorationSet.create(state.doc, decorations);
          },
          handleClick(_view, _pos, event) {
            if (!(event.metaKey || event.ctrlKey)) return false;
            const target = event.target as HTMLElement;
            const link = target.closest<HTMLElement>("[data-title]");
            if (link) {
              onOpenLink(link.dataset.title!);
              return true;
            }
            const tag = target.closest<HTMLElement>("[data-tag]");
            if (tag) {
              onOpenTag(tag.dataset.tag!);
              return true;
            }
            return false;
          },
        },
      }),
    ];
  },
});
