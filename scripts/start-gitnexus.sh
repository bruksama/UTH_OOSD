#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

gitnexus_version="${GITNEXUS_VERSION:-1.6.8}"
repo_name="${GITNEXUS_REPO_NAME:-UTH_OOSD}"
port="${GITNEXUS_PORT:-4747}"

runner=(
  pnpm
  --allow-build=@ladybugdb/core
  --allow-build=gitnexus
  --allow-build=tree-sitter
  dlx
  "gitnexus@${gitnexus_version}"
)

usage() {
  cat <<EOF
Usage: scripts/start-gitnexus.sh [--index] [--status] [--port PORT]

Starts the local GitNexus web UI for this repo.

Options:
  --index       Rebuild the local index first using --index-only.
  --status      Print GitNexus index status and exit.
  --port PORT   Serve on PORT. Defaults to GITNEXUS_PORT or 4747.
  -h, --help    Show this help.

Environment:
  GITNEXUS_VERSION    GitNexus package version. Default: 1.6.8
  GITNEXUS_REPO_NAME  Index name. Default: UTH_OOSD
  GITNEXUS_PORT       Serve port. Default: 4747
EOF
}

require_pnpm() {
  if ! command -v pnpm >/dev/null 2>&1; then
    echo "pnpm is required to run GitNexus. Install pnpm, then retry." >&2
    exit 1
  fi
}

index_first=false
status_only=false

while (($#)); do
  case "$1" in
    --index)
      index_first=true
      shift
      ;;
    --status)
      status_only=true
      shift
      ;;
    --port)
      if [[ $# -lt 2 || "$2" == -* ]]; then
        echo "--port requires a value." >&2
        exit 1
      fi
      port="$2"
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown option: $1" >&2
      usage >&2
      exit 1
      ;;
  esac
done

require_pnpm

if [[ "$status_only" == true ]]; then
  "${runner[@]}" status
  exit 0
fi

if [[ "$index_first" == true ]]; then
  "${runner[@]}" analyze . --index-only --name "$repo_name"
fi

echo "Starting GitNexus for ${repo_name} at http://localhost:${port}"
"${runner[@]}" serve -p "$port"
