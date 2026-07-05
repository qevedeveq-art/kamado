# Shared Agent Memory

## Purpose
- Shared, repo-local memory for Antigravity, Codex, Claude Code, and Cowork CLI.
- Store stable project facts, user preferences, and decisions that should survive between CLI sessions.
- Do not store secrets, credentials, private tokens, or large generated output.

## Stable Facts
- Kamado Kokko is a zero-build PWA; `index.html` is the source of truth.
- Derived data in `data/` must be regenerated with `node scripts/extract-data.js` after recipe changes.
- CI fails when `data/` is stale relative to `index.html`.
- Service-worker cache invalidation depends on `const VERSION` in `sw.js`.
- Shared role specs are in `.agents/roles/`; Codex role adapters are in `.codex/agents/`; Claude role adapters are in `.claude/agents/`.

## Decisions
- Use `AGENTS.md` as the canonical cross-CLI instruction file.
- Keep CLI-specific files as thin adapters that point back to shared state and role specs.
- Use `.agents/handoff.md` for current-session state instead of burying progress in tool-specific transcripts.

## Working Preferences
- Keep recipe edits conservative: preserve imported identity and enrich kamado technique, safety, and timing.
- Prefer file-scoped verification commands before full sweeps when investigating a narrow change.
- Treat networked tools as read-only unless the user explicitly approves an external write.
