"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

export type GraphNode = {
  id: string;
  title: string;
  // null for a [[link]] to a note that isn't written yet.
  noteId: string | null;
  tag: string | null;
  due: boolean;
};

export type GraphEdge = [string, string];

const SERIES = ["var(--series-1)", "var(--series-2)", "var(--series-3)"];

type Point = { x: number; y: number };
type Size = { w: number; h: number };

// A plain force layout: nodes repel, links pull, everything drifts to the center.
function layout(nodes: GraphNode[], edges: GraphEdge[], { w, h }: Size): Record<string, Point> {
  const spread = Math.min(w, h);
  const pos: Record<string, Point> = {};
  nodes.forEach((n, i) => {
    const angle = (i / nodes.length) * Math.PI * 2;
    pos[n.id] = { x: w / 2 + Math.cos(angle) * spread * 0.3, y: h / 2 + Math.sin(angle) * spread * 0.3 };
  });
  for (let step = 0; step < 400; step++) {
    const cool = 1 - step / 400;
    const force: Record<string, Point> = Object.fromEntries(nodes.map((n) => [n.id, { x: 0, y: 0 }]));
    for (const a of nodes) {
      for (const b of nodes) {
        if (a.id >= b.id) continue;
        const dx = pos[a.id].x - pos[b.id].x;
        const dy = pos[a.id].y - pos[b.id].y;
        const d2 = Math.max(dx * dx + dy * dy, 100);
        const push = (spread * spread * 0.12) / d2;
        const d = Math.sqrt(d2);
        force[a.id].x += (dx / d) * push;
        force[a.id].y += (dy / d) * push;
        force[b.id].x -= (dx / d) * push;
        force[b.id].y -= (dy / d) * push;
      }
    }
    for (const [a, b] of edges) {
      const dx = pos[b].x - pos[a].x;
      const dy = pos[b].y - pos[a].y;
      const d = Math.max(Math.sqrt(dx * dx + dy * dy), 1);
      const pull = (d - spread * 0.22) * 0.05;
      force[a].x += (dx / d) * pull;
      force[a].y += (dy / d) * pull;
      force[b].x -= (dx / d) * pull;
      force[b].y -= (dy / d) * pull;
    }
    for (const n of nodes) {
      force[n.id].x += (w / 2 - pos[n.id].x) * 0.01;
      force[n.id].y += (h / 2 - pos[n.id].y) * 0.01;
      pos[n.id].x = Math.min(w - 50, Math.max(50, pos[n.id].x + Math.max(-30, Math.min(30, force[n.id].x)) * cool));
      pos[n.id].y = Math.min(h - 40, Math.max(30, pos[n.id].y + Math.max(-30, Math.min(30, force[n.id].y)) * cool));
    }
  }
  return pos;
}

export function GraphView({ nodes, edges, tags }: { nodes: GraphNode[]; edges: GraphEdge[]; tags: string[] }) {
  const router = useRouter();
  const boxRef = useRef<HTMLDivElement>(null);
  // Lay out in the container's own pixels, so a tall phone screen gets a tall graph.
  const [size, setSize] = useState<Size>({ w: 900, h: 600 });
  useEffect(() => {
    const box = boxRef.current!;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (width > 0 && height > 0) setSize({ w: Math.round(width), h: Math.round(height) });
    });
    observer.observe(box);
    return () => observer.disconnect();
  }, []);
  const initial = useMemo(() => layout(nodes, edges, size), [nodes, edges, size]);
  const [moved, setMoved] = useState<Record<string, Point>>({});
  const [hover, setHover] = useState<string | null>(null);
  const drag = useRef<{ id: string; dragged: boolean } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const pos = (id: string) => moved[id] ?? initial[id];
  const color = (tag: string | null) => {
    const slot = tag ? tags.indexOf(tag) : -1;
    return slot >= 0 && slot < SERIES.length ? SERIES[slot] : "var(--muted)";
  };
  const degree = (id: string) => edges.filter(([a, b]) => a === id || b === id).length;
  const neighbors = new Set(hover ? edges.flatMap(([a, b]) => (a === hover ? [b] : b === hover ? [a] : [])) : []);
  const lit = (id: string) => !hover || id === hover || neighbors.has(id);

  const toSvg = (e: React.PointerEvent): Point => {
    const svg = svgRef.current!;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const p = pt.matrixTransform(svg.getScreenCTM()!.inverse());
    return { x: p.x, y: p.y };
  };

  const hovered = hover ? nodes.find((n) => n.id === hover) : null;
  const named = tags.slice(0, SERIES.length);

  return (
    <div ref={boxRef} className="relative h-full w-full">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${size.w} ${size.h}`}
        className="h-full w-full touch-none select-none"
        role="img"
        aria-label="Graph of your notes and the links between them"
        onPointerMove={(e) => {
          if (!drag.current) return;
          drag.current.dragged = true;
          const p = toSvg(e);
          setMoved((m) => ({ ...m, [drag.current!.id]: p }));
        }}
        onPointerUp={() => {
          const d = drag.current;
          drag.current = null;
          const node = d && nodes.find((n) => n.id === d.id);
          if (node && !d.dragged) {
            router.push(node.noteId ? `/notes/${node.noteId}` : `/open?title=${encodeURIComponent(node.title)}`);
          }
        }}
        onPointerLeave={() => (drag.current = null)}
      >
        {edges.map(([a, b]) => {
          const on = hover && (a === hover || b === hover);
          return (
            <line
              key={`${a}-${b}`}
              x1={pos(a).x}
              y1={pos(a).y}
              x2={pos(b).x}
              y2={pos(b).y}
              stroke={on ? "var(--pen)" : "var(--rule)"}
              strokeWidth={on ? 2 : 1.5}
              opacity={hover && !on ? 0.3 : 1}
            />
          );
        })}
        {nodes.map((n) => {
          const p = pos(n.id);
          const r = Math.min(6 + degree(n.id) * 2, 14);
          return (
            <g
              key={n.id}
              transform={`translate(${p.x} ${p.y})`}
              opacity={lit(n.id) ? 1 : 0.25}
              className="cursor-pointer"
              onPointerEnter={() => setHover(n.id)}
              onPointerLeave={() => setHover(null)}
              onPointerDown={(e) => {
                (e.target as Element).setPointerCapture?.(e.pointerId);
                drag.current = { id: n.id, dragged: false };
              }}
            >
              {/* Hit target larger than the mark. */}
              <circle r={r + 14} fill="transparent" />
              {n.due && <circle r={r + 5} fill="none" stroke="var(--highlight)" strokeWidth={4} />}
              <circle
                r={r}
                fill={n.noteId ? color(n.tag) : "var(--paper)"}
                stroke={n.noteId ? "var(--paper)" : "var(--muted)"}
                strokeWidth={2}
                strokeDasharray={n.noteId ? undefined : "3 3"}
              />
              <text
                y={r + 15}
                textAnchor="middle"
                className={`text-[13px] ${n.noteId ? "fill-ink" : "fill-muted"} ${n.id === hover ? "font-semibold" : ""}`}
              >
                {n.title}
              </text>
            </g>
          );
        })}
      </svg>

      {hovered && (
        <div className="pointer-events-none absolute top-3 left-3 rounded-md border border-rule bg-surface px-3 py-2 text-sm shadow-sm">
          <p className="font-semibold">{hovered.title}</p>
          <p className="text-muted">
            {!hovered.noteId
              ? "Not written yet. Click to start it."
              : `${degree(hovered.id)} ${degree(hovered.id) === 1 ? "link" : "links"}${hovered.tag ? `, #${hovered.tag}` : ""}${hovered.due ? ", due for review" : ""}`}
          </p>
        </div>
      )}

      <ul className="absolute right-2 bottom-2 flex flex-col gap-0.5 rounded-md border border-rule bg-surface/90 px-2.5 py-1.5 text-[11px] sm:text-xs">
        {named.map((tag, i) => (
          <li key={tag} className="flex items-center gap-2">
            <span className="size-2.5 rounded-full" style={{ background: SERIES[i] }} />#{tag}
          </li>
        ))}
        <li className="flex items-center gap-2">
          <span className="size-2.5 rounded-full bg-muted" />
          {tags.length > SERIES.length ? "Other hashtags or none" : "No hashtag"}
        </li>
        <li className="flex items-center gap-2">
          <span className="size-2.5 rounded-full border border-dashed border-muted" />
          Not written yet
        </li>
        <li className="flex items-center gap-2">
          <span className="size-2.5 rounded-full ring-2 ring-highlight" />
          Due for review
        </li>
      </ul>

      <ul className="sr-only">
        {nodes.map((n) => (
          <li key={n.id}>
            <Link href={n.noteId ? `/notes/${n.noteId}` : `/open?title=${encodeURIComponent(n.title)}`}>{n.title}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
