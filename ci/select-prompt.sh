#!/usr/bin/env bash
# Selects the Copilot CLI prompt to invoke, based on the ACTION_TO_PERFORM
# environment variable, and prints it to stdout so callers can capture it.
#
# Usage:
#   ACTION_TO_PERFORM=refine ./ci/select-prompt.sh
#   PROMPT=$(ACTION_TO_PERFORM=refine ./ci/select-prompt.sh)

set -euo pipefail

case "${ACTION_TO_PERFORM:-}" in
  refine)
    echo "/new-feature"
    ;;
  manual-test)
    echo "/implementation-ready"
    ;;
  *)
    echo "Unknown ACTION_TO_PERFORM: '${ACTION_TO_PERFORM:-}'" >&2
    exit 1
    ;;
esac
