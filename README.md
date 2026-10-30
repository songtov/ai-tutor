# ai-tutor

A note-taking app that makes you think. You write the notes; AI makes you recall them.

## Why

AI does the thinking for you. You ask, you get a polished answer, it feels like understanding, and a week later nothing is left. The computer spent the electricity; your brain didn't.

- **Things vanish.** Answers and explanations get buried in chat history.
- **Reading isn't learning.** A good explanation feels like understanding until you try to recall it.
- **No record of progress.** Nothing tracks what you know, what you got wrong, or what to review.

ai-tutor flips the roles. You write; the AI asks, checks, and finds material. Nothing it produces becomes yours until you recall it or put it in your own words.

## How it works

Each topic is one note, written by you. A study panel sits beside it.

```
┌ Sidebar ─────┬ Derivatives ──────────────────┬ Study ─────────────┐
│ Today        │ #calculus-exam                │ Review due today   │
│ Review (2)   │                               │ [ Test me ]        │
│              │ The slope of the tangent line │                    │
│ #calc-exam   │ at a point. Builds on         │ Last test: 2 gaps  │
│   Limits     │ [[Limits]].                   │ Materials (2)      │
│   Derivatives│                               │ Questions (1)      │
│ All notes    │ (select text → Ask)           │ Linked: [[Limits]] │
└──────────────┴───────────────────────────────┴────────────────────┘
```

```
  Write ──► Test me ──► Feedback ──► Fix the note ──► Review later
    ▲                                                     │
    └──────── Materials, Questions ◄──────────────────────┘
```

- **Write**: one note per topic, in your own words. `[[Links]]` and `#hashtags` in the text connect notes, like Obsidian.
- **Test me**: the note is hidden and you write what you remember, typed or as a photo of handwritten work. The AI compares it with your note: what you know, what's missing, and questions you should now be able to answer. Then you fix the note.
- **Review**: each note gets a review date. The Review screen takes you through the notes due today, one Test me at a time.
- **Materials**: the AI finds videos and articles for the note, aimed at the gaps from your last test. Saved materials get a summary. A summary point goes into your note as a prompt to explain it in your own words, not as copied text.
- **Ask**: select text in your note and ask about it. The AI answers with a hint or a question first, and the answers stay beside the note.

## Notes and links

Notes are flat: no folders. Structure comes from the text.

- **Links**: `[[Limits]]` links to the Limits note. Every note shows the notes that link to it.
- **Hashtags**: `#calculus-exam` groups notes, and a hashtag can be reviewed as a group.

The next note to study is suggested from these links and hashtags.

## Principles

- **The AI doesn't think for you.** It asks, checks, and finds. It never writes your note. Anything it produces costs you a recall or a rephrase to keep.
- **Learner-first.** Every feature has to help someone learn. AI is a helper, not the product.
- **Nothing vanishes.** Notes keep their earlier versions. Tests, photos, feedback, materials, summaries, and questions are all saved.
- **Active recall over passive reading.** Ask the learner before telling them.
- **Yours to keep.** Notes and study history are also written as plain Markdown, so you can open them in Obsidian or any editor.

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

Early stage. `apps/api` and `apps/web` are scaffolded; the web app only shows the API health status. The domain model is in [docs/domain.md](docs/domain.md). For setup and commands, see [AGENTS.md](AGENTS.md#commands).

## License

[MIT](LICENSE)
