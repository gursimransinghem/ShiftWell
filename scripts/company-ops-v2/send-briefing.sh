#!/bin/bash
# ShiftWell CEO Loop v2.0 — Send daily briefing
# Called by ceo-loop.sh after cycle completes (morning only)
# Outputs to: iMessage + terminal + Obsidian (if available)
#
# Usage:
#   send-briefing.sh              # Normal: send iMessage + terminal output
#   send-briefing.sh --terminal   # Terminal output only (no iMessage)
#   send-briefing.sh --test       # Print what would be sent, don't send

set -euo pipefail

# ──────────────────────────────────────────────────────────
# Configuration
# ──────────────────────────────────────────────────────────

RECIPIENT="${CEO_LOOP_RECIPIENT:-+15862561089}"
PROJECT_DIR="${SHIFTWELL_DIR:-$HOME/Projects/ShiftWell}"
BRIEFING_FILE="$PROJECT_DIR/docs/business/CEO-BRIEFING.md"
OBSIDIAN_DIR="${OBSIDIAN_SHIFTWELL:-$HOME/Obsidian/SimVault/projects/shiftwell}"

MODE="${1:-send}"

# ──────────────────────────────────────────────────────────
# Build concise SMS-friendly summary
# ──────────────────────────────────────────────────────────

if [ ! -f "$BRIEFING_FILE" ]; then
    echo "$(date): No briefing file found at $BRIEFING_FILE"
    exit 1
fi

# Extract key data from briefing
CYCLE=$(grep -m1 "Cycle #:" "$BRIEFING_FILE" | sed 's/.*: //' | tr -d '*' || echo "?")
LAST=$(grep -m1 "Last cycle:" "$BRIEFING_FILE" | sed 's/.*: //' | tr -d '*' || echo "?")

# Count "Do This Now" items (the actionable section)
ACTION_COUNT=$(awk '/^## Do This Now/,/^## /' "$BRIEFING_FILE" | grep -c "^[0-9]\|^- \[" 2>/dev/null || echo "0")

# Count decisions needed
DECISION_COUNT=$(awk '/^## Decisions Needed/,/^## /' "$BRIEFING_FILE" | grep -c "^###\|^[0-9]\|^- \[" 2>/dev/null || echo "0")

# Count stale items
STALE_COUNT=$(awk '/^## Stale Items/,/^## /' "$BRIEFING_FILE" | grep -c "STALE\|OVERDUE" 2>/dev/null || echo "0")

# Get department health (compact)
HEALTH=""
while IFS='|' read -r _ dept status _ _; do
    dept=$(echo "$dept" | xargs 2>/dev/null || true)
    status=$(echo "$status" | xargs 2>/dev/null || true)
    case "$status" in
        *GREEN*|*✅*) HEALTH+="$dept:OK " ;;
        *YELLOW*|*⚠️*) HEALTH+="$dept:⚠️ " ;;
        *RED*|*🔴*) HEALTH+="$dept:🔴 " ;;
        *Dormant*|*💤*) ;; # skip dormant
    esac
done < <(grep -E "^\| (Product|Engineering|Marketing|Operations|Strategy)" "$BRIEFING_FILE" 2>/dev/null)

# Get "What Changed" if any
CHANGES=$(awk '/^## What Changed/,/^## /' "$BRIEFING_FILE" | grep "^- " | head -3 | sed 's/^- /  /' || echo "  (quiet cycle)")

# Build the message — concise, phone-readable
MSG="ShiftWell #${CYCLE} (${LAST})

${HEALTH}

Actions: ${ACTION_COUNT} | Decisions: ${DECISION_COUNT} | Stale: ${STALE_COUNT}

Changes:
${CHANGES}

→ docs/business/CEO-BRIEFING.md"

# ──────────────────────────────────────────────────────────
# Output
# ──────────────────────────────────────────────────────────

# Always print to terminal
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "$MSG"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Copy briefing to Obsidian
if [ -d "$OBSIDIAN_DIR" ]; then
    cp "$BRIEFING_FILE" "$OBSIDIAN_DIR/CEO-BRIEFING.md" 2>/dev/null || true
    # Also write a compact daily note
    local_date=$(date +%Y-%m-%d)
    echo "$MSG" > "$OBSIDIAN_DIR/briefing-${local_date}.md" 2>/dev/null || true
fi

# Send via iMessage (unless terminal-only or test mode)
if [ "$MODE" = "send" ]; then
    # Escape for AppleScript
    SAFE_MSG=$(echo "$MSG" | sed 's/\\/\\\\/g; s/"/\\"/g')

    osascript <<EOF 2>/dev/null || {
tell application "Messages"
    set targetService to first service whose service type = iMessage
    set targetBuddy to buddy "$RECIPIENT" of targetService
    send "$SAFE_MSG" to targetBuddy
end tell
EOF
        echo "$(date): iMessage send failed (Messages app not available?)"
        exit 1
    }
    echo "$(date): Briefing sent to $RECIPIENT via iMessage"

elif [ "$MODE" = "--test" ]; then
    echo ""
    echo "(Test mode — message NOT sent)"

elif [ "$MODE" = "--terminal" ]; then
    echo ""
    echo "(Terminal mode — iMessage skipped)"
fi

echo "$(date): Briefing delivery complete"
