---
phase: 2
title: "Index Codebase Graph"
status: completed
priority: P3
effort: "25m"
dependencies: [1]
---

# Phase 2: Index Codebase Graph

## Context Links

- [Plan Overview](./plan.md)
- [Runbook](../../docs/RUNBOOK.md)
- [Contributor Guide](../../docs/CONTRIB.md)

## Overview

Index the UTH_OOSD repo into GitNexus local graph storage, preserving the no-app-change boundary.

## Key Insights

- GitNexus stores graph DB in `.gitnexus/` and registry metadata in `~/.gitnexus/`.
- `--index-only` skips AGENTS/CLAUDE file injection, skill install, and hook setup.
- Embeddings are not needed for first demo; skip `--embeddings` to keep run faster.

## Requirements

- Functional: create an index named `UTH_OOSD`.
- Functional: include TypeScript frontend and Java backend relationships.
- Functional: avoid GitNexus agent file injection.
- Non-functional: local-only, demo-only, no committed generated data.

## Architecture

```text
/home/bruk/Projects/UTH_OOSD
  -> gitnexus analyze . --index-only --name UTH_OOSD
  -> .gitnexus/ local graph DB
  -> ~/.gitnexus/registry.json repo pointer
```

GitNexus reads source files and git metadata. It does not require SPTS backend/frontend processes.

## Related Code Files

- Create: `.gitnexus/` generated local index, not for commit
- Modify: none
- Delete: none
- Read: source files under `frontend/` and `backend/`

## Implementation Steps

1. From repo root, run preferred index command:
   ```bash
   cd /home/bruk/Projects/UTH_OOSD
   npx gitnexus@1.6.8 analyze . --index-only --name UTH_OOSD
   ```
2. If npm 11 `npx` fails, run fallback:
   ```bash
   pnpm --allow-build=@ladybugdb/core --allow-build=gitnexus --allow-build=tree-sitter \
     dlx gitnexus@1.6.8 analyze . --index-only --name UTH_OOSD
   ```
3. Verify index status using the same runner:
   ```bash
   npx gitnexus@1.6.8 status
   ```
   Fallback:
   ```bash
   pnpm --allow-build=@ladybugdb/core --allow-build=gitnexus --allow-build=tree-sitter \
     dlx gitnexus@1.6.8 status
   ```
4. Check generated local artifacts:
   ```bash
   test -d .gitnexus && echo ".gitnexus exists"
   ```
5. Confirm app files remain untouched:
   ```bash
   git status --short
   ```
6. Do not stage `.gitnexus/`. If it appears in status, leave it untracked or clean it after demo.

## Todo List

- [x] Run index command with `--index-only`.
- [x] Verify GitNexus status.
- [x] Confirm `.gitnexus/` exists.
- [x] Confirm no app file changes.

## Success Criteria

- [x] Index command exits successfully.
- [x] `UTH_OOSD` appears as indexed repo.
- [x] `.gitnexus/` exists locally.
- [x] No `AGENTS.md`, `CLAUDE.md`, frontend, backend, package, or docs files changed by GitNexus.

## Risk Assessment

- Risk: generated `.gitnexus/` shows as untracked. Mitigation: do not stage; cleanup after demo if needed.
- Risk: large generated reports slow indexing. Mitigation: rely on GitNexus default max-file-size skip; rerun with `--max-file-size 512` if needed.
- Risk: partial language parsing. Mitigation: verify both Java and TypeScript nodes appear in UI before demo.

## Security Considerations

- GitNexus states processing is local, but still treat the index as source-derived data.
- Do not publish `.gitnexus/`.
- Do not run `gitnexus publish`.

## Next Steps

Proceed to Phase 3 after index status is healthy.
