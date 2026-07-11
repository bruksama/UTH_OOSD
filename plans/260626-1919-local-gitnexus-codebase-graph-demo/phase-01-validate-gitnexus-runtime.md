---
phase: 1
title: "Validate GitNexus Runtime"
status: completed
priority: P3
effort: "10m"
dependencies: []
---

# Phase 1: Validate GitNexus Runtime

## Context Links

- [Project README](../../README.md)
- [Project Claude Guide](../../CLAUDE.md)
- [Contributor Guide](../../docs/CONTRIB.md)

## Overview

Confirm local tooling can run GitNexus without touching app code or editor integration.

## Key Insights

- GitNexus `1.6.8` requires Node `>=22`; local Node is already `v26.0.0`.
- Local npm is `11.12.1`; direct `npx gitnexus@1.6.8` failed before GitNexus output.
- GitNexus README documents pnpm `dlx` with explicit build permissions as fallback.
- Plain `gitnexus analyze` may update agent context files; `--index-only` is mandatory.

## Requirements

- Functional: verify Node, npm, pnpm, git, and GitNexus command route.
- Functional: choose `npx` only if it produces GitNexus output; otherwise use pnpm fallback.
- Non-functional: no app file changes, no global MCP setup, no hooks, no skills.

## Architecture

Local developer machine only:

```text
repo root -> package runner -> gitnexus CLI -> local checks
```

No SPTS runtime services needed. Database, backend, frontend, Firebase, and Docker stay unused.

## Related Code Files

- Create: none
- Modify: none
- Delete: none
- Read only: `README.md`, `CLAUDE.md`, `docs/CONTRIB.md`

## Implementation Steps

1. Confirm versions:
   ```bash
   node -v
   npm -v
   pnpm -v
   git --version
   ```
2. Try the preferred command:
   ```bash
   npx gitnexus@1.6.8 doctor
   ```
3. If `npx` exits without GitNexus output, use fallback for all later commands:
   ```bash
   pnpm --allow-build=@ladybugdb/core --allow-build=gitnexus --allow-build=tree-sitter \
     dlx gitnexus@1.6.8 doctor
   ```
4. Record chosen runner in terminal notes for demo run.
5. Confirm no app files changed:
   ```bash
   git status --short
   ```

## Todo List

- [x] Check local runtime versions.
- [x] Confirm working GitNexus runner.
- [x] Confirm no app file changes.

## Success Criteria

- [x] Node version is 22+.
- [x] A GitNexus command route works.
- [x] No frontend/backend/config files modified.

## Risk Assessment

- Risk: npm 11 `npx` fails silently. Mitigation: use documented pnpm `dlx` fallback.
- Risk: native grammar build warnings. Mitigation: proceed if GitNexus doctor/analyze still works for TypeScript and Java.
- Risk: accidental global setup. Mitigation: do not run `gitnexus setup`.

## Security Considerations

- Do not pass API keys or Firebase secrets.
- Do not enable MCP/editor hooks for demo-only graph.

## Next Steps

Proceed to Phase 2 after a working runner is identified.
