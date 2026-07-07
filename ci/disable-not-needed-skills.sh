#!/usr/bin/env bash
# Disables skills that are irrelevant to the workflow being run, based on the
# ACTION_TO_PERFORM environment variable, so the Copilot CLI agent isn't
# tempted to use them.
#
# Skills are removed from the checkout (ephemeral in CI), not restored — no
# need to persist beyond the current job.
#
# Usage:
#   ACTION_TO_PERFORM=refine ./ci/disable-not-needed-skills.sh

set -euo pipefail

case "${ACTION_TO_PERFORM:-}" in
  refine)
    SKILLS_TO_DISABLE="create-skill automate-test"
    ;;
  manual-test)
    SKILLS_TO_DISABLE="create-skill refine-functional-description"
    ;;
  create-us)
    SKILLS_TO_DISABLE="create-skill automate-test refine-functional-description"
    ;;
  *)
    SKILLS_TO_DISABLE=""
    ;;
esac

for skill in $SKILLS_TO_DISABLE; do
  copilot skill remove "$skill" || echo "Skill '$skill' not found, skipping."
done
