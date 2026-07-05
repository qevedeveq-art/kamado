# CLAUDE.md

Read `AGENTS.md` first; it is the shared project baseline for Claude Code, Codex, Antigravity, and Cowork CLI.

## Claude-Specific Automation
- `.claude/settings.json` runs `node scripts/extract-data.js` and `node scripts/bump-sw-version.js` after Claude edits `index.html`.
- `.claude/skills/add-recipe/SKILL.md` wraps URL import, kamado curation, data refresh, audit, tests, and service-worker bump.
- `.claude/agents/*.md` are Claude-native role files mirrored as Codex TOML in `.codex/agents/` and as shared specs in `.agents/roles/`.

## Shared State
- Read `.agents/memory.md` and `.agents/handoff.md` before substantial work.
- Update `.agents/handoff.md` after substantial work so another CLI can resume without re-discovery.
