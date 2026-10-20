# ai-tutor

A learning companion that keeps what you learn and makes you think.

## Why

General-purpose chatbots answer questions, but they don't help you *learn*:

- **Things vanish.** Answers, explanations, and artifacts get buried in chat history.
- **Reading isn't learning.** A good explanation feels like understanding until you try to recall it.
- **No record of progress.** Nothing tracks what you know, what you got wrong, or what comes next.

ai-tutor is built around a full learning cycle on a topic. It keeps everything you produce and keeps asking you to recall, explain, and review.

## The learning cycle

```
        ┌──────────────────────────────────────────────────────┐
        ▼                                                      │
  1. Chat ──► 2. Materials ──► 3. Blank quiz ──► 4. Feedback   │
                                                     │         │
                     7. Next topic ◄── 6. Review ◄── 5. Notes  │
                          └────────────────────────────────────┘
```

1. **Chat**: start with a question or goal on a topic.
2. **Materials**: find learning materials (YouTube, blogs, …), pick some, and study them.
3. **Blank quiz**: write down what you learned from memory. Type it, or upload a photo of handwritten work.
4. **Feedback**: get an assessment of what you know, what's missing, and questions you should now be able to answer.
5. **Notes**: your progress is recorded as notes on the topic.
6. **Review**: come back to earlier topics and recall them again.
7. **Next topic**: get a suggestion for what to learn next within the topic area.

## Topics

Every cycle belongs to a topic. Topics are free-form and can be as broad or narrow as you like, from *addition* to *calculus*.

- **Tree**: topics nest to any depth (Math › Arithmetic › Division, Math › Calculus › Derivatives).
- **Links**: topics can be connected as *prerequisites* (Division requires Multiplication) or as *related*.
- **Clusters**: related topics are grouped together.

The next topic is suggested from this structure.

## Principles

- **Learner-first.** Every feature has to help someone learn. AI is a helper, not the product.
- **Nothing vanishes.** Chats, materials, quiz answers, photos, feedback, and notes are all saved.
- **Active recall over passive reading.** Ask the learner before telling them.
- **Yours to keep.** Notes and study history are also written as plain Markdown, so you can browse them in Obsidian or any editor.

## Architecture

ai-tutor runs locally (self-hosted or development) and remotely (hosted SaaS) with the same code. Only the adapters change.

| Layer    | Local              | Remote                                 |
| -------- | ------------------ | -------------------------------------- |
| Frontend | Next.js dev server | Next.js on Cloudflare                  |
| Backend  | FastAPI            | FastAPI on Cloud Run                   |
| Database | SQLite file        | Supabase (Postgres)                    |
| Storage  | Local filesystem   | S3-compatible (Cloudflare R2 / AWS S3) |
| Markdown | Folder on disk     | Download                               |

## Repo layout

```
ai-tutor/
├── apps/
│   ├── web/   # Next.js frontend
│   └── api/   # FastAPI backend
└── docs/      # design notes
```

## Status

Early design stage. There is no runnable code yet. Setup instructions will be added once `apps/web` and `apps/api` are scaffolded.

## License

[MIT](LICENSE)
