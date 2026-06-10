#!/bin/bash
# ShiftWell CEO Loop v2.0 — Revamped Automated Company Operations
# Default: 1x/day at 6 AM ET via LaunchAgent
# Supports: on-demand, health check, force run, quiet skip
#
# Usage:
#   ceo-loop.sh              # Normal scheduled run (skips if nothing changed)
#   ceo-loop.sh --force      # Force run even if nothing changed
#   ceo-loop.sh --health     # Run self-diagnostics, don't execute cycle
#   ceo-loop.sh --dry-run    # Evaluate triggers, print what would dispatch, don't execute
#   ceo-loop.sh --status     # Print last cycle summary
#
# Revamp: 2026-04-18 — Cut from 3x/day to 1x/day, added change detection gate,
# quiet mode, health checks, Obsidian output, and integration hooks.

set -euo pipefail

# ──────────────────────────────────────────────────────────
# Configuration (edit these or override via environment)
# ──────────────────────────────────────────────────────────

PROJECT_DIR="${SHIFTWELL_DIR:-$HOME/Projects/ShiftWell}"
CEO_PROMPT="$PROJECT_DIR/scripts/company-ops-v2/ceo-prompt.md"
LOG_DIR="$PROJECT_DIR/logs/ceo-loop"
STATE_FILE="$PROJECT_DIR/docs/business/COMPANY-OPS.md"
BRIEFING_FILE="$PROJECT_DIR/docs/business/CEO-BRIEFING.md"
OBSIDIAN_DIR="${OBSIDIAN_SHIFTWELL:-$HOME/Obsidian/SimVault/projects/shiftwell}"
LOCK_DIR="/tmp/shiftwell-ceo-loop.lock"
LAST_RUN_FILE="$LOG_DIR/.last-run-timestamp"
LAST_SNAPSHOT_FILE="$LOG_DIR/.last-snapshot"
CLAUDE_MODEL="${CEO_LOOP_MODEL:-sonnet}"
MAX_BUDGET="${CEO_LOOP_BUDGET:-3}"
IMESSAGE_RECIPIENT="${CEO_LOOP_RECIPIENT:-+15862561089}"
LOG_RETENTION_DAYS=30
QUIET_CYCLE_LOG="$LOG_DIR/quiet-cycles.log"

# Ensure directories exist
mkdir -p "$LOG_DIR"

# ──────────────────────────────────────────────────────────
# Helpers
# ──────────────────────────────────────────────────────────

log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') | $1" >> "$LOG_FILE"
}

log_quiet() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') | SKIP | $1" >> "$QUIET_CYCLE_LOG"
}

die() {
    echo "ERROR: $1" >&2
    [ -n "${LOG_FILE:-}" ] && log "FATAL: $1"
    exit 1
}

# Resolve PATH for LaunchAgent environment (critical fix from v1)
setup_path() {
    # LaunchAgent doesn't inherit shell profile — npm/node won't be found
    # Try common locations for node/npm
    for dir in \
        "$HOME/.nvm/versions/node"/*/bin \
        "$HOME/.volta/bin" \
        "$HOME/.fnm/aliases/default/bin" \
        "/opt/homebrew/bin" \
        "/usr/local/bin" \
        "$HOME/.local/bin"; do
        [ -d "$dir" ] && export PATH="$dir:$PATH"
    done

    # Also source profile if it exists (catches custom PATH additions)
    [ -f "$HOME/.zshrc" ] && source "$HOME/.zshrc" 2>/dev/null || true
    [ -f "$HOME/.bashrc" ] && source "$HOME/.bashrc" 2>/dev/null || true
}

# ──────────────────────────────────────────────────────────
# Health Check
# ──────────────────────────────────────────────────────────

health_check() {
    echo "=== ShiftWell CEO Loop v2.0 — Health Check ==="
    echo ""
    local issues=0

    # 1. Claude CLI
    if command -v claude &>/dev/null; then
        echo "  [OK] Claude CLI found: $(which claude)"
    else
        echo "  [FAIL] Claude CLI not in PATH"
        issues=$((issues + 1))
    fi

    # 2. Node/npm
    if command -v node &>/dev/null; then
        echo "  [OK] Node found: $(node --version)"
    else
        echo "  [FAIL] Node not in PATH — Engineering triggers will fail"
        issues=$((issues + 1))
    fi
    if command -v npm &>/dev/null; then
        echo "  [OK] npm found: $(npm --version)"
    else
        echo "  [FAIL] npm not in PATH — test runner unavailable"
        issues=$((issues + 1))
    fi

    # 3. Project directory
    if [ -d "$PROJECT_DIR" ]; then
        echo "  [OK] Project dir: $PROJECT_DIR"
    else
        echo "  [FAIL] Project dir not found: $PROJECT_DIR"
        issues=$((issues + 1))
    fi

    # 4. CEO prompt
    if [ -f "$CEO_PROMPT" ]; then
        echo "  [OK] CEO prompt: $CEO_PROMPT ($(wc -l < "$CEO_PROMPT") lines)"
    else
        echo "  [FAIL] CEO prompt not found: $CEO_PROMPT"
        issues=$((issues + 1))
    fi

    # 5. State files
    for f in "$STATE_FILE" "$BRIEFING_FILE"; do
        if [ -f "$f" ]; then
            echo "  [OK] State file: $f"
        else
            echo "  [WARN] State file missing: $f (will be created on first run)"
        fi
    done

    # 6. Lock file
    if [ -d "$LOCK_DIR" ]; then
        echo "  [WARN] Lock dir exists — previous run may have crashed: $LOCK_DIR"
        issues=$((issues + 1))
    else
        echo "  [OK] No stale lock"
    fi

    # 7. Last run
    if [ -f "$LAST_RUN_FILE" ]; then
        local last_run
        last_run=$(cat "$LAST_RUN_FILE")
        local age_hours=$(( ($(date +%s) - last_run) / 3600 ))
        echo "  [OK] Last run: ${age_hours}h ago"
    else
        echo "  [INFO] No previous run recorded"
    fi

    # 8. Obsidian output
    if [ -d "$OBSIDIAN_DIR" ]; then
        echo "  [OK] Obsidian output: $OBSIDIAN_DIR"
    else
        echo "  [WARN] Obsidian dir not found: $OBSIDIAN_DIR (will skip Obsidian output)"
    fi

    # 9. Git status
    if [ -d "$PROJECT_DIR/.git" ]; then
        cd "$PROJECT_DIR"
        local branch
        branch=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")
        local ahead
        ahead=$(git rev-list --count HEAD --not origin/main 2>/dev/null || echo "?")
        echo "  [OK] Git: branch=$branch, ahead=$ahead"
    else
        echo "  [FAIL] Not a git repo: $PROJECT_DIR"
        issues=$((issues + 1))
    fi

    # 10. Disk space for logs
    local log_size
    log_size=$(du -sh "$LOG_DIR" 2>/dev/null | cut -f1)
    local log_count
    log_count=$(find "$LOG_DIR" -name "*.log" 2>/dev/null | wc -l | tr -d ' ')
    echo "  [OK] Logs: ${log_count} files, ${log_size}"

    echo ""
    if [ "$issues" -eq 0 ]; then
        echo "  Health: ALL CLEAR — ready to run"
    else
        echo "  Health: $issues ISSUE(S) FOUND — fix before running"
    fi
    echo ""
    return $issues
}

# ──────────────────────────────────────────────────────────
# Change Detection (the key v2 improvement)
# ──────────────────────────────────────────────────────────

take_snapshot() {
    cd "$PROJECT_DIR"
    {
        # Git state
        git log --oneline -1 2>/dev/null || echo "no-git"
        git diff --stat HEAD 2>/dev/null || echo "no-diff"
        # Key file checksums
        md5sum "$STATE_FILE" 2>/dev/null || echo "no-state"
        md5sum docs/business/FINANCIAL_TRACKER.md 2>/dev/null || echo "no-financial"
        # Test count (if npm available)
        if command -v npx &>/dev/null; then
            npx jest --listTests 2>/dev/null | wc -l || echo "0"
        else
            echo "npm-unavailable"
        fi
    } | md5sum | cut -d' ' -f1
}

has_meaningful_changes() {
    cd "$PROJECT_DIR"

    # 1. Check if any non-CEO-Loop git commits since last run
    if [ -f "$LAST_RUN_FILE" ]; then
        local last_run
        last_run=$(cat "$LAST_RUN_FILE")
        local last_date
        last_date=$(date -r "$last_run" '+%Y-%m-%d %H:%M:%S' 2>/dev/null || date -d "@$last_run" '+%Y-%m-%d %H:%M:%S' 2>/dev/null || echo "2020-01-01")
        local new_commits
        new_commits=$(git log --oneline --since="$last_date" --grep="CEO Loop" --invert-grep 2>/dev/null | wc -l | tr -d ' ')
        if [ "$new_commits" -gt 0 ]; then
            echo "git:${new_commits}_new_commits"
            return 0
        fi
    else
        # First run ever — always has changes
        echo "first_run"
        return 0
    fi

    # 2. Check snapshot for any file-level changes
    local current_snapshot
    current_snapshot=$(take_snapshot)
    if [ -f "$LAST_SNAPSHOT_FILE" ]; then
        local prev_snapshot
        prev_snapshot=$(cat "$LAST_SNAPSHOT_FILE")
        if [ "$current_snapshot" != "$prev_snapshot" ]; then
            echo "snapshot_changed"
            return 0
        fi
    else
        echo "no_previous_snapshot"
        return 0
    fi

    # 3. Check time-based triggers (Marketing >3 days, monthly ops, etc.)
    # Extract last Marketing run date from COMPANY-OPS.md
    if [ -f "$STATE_FILE" ]; then
        local last_marketing
        last_marketing=$(grep -i "Marketing" "$STATE_FILE" | grep -o '[0-9]\{4\}-[0-9]\{2\}-[0-9]\{2\}' | head -1 || echo "")
        if [ -n "$last_marketing" ]; then
            local marketing_epoch
            marketing_epoch=$(date -d "$last_marketing" +%s 2>/dev/null || date -j -f "%Y-%m-%d" "$last_marketing" +%s 2>/dev/null || echo "0")
            local now_epoch
            now_epoch=$(date +%s)
            local days_since=$(( (now_epoch - marketing_epoch) / 86400 ))
            if [ "$days_since" -ge 3 ]; then
                echo "marketing_due:${days_since}_days"
                return 0
            fi
        fi
    fi

    # 4. Check if first of month (Operations monthly review)
    if [ "$(date +%d)" = "01" ]; then
        echo "first_of_month"
        return 0
    fi

    # 5. Check for stale pending approvals (>7 days old)
    if [ -f "$STATE_FILE" ]; then
        local stale_approvals
        stale_approvals=$(grep -c "CRITICAL\|HIGH" "$STATE_FILE" 2>/dev/null || echo "0")
        if [ "$stale_approvals" -gt 0 ]; then
            # If there are critical/high items, run to nag about them
            local last_nag_file="$LOG_DIR/.last-nag"
            if [ -f "$last_nag_file" ]; then
                local last_nag
                last_nag=$(cat "$last_nag_file")
                local nag_age=$(( ($(date +%s) - last_nag) / 86400 ))
                if [ "$nag_age" -ge 3 ]; then
                    echo "stale_approvals:${stale_approvals}_items"
                    date +%s > "$last_nag_file"
                    return 0
                fi
            else
                date +%s > "$last_nag_file"
                echo "stale_approvals:${stale_approvals}_items"
                return 0
            fi
        fi
    fi

    # No meaningful changes detected
    return 1
}

# ──────────────────────────────────────────────────────────
# Status
# ──────────────────────────────────────────────────────────

show_status() {
    echo "=== ShiftWell CEO Loop v2.0 — Status ==="
    echo ""

    if [ -f "$LAST_RUN_FILE" ]; then
        local last_run
        last_run=$(cat "$LAST_RUN_FILE")
        local age_hours=$(( ($(date +%s) - last_run) / 3600 ))
        echo "  Last run: ${age_hours}h ago ($(date -r "$last_run" '+%Y-%m-%d %H:%M' 2>/dev/null || date -d "@$last_run" '+%Y-%m-%d %H:%M' 2>/dev/null))"
    else
        echo "  Last run: Never"
    fi

    if [ -f "$STATE_FILE" ]; then
        local cycle_count
        cycle_count=$(grep "Cycle count:" "$STATE_FILE" | sed 's/[^0-9]*//g' | head -1 || echo "?")
        echo "  Total cycles: $cycle_count"
    fi

    if [ -f "$QUIET_CYCLE_LOG" ]; then
        local quiet_today
        quiet_today=$(grep "$(date +%Y-%m-%d)" "$QUIET_CYCLE_LOG" 2>/dev/null | wc -l | tr -d ' ')
        echo "  Quiet skips today: $quiet_today"
    fi

    echo ""
    echo "  Change detection:"
    local change_reason
    if change_reason=$(has_meaningful_changes); then
        echo "    [WOULD RUN] Reason: $change_reason"
    else
        echo "    [WOULD SKIP] No meaningful changes since last run"
    fi

    echo ""
}

# ──────────────────────────────────────────────────────────
# Integration Hooks (pre/post cycle)
# ──────────────────────────────────────────────────────────

collect_integration_data() {
    cd "$PROJECT_DIR"
    local data_file="$LOG_DIR/.integration-data.md"

    {
        echo "## Integration Data (auto-collected $(date '+%Y-%m-%d %H:%M'))"
        echo ""

        # Git activity since last run
        echo "### Git Activity"
        if [ -f "$LAST_RUN_FILE" ]; then
            local since_date
            since_date=$(date -r "$(cat "$LAST_RUN_FILE")" '+%Y-%m-%d' 2>/dev/null || echo "2020-01-01")
            git log --oneline --since="$since_date" 2>/dev/null | head -20 || echo "No commits"
        else
            git log --oneline -10 2>/dev/null || echo "No commits"
        fi
        echo ""

        # Test results (if npm available)
        echo "### Test Results"
        if command -v npx &>/dev/null; then
            local test_output
            test_output=$(npx jest --ci --silent 2>&1 | tail -5 || echo "Tests could not run")
            echo "\`\`\`"
            echo "$test_output"
            echo "\`\`\`"
        else
            echo "npm/npx not in PATH — cannot run tests"
        fi
        echo ""

        # Dependency check
        echo "### Dependency Status"
        if command -v npm &>/dev/null; then
            local outdated
            outdated=$(npm outdated --json 2>/dev/null | head -30 || echo "{}")
            local outdated_count
            outdated_count=$(echo "$outdated" | grep -c '"current"' 2>/dev/null || echo "0")
            echo "Outdated packages: $outdated_count"
            if command -v npm &>/dev/null; then
                local audit
                audit=$(npm audit --json 2>/dev/null | grep -o '"total":[[:space:]]*[0-9]*' | head -1 || echo "unknown")
                echo "Audit vulnerabilities: $audit"
            fi
        else
            echo "npm not in PATH"
        fi
        echo ""

        # TypeScript errors
        echo "### TypeScript Health"
        if command -v npx &>/dev/null; then
            local ts_errors
            ts_errors=$(npx tsc --noEmit 2>&1 | grep -c "error TS" || echo "0")
            echo "TS errors: $ts_errors"
        else
            echo "npx not in PATH"
        fi
        echo ""

        # Uncommitted changes
        echo "### Working Tree"
        git status --short 2>/dev/null | head -20 || echo "Clean"
        echo ""

    } > "$data_file"

    echo "$data_file"
}

# ──────────────────────────────────────────────────────────
# Obsidian Output
# ──────────────────────────────────────────────────────────

copy_to_obsidian() {
    if [ -d "$OBSIDIAN_DIR" ]; then
        # Copy briefing
        if [ -f "$BRIEFING_FILE" ]; then
            cp "$BRIEFING_FILE" "$OBSIDIAN_DIR/CEO-BRIEFING.md"
        fi
        # Also write a dated cycle log
        local obsidian_log="$OBSIDIAN_DIR/ceo-cycle-$(date +%Y-%m-%d).md"
        if [ -f "$LOG_FILE" ]; then
            cp "$LOG_FILE" "$obsidian_log"
        fi
        log "Obsidian: briefing and cycle log copied to $OBSIDIAN_DIR"
    fi
}

# ──────────────────────────────────────────────────────────
# Main Execution
# ──────────────────────────────────────────────────────────

MODE="${1:-run}"
LOG_FILE="$LOG_DIR/$(date +%Y-%m-%d_%H%M).log"

# Handle subcommands
case "$MODE" in
    --health)
        setup_path
        health_check
        exit $?
        ;;
    --status)
        setup_path
        show_status
        exit 0
        ;;
    --dry-run)
        setup_path
        echo "=== DRY RUN — Trigger Evaluation ==="
        change_reason=$(has_meaningful_changes) && echo "WOULD RUN: $change_reason" || echo "WOULD SKIP: no changes"
        exit 0
        ;;
    --force|run|"")
        # Continue to main execution
        ;;
    *)
        echo "Usage: ceo-loop.sh [--force|--health|--status|--dry-run]"
        exit 1
        ;;
esac

# Fix PATH for LaunchAgent environment
setup_path

# Prevent overlapping runs (mkdir is atomic on POSIX)
if ! mkdir "$LOCK_DIR" 2>/dev/null; then
    # Check if lock is stale (older than 30 minutes)
    if [ -f "$LOCK_DIR/pid" ]; then
        local_pid=$(cat "$LOCK_DIR/pid" 2>/dev/null || echo "0")
        if ! kill -0 "$local_pid" 2>/dev/null; then
            echo "$(date): Removing stale lock (PID $local_pid is dead)" >> "$LOG_FILE"
            rm -rf "$LOCK_DIR"
            mkdir "$LOCK_DIR" 2>/dev/null || die "Cannot acquire lock even after cleanup"
        else
            echo "$(date): CEO Loop already running (PID $local_pid), skipping" >> "$LOG_FILE"
            exit 0
        fi
    else
        # Lock dir exists but no PID file — stale, clean up
        rm -rf "$LOCK_DIR"
        mkdir "$LOCK_DIR" 2>/dev/null || die "Cannot acquire lock"
    fi
fi
echo $$ > "$LOCK_DIR/pid"
trap 'rm -rf "$LOCK_DIR"' EXIT

log "CEO Loop v2.0 starting (mode: $MODE)"

# ──────────────────────────────────────────────────────────
# Change Detection Gate (skip if nothing meaningful changed)
# ──────────────────────────────────────────────────────────

if [ "$MODE" != "--force" ]; then
    change_reason=$(has_meaningful_changes) || {
        log_quiet "No meaningful changes since last run. Skipping."
        log "QUIET SKIP — no changes detected. Use --force to override."
        # Update last-run timestamp even on skip
        date +%s > "$LAST_RUN_FILE"
        exit 0
    }
    log "Change detected: $change_reason"
else
    change_reason="forced"
    log "Force mode — skipping change detection"
fi

# ──────────────────────────────────────────────────────────
# Collect Integration Data
# ──────────────────────────────────────────────────────────

log "Collecting integration data..."
INTEGRATION_FILE=$(collect_integration_data)
log "Integration data saved to $INTEGRATION_FILE"

# ──────────────────────────────────────────────────────────
# Verify CEO Prompt
# ──────────────────────────────────────────────────────────

if [ ! -f "$CEO_PROMPT" ]; then
    die "CEO prompt not found at $CEO_PROMPT"
fi

# ──────────────────────────────────────────────────────────
# Build Cycle Message
# ──────────────────────────────────────────────────────────

HOUR=$(date +%H)
if [ "$HOUR" -lt 11 ]; then
    TIME_OF_DAY="morning"
elif [ "$HOUR" -lt 16 ]; then
    TIME_OF_DAY="midday"
else
    TIME_OF_DAY="evening"
fi

# Read integration data for inclusion in prompt
INTEGRATION_DATA=$(cat "$INTEGRATION_FILE" 2>/dev/null || echo "Integration data unavailable")

CYCLE_MSG="Run the CEO Loop now.

Time of day: $TIME_OF_DAY
Date: $(date +%Y-%m-%d)
Working directory: $PROJECT_DIR
Change trigger: $change_reason

## Pre-Collected Integration Data

$INTEGRATION_DATA

## Instructions

Execute the CEO Loop cycle:
1. Read COMPANY-OPS.md state
2. Review the pre-collected integration data above (git, tests, deps, TS errors)
3. Evaluate triggers for all active departments using real data
4. Dispatch triggered departments (up to 3 parallel)
5. Review outputs for quality
6. Commit ONLY if real artifacts were produced (no quiet-cycle commits)
7. Update COMPANY-OPS.md state
8. Update CEO-BRIEFING.md with actionable briefing

IMPORTANT RULES:
- If no departments trigger, write a 1-line entry in COMPANY-OPS.md Recent Activity and EXIT. Do NOT commit.
- If you identify a fix that is <10 lines and your analysis is high-confidence, EXECUTE IT. Don't add to Pending Approvals.
- Focus the briefing on DECISIONS and ACTIONS, not status reports.
- Flag any Pending Approval older than 7 days as STALE.
- Only check dormant department activation triggers on Mondays."

# ──────────────────────────────────────────────────────────
# Execute Claude Code
# ──────────────────────────────────────────────────────────

log "Invoking Claude Code (model: $CLAUDE_MODEL, budget: \$$MAX_BUDGET)"

cd "$PROJECT_DIR"
claude -p \
    --model "$CLAUDE_MODEL" \
    --dangerously-skip-permissions \
    --max-budget-usd "$MAX_BUDGET" \
    --append-system-prompt-file "$CEO_PROMPT" \
    "$CYCLE_MSG" \
    >> "$LOG_FILE" 2>&1

EXIT_CODE=$?
log "Claude Code finished (exit: $EXIT_CODE)"

# ──────────────────────────────────────────────────────────
# Post-Cycle
# ──────────────────────────────────────────────────────────

# Update run tracking
date +%s > "$LAST_RUN_FILE"
take_snapshot > "$LAST_SNAPSHOT_FILE"

# Copy to Obsidian
copy_to_obsidian

# Send iMessage briefing (only on morning runs, once per day)
SEND_SCRIPT="$PROJECT_DIR/scripts/company-ops-v2/send-briefing.sh"
SENT_MARKER="/tmp/shiftwell-briefing-sent-$(date +%Y-%m-%d)"
if [ "$TIME_OF_DAY" = "morning" ] && [ ! -f "$SENT_MARKER" ] && [ "$EXIT_CODE" -eq 0 ]; then
    if [ -x "$SEND_SCRIPT" ]; then
        log "Sending daily briefing via iMessage"
        bash "$SEND_SCRIPT" >> "$LOG_FILE" 2>&1 || log "Briefing send failed"
        touch "$SENT_MARKER"
    fi
fi

# Log rotation — keep last N days
find "$LOG_DIR" -name "*.log" -mtime +"$LOG_RETENTION_DAYS" -delete 2>/dev/null
# Also rotate quiet cycle log if it's over 1MB
if [ -f "$QUIET_CYCLE_LOG" ] && [ "$(stat -f%z "$QUIET_CYCLE_LOG" 2>/dev/null || stat -c%s "$QUIET_CYCLE_LOG" 2>/dev/null || echo 0)" -gt 1048576 ]; then
    mv "$QUIET_CYCLE_LOG" "$QUIET_CYCLE_LOG.old"
fi

log "CEO Loop v2.0 complete"
exit $EXIT_CODE
