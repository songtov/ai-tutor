"use client";

import { useState, useTransition } from "react";

import { sendMessage } from "@/app/actions";
import type { ChatMessage } from "@/lib/api";

export function ChatPanel({ cycleId, messages }: { cycleId: string; messages: ChatMessage[] }) {
  const [draft, setDraft] = useState("");
  const [pending, startTransition] = useTransition();

  const send = () => {
    const content = draft.trim();
    if (!content) return;
    setDraft("");
    startTransition(() => sendMessage(cycleId, content));
  };

  return (
    <div className="flex flex-col gap-6">
      {messages.length === 0 && (
        <p className="text-muted">What do you want to learn, and why? Start with a question or a goal.</p>
      )}
      <ol className="flex flex-col gap-5">
        {messages.map((m) =>
          m.role === "learner" ? (
            <li key={m.id} className="ml-auto max-w-[85%] rounded-lg bg-pen-soft px-4 py-3 font-serif text-pen">
              {m.content}
            </li>
          ) : (
            <li key={m.id} className="max-w-[85%] leading-relaxed">
              <span className="sr-only">Tutor: </span>
              {m.content}
            </li>
          ),
        )}
      </ol>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
        className="flex flex-col gap-2 rounded-lg border border-rule bg-surface p-3 focus-within:border-pen"
      >
        <label htmlFor="chat-input" className="sr-only">
          Message
        </label>
        <textarea
          id="chat-input"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault();
              send();
            }
          }}
          rows={2}
          placeholder="Ask, or explain what you think"
          className="resize-none bg-transparent font-serif outline-none"
        />
        <button
          disabled={pending || !draft.trim()}
          className="self-end rounded-md bg-pen px-4 py-1.5 text-sm font-semibold text-surface disabled:opacity-40"
        >
          Send
        </button>
      </form>
    </div>
  );
}
