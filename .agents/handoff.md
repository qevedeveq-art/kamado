# Agent Handoff

## Current Status
- Shared agent baseline added for cross-session coordination.
- Codex multi-agent config now exposes the mirrored Kamado reviewer roles.
- `AGENTS.md` is the canonical shared instruction file; `CLAUDE.md` is a Claude-specific adapter.
- Project quality pass run on 2026-07-06.
- CI now runs the expert audit and every native Node test file.
- README counts now match the extracted dataset: 226 cooking recipes and 21 bases.

## Last Commands
- `sed -n '1,240p' /Users/quentin/.agents/skills.library/agents-md/SKILL.md`
- `rg --files -g 'AGENTS.md' -g 'CLAUDE.md' -g '.agents/**' -g '.codex/**' -g 'package.json' -g 'pnpm-lock.yaml' -g 'package-lock.json' -g 'yarn.lock' -g 'Makefile' -g 'README*' -g 'CONTRIBUTING*'`
- `find .agents .codex -maxdepth 4 -type f`
- `find .claude -maxdepth 5 -type f`
- `sed -n '1,240p' CLAUDE.md`
- `sed -n '1,260p' .codex/config.toml`
- `sed -n '1,260p' .codex/agents/kamado-expert.toml`
- `sed -n '1,220p' README.md`
- `sed -n '1,240p' .claude/settings.json`
- `python3 -c "import pathlib,tomllib; [tomllib.loads(p.read_text()) for p in [pathlib.Path('.codex/config.toml'), *pathlib.Path('.codex/agents').glob('*.toml')]]; print('toml ok')"`
- `node scripts/extract-data.js`
- `node scripts/audit-data.js`
- `node scripts/audit-kamado-expert.js`
- `node --test 'tests/*.test.js'`

## Files Changed By Agent Baseline Work
- `AGENTS.md`
- `CLAUDE.md`
- `.codex/config.toml`
- `.codex/agents/*.toml`
- `.agents/memory.md`
- `.agents/handoff.md`
- `.agents/roles/*.md`

## Files Changed By Project Quality Pass
- `.github/workflows/audit.yml`
- `README.md`
- `scripts/reports/kamado-expert-report.json`
- `.agents/handoff.md`

## Existing Dirty Files Before This Work
- `data/recipes.json`
- `index.html`
- `sw.js`

## Next Steps
- Before a future recipe/UI task, read `AGENTS.md`, `.agents/memory.md`, and this handoff.
- Do not overwrite user edits in existing dirty application files.
- Expert audit currently reports 0 issues, 0 warnings, and 252 non-blocking improvements.
