#!/bin/bash
# ShiftWell CEO Loop — Automated Company Operations
# Triggered by LaunchAgent 3x/day (8am, 1pm, 7pm ET)
# Invokes Claude Code CLI to run the CEO orchestrator

set -euo pipefail

PROJECT_DIR="$HOME/projects/ShiftWell"
CEO_PROMPT="$PROJECT_DIR/scripts/company-ops/ceo-prompt.md"
LOG_DIR="$PROJECT_DIR/logs/ceo-loop"
LOG_FILE="$LOG_DIR/$(date +%Y-%m-%d_%H%M).log"
LOCK_DIR="/tmp/shiftwell-ceo-loop.lock"

# Ensure log directory exists
mkdir -p "$LOG_DIR"

# Prevent overlapping runs (mkdir is atomic on POSIX)
if ! mkdir "$LOCK_DIR" 2>/dev/null; then
    echo "$(date): CEO Loop already running, skipping" >> "$LOG_FILE"
    exit 0
fi
trap 'rm -rf "$LOCK_DIR"' EXIT

echo "$(date): CEO Loop starting" >> "$LOG_FILE"

# Determine time of day for cycle context
HOUR=$(date +%H)
if [ "$HOUR" -lt 11 ]; then
    TIME_OF_DAY="morning"
elif [ "$HOUR" -lt 16 ]; then
    TIME_OF_DAY="midday"
else
    TIME_OF_DAY="evening"
fi

# Verify the CEO prompt exists
if [ ! -f "$CEO_PROMPT" ]; then
    echo "$(date): ERROR — CEO prompt not found at $CEO_PROMPT" >> "$LOG_FILE"
    exit 1
fi

# Construct the cycle-specific message
CYCLE_MSG="Run the CEO Loop now.

Time of day: $TIME_OF_DAY
Date: $(date +%Y-%m-%d)
Working directory: $PROJECT_DIR

Execute the full cycle as described in your system prompt:
1. Read COMPANY-OPS.md state
2. Evaluate triggers for all active departments
3. Dispatch triggered departments (up to 3 parallel)
4. Review outputs
5. Commit artifacts
6. Update COMPANY-OPS.md
7. Update CEO-BRIEFING.md

Be thorough but cost-conscious. Skip departments with no real work to do."

# Run Claude Code in print mode
cd "$PROJECT_DIR"
claude -p \
    --model sonnet \
    --dangerously-skip-permissions \
    --max-budget-usd 5 \
    --append-system-prompt-file "$CEO_PROMPT" \
    "$CYCLE_MSG" \
    >> "$LOG_FILE" 2>&1

EXIT_CODE=$?

echo "$(date): CEO Loop finished (exit code: $EXIT_CODE)" >> "$LOG_FILE"

# Keep only last 30 days of logs
find "$LOG_DIR" -name "*.log" -mtime +30 -delete 2>/dev/null

exit $EXIT_CODE
