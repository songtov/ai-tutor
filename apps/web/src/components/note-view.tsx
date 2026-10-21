import Link from "next/link";
import type { ReactNode } from "react";

// Titles (lowercased) of existing notes, mapped to their ids.
export type NoteIndex = Record<string, string>;

const INLINE =
  /\[\[([^\]|#]+)(?:[|#][^\]]*)?\]\]|\*\*([^*]+)\*\*|\[([^\]]+)\]\((https?:[^)\s]+)\)|(^|\s)#([\p{L}\p{N}_-]+)/gu;

function inline(text: string, index: NoteIndex): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  for (const m of text.matchAll(INLINE)) {
    const start = m.index!;
    out.push(text.slice(last, start));
    const key = `${start}`;
    if (m[1]) {
      const title = m[1].trim();
      const id = index[title.toLowerCase()];
      out.push(
        id ? (
          <Link key={key} href={`/notes/${id}`} className="text-pen underline decoration-pen/40 underline-offset-4 hover:decoration-pen">
            {title}
          </Link>
        ) : (
          <Link
            key={key}
            href={`/open?title=${encodeURIComponent(title)}`}
            title="No note yet. Open to create it."
            className="text-pen/70 underline decoration-dashed underline-offset-4 hover:text-pen"
          >
            {title}
          </Link>
        ),
      );
    } else if (m[2]) {
      out.push(<strong key={key}>{m[2]}</strong>);
    } else if (m[3]) {
      out.push(
        <a key={key} href={m[4]} target="_blank" rel="noreferrer" className="text-pen underline underline-offset-4">
          {m[3]}
        </a>,
      );
    } else {
      out.push(
        m[5],
        <Link key={key} href={`/tags/${m[6].toLowerCase()}`} className="rounded bg-pen-soft px-1.5 py-0.5 text-[0.85em] text-pen">
          #{m[6]}
        </Link>,
      );
    }
    last = start + m[0].length;
  }
  out.push(text.slice(last));
  return out;
}

export function NoteView({ body, index }: { body: string; index: NoteIndex }) {
  const blocks: ReactNode[] = [];
  const lines = body.split("\n");
  for (let i = 0; i < lines.length; ) {
    const line = lines[i];
    if (!line.trim()) {
      i++;
      continue;
    }
    const heading = line.match(/^(#{1,3})\s+(.*)/);
    if (heading) {
      const size = heading[1].length === 1 ? "text-xl md:text-2xl" : heading[1].length === 2 ? "text-lg md:text-xl" : "text-base md:text-lg";
      blocks.push(
        <h2 key={i} className={`mt-2 font-serif font-semibold ${size}`}>
          {inline(heading[2], index)}
        </h2>,
      );
      i++;
      continue;
    }
    const group = (prefix: RegExp) => {
      const items: string[] = [];
      while (i < lines.length && prefix.test(lines[i])) items.push(lines[i++].replace(prefix, ""));
      return items;
    };
    if (/^\s*[-*]\s/.test(line)) {
      const items = group(/^\s*[-*]\s/);
      blocks.push(
        <ul key={i} className="flex list-disc flex-col gap-1 pl-6">
          {items.map((item, j) => (
            <li key={j}>{inline(item, index)}</li>
          ))}
        </ul>,
      );
      continue;
    }
    if (/^>\s?/.test(line)) {
      const start = i;
      const text = group(/^>\s?/).join(" ");
      const prompt = text.startsWith("Explain in your own words:");
      blocks.push(
        <blockquote
          key={start}
          className={`border-l-4 py-1 pl-4 ${prompt ? "border-highlight bg-highlight/15 font-sans text-base" : "border-rule text-muted"}`}
        >
          {inline(text, index)}
        </blockquote>,
      );
      continue;
    }
    const start = i;
    const para = group(/^(?!\s*$)(?!#{1,3}\s)(?!\s*[-*]\s)(?!>)/);
    if (para.length === 0) {
      i++;
      continue;
    }
    blocks.push(
      <p key={start}>
        {para.map((l, j) => (
          <span key={j}>
            {j > 0 && <br />}
            {inline(l, index)}
          </span>
        ))}
      </p>,
    );
  }
  return <div className="flex flex-col gap-4 font-serif text-base leading-relaxed md:text-lg">{blocks}</div>;
}
