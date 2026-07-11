---
phase: 3
title: "Serve And Verify Demo"
status: completed
priority: P3
effort: "25m"
dependencies: [2]
---

# Phase 3: Serve And Verify Demo

## Context Links

- [Plan Overview](./plan.md)
- [Phase 2: Index Codebase Graph](./phase-02-index-codebase-graph.md)

## Overview

Start GitNexus local web UI and verify the codebase relationship graph is demo-ready.

## Key Insights

- `gitnexus serve` starts a local HTTP server, default port `4747`.
- The server hosts the web UI locally and reads indexed repos from GitNexus registry.
- No SPTS backend/frontend server is needed.

## Requirements

- Functional: serve GitNexus web UI locally.
- Functional: verify UTH_OOSD graph is visible and navigable.
- Functional: document fallback port if `4747` is busy.
- Non-functional: demo-only, local-only, no app changes.

## Architecture

```text
.gitnexus/ + ~/.gitnexus/registry.json
  -> gitnexus serve -p 4747
  -> browser http://localhost:4747
  -> codebase graph demo
```

## Related Code Files

- Create: none
- Modify: none
- Delete: none
- Runtime only: local GitNexus server process

## Implementation Steps

1. Start server with preferred command:
   ```bash
   npx gitnexus@1.6.8 serve -p 4747
   ```
2. If `npx` fails, use fallback:
   ```bash
   pnpm --allow-build=@ladybugdb/core --allow-build=gitnexus --allow-build=tree-sitter \
     dlx gitnexus@1.6.8 serve -p 4747
   ```
3. If port `4747` is busy, rerun with:
   ```bash
   npx gitnexus@1.6.8 serve -p 4748
   ```
   or the pnpm equivalent with `serve -p 4748`.
4. Open:
   ```text
   http://localhost:4747
   ```
5. Verify UI:
   - repo list includes `UTH_OOSD`
   - graph/code navigation loads
   - Java backend files and TypeScript frontend files are searchable/visible
6. Stop server with `Ctrl-C` after demo.
7. Optional cleanup after demo:
   ```bash
   npx gitnexus@1.6.8 clean -f
   ```
   Use pnpm fallback if needed.

## Todo List

- [x] Start GitNexus server.
- [x] Open local UI.
- [x] Verify UTH_OOSD graph.
- [x] Leave server running for demo access; stop with `Ctrl-C` when finished.

## Success Criteria

- [x] `GitNexus server running on http://localhost:4747` or fallback port appears.
- [x] Browser opens GitNexus UI.
- [x] UTH_OOSD graph/code relationships visible.
- [x] Demo can be repeated from documented commands.
- [x] No app source files changed.

## Risk Assessment

- Risk: port conflict. Mitigation: use `-p 4748`.
- Risk: browser UI cannot find repo. Mitigation: rerun Phase 2 status/index and confirm registry.
- Risk: UI is too dense for demo. Mitigation: search for known project terms: `AuthService`, `StudentController`, `Dashboard`.

## Security Considerations

- Bind default localhost only.
- Do not use `--host 0.0.0.0` for classroom demo unless network exposure is intended.
- Stop the local server after demo.

## Next Steps

If demo is accepted, keep no permanent app change. If a future app-integrated graph is desired, create a separate plan.
