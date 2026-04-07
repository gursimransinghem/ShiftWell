#!/bin/bash
# ShiftWell CEO Loop — Send daily briefing via iMessage
# Called by ceo-loop.sh after cycle completes (morning only)

set -euo pipefail

RECIPIENT="+15862561089"
BRIEFING_FILE="$HOME/projects/ShiftWell/docs/business/CEO-BRIEFING.md"

if [ ! -f "$BRIEFING_FILE" ]; then
    echo "$(date): No briefing file found at $BRIEFING_FILE"
    exit 1
fi

# Extract the key sections: approvals + what happened (skip full tables)
# Build a concise SMS-friendly summary
CYCLE=$(grep "Cycle #:" "$BRIEFING_FILE" | head -1 | sed 's/.*: //')
LAST=$(grep "Last cycle:" "$BRIEFING_FILE" | head -1 | sed 's/.*: //')

# Count approvals needing attention
APPROVALS=$(grep -c "^### " "$BRIEFING_FILE" 2>/dev/null || echo "0")

# Get department health lines
HEALTH=$(grep -E "^\| (Product|Engineering|Marketing|Operations|Strategy) " "$BRIEFING_FILE" | sed 's/|//g' | awk '{print $1": "$2}' | tr '\n' ', ' | sed 's/, $//')

# Build the message
MSG="ShiftWell CEO Briefing #${CYCLE}
${LAST}

Departments: ${HEALTH}

${APPROVALS} items need your approval.

Full briefing: docs/business/CEO-BRIEFING.md"

# Escape for AppleScript
SAFE_MSG=$(echo "$MSG" | sed 's/\\/\\\\/g; s/"/\\"/g')

osascript <<EOF
tell application "Messages"
  set targetService to first service whose service type = iMessage
  set targetBuddy to buddy "$RECIPIENT" of targetService
  send "$SAFE_MSG" to targetBuddy
end tell
EOF

echo "$(date): Briefing sent to $RECIPIENT"
