# AGENTS.md

Instructions for coding agents working in this repo. For the product vision, the learning cycle, and the topic model, read [README.md](README.md).

## Project

ai-tutor is a learner-first tool that runs a persistent learning cycle (chat → materials → blank quiz → feedback → notes → review → next topic) on a topic. It runs both locally and as a hosted SaaS.

## Layout

- `apps/web`: Next.js frontend, deployed to Cloudflare.
- `apps/api`: FastAPI backend, deployed to Cloud Run.
- `docs/`: design notes.

## Backend architecture (DDD)

`apps/api` uses layers:

- `domain`: entities, value objects, and ports (interfaces). No framework or infrastructure imports.
- `application`: use cases that orchestrate the domain through ports.
- `infrastructure`: adapters that implement ports (database, storage, external APIs).
- `interface`: FastAPI routers, request and response schemas.

Dependencies point inward: `interface` → `application` → `domain` ← `infrastructure`.

Core domain concepts: Topic, LearningCycle (and its stages), Material, Quiz / Attempt, Feedback, Note, Review.

## Local vs remote

- A single setting, `APP_ENV=local|remote`, selects the adapters at startup.
- Database: SQLite file (local) or Supabase Postgres (remote).
- Storage: local filesystem (local) or S3-compatible, such as Cloudflare R2 or AWS S3 (remote).
- Database and storage are accessed only through ports. Feature code must never branch on `APP_ENV`.
- Every feature must work in local mode without any cloud account.

## Product rules

- Never discard learner artifacts: chats, materials, quiz answers, uploaded photos, feedback, and notes are kept.
- Every learning record belongs to a topic.
- Topics form a tree of any depth, with `prerequisite` and `related` links and clusters.
- Prefer prompting the learner to recall or explain over handing them the answer.

## Conventions

- Python: `snake_case` for functions and variables, `PascalCase` for classes. Prefer the standard library, and justify every new dependency.
- TypeScript / Next.js: follow framework defaults.
- Keep changes small and focused (PRs under ~2000 lines). Don't add speculative abstractions or configuration.

## Commands

TBD. They will be added when each app is scaffolded. Don't invent commands. Read each app's config files (`package.json`, `pyproject.toml`) instead.

## Verification

Before calling a task done, run the linter, type checker, and tests for every app you changed.
