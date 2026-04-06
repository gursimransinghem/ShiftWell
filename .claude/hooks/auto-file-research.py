#!/usr/bin/env python3
"""
PostToolUse hook: auto-files research documents.
Called by .claude/hooks/auto-file-research.sh after every Write operation.
Routes research .md files to docs/science/ or docs/research/ based on filename.
"""

import json
import sys
import os
import shutil

def main():
    try:
        data = json.load(sys.stdin)
    except Exception:
        return

    if data.get('tool_name') != 'Write':
        return

    file_path = data.get('tool_input', {}).get('file_path', '')
    if not file_path or not file_path.endswith('.md'):
        return

    project_root = '/Users/claud/Projects/ShiftWell'
    if not file_path.startswith(project_root):
        return

    basename = os.path.basename(file_path)
    basename_upper = basename.upper()

    # Research keyword detection
    RESEARCH_KEYWORDS = [
        'RESEARCH', 'ANALYSIS', 'DATABASE', 'ALGORITHM', 'COMPETITOR',
        'TRADEMARK', 'STUDY', 'DIVE', 'SURVEY', 'REVIEW', 'AUDIT',
        'SCIENCE', 'PROTOCOL', 'FINDINGS', 'EVIDENCE',
    ]
    if not any(kw in basename_upper for kw in RESEARCH_KEYWORDS):
        return

    # Already in a research or science folder — don't re-file
    known_research_dirs = [
        os.path.join(project_root, 'docs', 'research'),
        os.path.join(project_root, 'docs', 'science'),
        os.path.join(project_root, '.planning', 'research'),
    ]
    if any(file_path.startswith(d + os.sep) or file_path == d for d in known_research_dirs):
        return

    # Route: sleep/circadian science DB → docs/science/, everything else → docs/research/
    SCIENCE_DB_KEYWORDS = ['SLEEP-SCIENCE', 'SCIENCE-DATABASE', 'CIRCADIAN-DB', 'SLEEP_SCIENCE']
    if any(kw in basename_upper for kw in SCIENCE_DB_KEYWORDS):
        dest_dir = os.path.join(project_root, 'docs', 'science')
    else:
        dest_dir = os.path.join(project_root, 'docs', 'research')

    os.makedirs(dest_dir, exist_ok=True)
    dest = os.path.join(dest_dir, basename)

    if not os.path.exists(file_path):
        return

    verb = 'Updated' if os.path.exists(dest) else 'Auto-filed'
    shutil.copy2(file_path, dest)
    rel_dest = os.path.relpath(dest, project_root)
    print(f'[research-hook] {verb} → {rel_dest}', flush=True)

if __name__ == '__main__':
    main()
