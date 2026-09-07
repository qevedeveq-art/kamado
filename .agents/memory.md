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
- Product north star: make Kamado the independent, expert, local-first cooking copilot for ceramic kamados across brands.
- Approved evolution roadmap (2026-09-06): Phase 0 reliability/deep links/PWA/CI/accessibility/performance; Phase 1 searchable editorial authority; Phase 2 Cook Engine 2.0; Phase 3 optional encrypted local-first sync and personalization; Phase 4 vendor-neutral probe integrations; ongoing expert-reviewed community content.
- Phase 1 editorial architecture (2026-09-07): keep `index.html` as the source of truth and generate canonical static recipe pages, guide pages, sitemap and robots alongside `data/` via `scripts/extract-data.js`.
- Phase 2 Cook Engine architecture (2026-09-07): `recette → plan de cuisson → étape → minuteur absolu → observations → journal`; keep one persistent local active session, prefer structured recipe phases with step fallback, accept manual dôme/cœur readings, and reserve brand-neutral connected-probe integrations for Phase 4.
- Phase 3 local-first architecture (2026-09-07): encrypted manual vault transfer uses Web Crypto AES-256-GCM with PBKDF2-HMAC-SHA-256 (600,000 iterations), random 16-byte salt, random 12-byte IV, authenticated metadata and no stored passphrase; personalized ranking is explicit opt-in, deterministic, explainable and computed only from local profile/activity.
- Do not publish `Recipe` structured data until each indexed recipe has a representative finished-dish image; use honest `WebPage`, `Article`, `CollectionPage`, `ItemList` and breadcrumb markup in the meantime.
- Expert search syntax supports quoted phrases, `-exclusions`, and the filters `cat:`, `mode:`, `bois:`, `source:`, `ingredient:` and `temp:`.
- Defer a generic social network, marketplace, mandatory accounts, broad AI chatbot, and proprietary grill control until the core cooking experience and editorial authority are proven.

## Working Preferences
- Keep recipe edits conservative: preserve imported identity and enrich kamado technique, safety, and timing.
- Prefer file-scoped verification commands before full sweeps when investigating a narrow change.
- Treat networked tools as read-only unless the user explicitly approves an external write.
