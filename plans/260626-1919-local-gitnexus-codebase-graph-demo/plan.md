---
title: "Local GitNexus Codebase Graph Demo"
description: "Run GitNexus locally to index UTH_OOSD and show a codebase relationship graph for demo only."
status: completed
priority: P3
effort: 1h
branch: "main"
tags: [tooling, demo, graph]
blockedBy: []
blocks: []
created: "2026-06-26"
createdBy: "ck:plan"
source: skill
---

# Local GitNexus Codebase Graph Demo

## Overview

Create a local-only GitNexus demo flow for the UTH_OOSD codebase graph. No frontend, backend, dependency, or app config changes are in scope.

## Scope Challenge

- Selected scope: local GitNexus only, codebase relationship graph, demo only.
- Hard boundary: no SPTS app integration, no Spring endpoint, no React admin page.
- Safety rule: use `gitnexus analyze --index-only`; never plain `gitnexus analyze` for this plan.
- Local finding: `npx gitnexus@1.6.8` failed under npm 11.12.1, so plan includes pnpm fallback.
- Execution note: current index is a dirty-worktree snapshot and includes unrelated pre-existing Codecept plan/test files.

## Not In Scope

- Adding GitNexus to `frontend/package.json` or `backend/pom.xml`.
- Modifying `AGENTS.md`, `CLAUDE.md`, `.claude/skills`, app routes, app UI, or backend APIs.
- Committing generated `.gitnexus/` data.
- MCP/editor setup, hooks, skills, or production deployment.

## Cross-Plan Dependencies

None detected. Existing Codecept E2E plan touches frontend test tooling; this plan is local GitNexus demo tooling only.

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [Validate GitNexus Runtime](./phase-01-validate-gitnexus-runtime.md) | Completed |
| 2 | [Index Codebase Graph](./phase-02-index-codebase-graph.md) | Completed |
| 3 | [Serve And Verify Demo](./phase-03-serve-and-verify-demo.md) | Completed |

## Dependencies

- Node.js 22+ required by GitNexus; local machine has Node v26.0.0.
- GitNexus npm package: `gitnexus@1.6.8`.
- Preferred user-facing command: `npx gitnexus@1.6.8 ...`.
- Reliable local fallback: `pnpm --allow-build=@ladybugdb/core --allow-build=gitnexus --allow-build=tree-sitter dlx gitnexus@1.6.8 ...`.
- Generated artifacts: `.gitnexus/` in repo and `~/.gitnexus/registry.json`; treat as local demo state.

## Success Criteria

- Completed: `UTH_OOSD` index created with `--index-only`.
- Completed: local GitNexus web UI opens on `http://localhost:4747`.
- Completed: API/UI data shows indexed UTH_OOSD graph/code relationships, including pre-existing dirty-worktree files.
- Completed: `git status --short` showed no new app file changes from running GitNexus; pre-existing dirty files remain unrelated.

## Unresolved Questions

None.
