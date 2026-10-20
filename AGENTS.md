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
- Markdown vault: a folder on disk (local) or a download (remote).
- Database, storage, and the vault are accessed only through ports. Feature code must never branch on `APP_ENV`.
- Every feature must work in local mode without any cloud account.

## Product rules

- Never discard learner artifacts: chats, materials, quiz answers, uploaded photos, feedback, and notes are kept.
- Every learning record belongs to a topic.
- Topics form a tree of any depth, with `prerequisite` and `related` links and clusters.
- Prefer prompting the learner to recall or explain over handing them the answer.
- Notes and study history are also written to a Markdown vault (Obsidian-compatible) as a one-way copy. The database stays the source of truth. See [docs/domain.md](docs/domain.md#markdown-vault).
- Learners pick a learning method (a preset stage order). In strict mode they follow the order but can still skip a stage.

## Conventions

- Python: `snake_case` for functions and variables, `PascalCase` for classes. Prefer the standard library, and justify every new dependency.
- TypeScript / Next.js: follow framework defaults.
- Keep changes small and focused (PRs under ~2000 lines). Don't add speculative abstractions or configuration.
- Never put agent session links (such as `Claude-Session:` trailers or `claude.ai/code/session_...` URLs) in commit messages, PR descriptions, or issues. This repo is public.

## Commands

Don't invent commands. If something is missing here, read the app's config files (`package.json`, `pyproject.toml`).

### `apps/api`

Python 3.14, managed with [uv](https://docs.astral.sh/uv/). Tasks run with [Poe the Poet](https://poethepoet.natn.io/) (`uv tool install poethepoet`). Run them from the repo root or from `apps/api`:

- Install: `uv sync` (in `apps/api`, before the first task)
- Run the backend: `poe run` (http://127.0.0.1:8000, reloads on change)
- Lint (ruff check and format check): `poe lint`
- Format: `poe format`
- Type check: `poe typecheck`
- Test: `poe test`
- All checks (lint, type check, test): `poe check`

Tasks are defined in `[tool.poe.tasks]` in `apps/api/pyproject.toml`. The root `pyproject.toml` only includes them and runs them in `apps/api/.venv`; it is not a Python project.

### `apps/web`

TBD. Added when the app is scaffolded.

## Verification

Before calling a task done, run the linter, type checker, and tests for every app you changed.
