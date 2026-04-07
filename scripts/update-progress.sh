#!/bin/bash
# update-progress.sh
# Regenerates docs/PROGRESS-DASHBOARD.md from .planning/ROADMAP.md and .planning/REQUIREMENTS.md
# bash 3.2 compatible

set -e
cd "$(dirname "$0")/.."

node scripts/progress-tracker.js
echo "Dashboard updated: docs/PROGRESS-DASHBOARD.md"
