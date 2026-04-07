#!/usr/bin/env node
'use strict';

/**
 * ShiftWell Progress Tracker
 * Parses ROADMAP.md and REQUIREMENTS.md and generates PROGRESS-DASHBOARD.md
 * No external dependencies — pure Node.js
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const ROADMAP_PATH = path.join(ROOT, '.planning', 'ROADMAP.md');
const REQUIREMENTS_PATH = path.join(ROOT, '.planning', 'REQUIREMENTS.md');
const JEST_CACHE_PATH = path.join(ROOT, '.jest-results.json');
const OUTPUT_PATH = path.join(ROOT, 'docs', 'PROGRESS-DASHBOARD.md');

// ---------------------------------------------------------------------------
// Parsers
// ---------------------------------------------------------------------------

function parseMilestones(roadmapText) {
  // Extract the milestones summary block at the top
  const milestonePattern = /^- (✅|🚧|⏳) \*\*([^*]+)\*\* — (.+)$/gm;
  const milestones = [];
  let match;
  while ((match = milestonePattern.exec(roadmapText)) !== null) {
    const icon = match[1];
    const name = match[2];
    const description = match[3];
    let status = 'pending';
    if (icon === '✅') status = 'complete';
    else if (icon === '🚧') status = 'in-progress';
    milestones.push({ icon, name, status, description });
  }
  return milestones;
}

function parsePhases(roadmapText) {
  // Match phase lines: - [x], - [ ], - [~]
  // Format: - [x] **Phase N: Title** — Description (completed DATE)
  const phasePattern = /^- \[([x ~])\] \*\*Phase (\d+): ([^*]+)\*\* — ([^\n]+)$/gm;
  const phases = [];
  let match;
  while ((match = phasePattern.exec(roadmapText)) !== null) {
    const checkChar = match[1];
    const number = parseInt(match[2], 10);
    const title = match[3].trim();
    const detail = match[4].trim();

    let status = 'pending';
    if (checkChar === 'x') status = 'complete';
    else if (checkChar === '~') status = 'partial';

    // Extract completion date if present
    const dateMatch = detail.match(/\((?:completed|verified complete) (\d{4}-\d{2}-\d{2})\)/);
    const completedDate = dateMatch ? dateMatch[1] : null;

    // Extract blocker if present
    const blockerMatch = detail.match(/\(BLOCKED: ([^)]+)\)/);
    const blocker = blockerMatch ? blockerMatch[1] : null;

    // Determine milestone from phase number
    let milestone = 'v1.0';
    if (number >= 7 && number <= 12) milestone = 'v1.1';
    else if (number >= 13 && number <= 18) milestone = 'v1.2';
    else if (number >= 19 && number <= 25) milestone = 'v1.3';
    else if (number >= 26 && number <= 31) milestone = 'v1.4';
    else if (number >= 32 && number <= 38) milestone = 'v2.0';

    phases.push({ number, title, status, completedDate, blocker, milestone, detail });
  }
  return phases;
}

function parseRequirements(reqText) {
  // Match requirement lines: - [x] **CODE**: Description (status DATE)
  const reqPattern = /^- \[([x ])\] \*\*([A-Z0-9-]+)\*\*: ([^\n]+)$/gm;
  const requirements = [];
  let match;
  while ((match = reqPattern.exec(reqText)) !== null) {
    const done = match[1] === 'x';
    const code = match[2];
    const description = match[3].trim();

    // Determine category from code prefix
    const prefix = code.replace(/-\d+$/, '');
    const categories = {
      BUG: 'Bug Fixes',
      BRAIN: 'Adaptive Brain',
      TF: 'TestFlight Prep',
      APP: 'App Store Prep',
      LIVE: 'ActivityKit',
      RES: 'Research',
      HK: 'HealthKit',
      GRO: 'Growth',
      PREM: 'Premium Gating',
      AI: 'AI Features',
      PRED: 'Predictive',
      PAT: 'Pattern Recognition',
      INT: 'Intelligence Polish',
      ENT: 'Enterprise',
      ASO: 'App Store Optimization',
      WATCH: 'Apple Watch',
      AUTO: 'Autopilot',
      VAL: 'Validation Study',
      AND: 'Android',
    };

    requirements.push({
      code,
      description,
      done,
      category: categories[prefix] || prefix,
    });
  }
  return requirements;
}

function getTestCount() {
  // Try to read cached jest results
  if (fs.existsSync(JEST_CACHE_PATH)) {
    try {
      const data = JSON.parse(fs.readFileSync(JEST_CACHE_PATH, 'utf8'));
      return {
        total: data.numTotalTests || 0,
        passed: data.numPassedTests || 0,
        failed: data.numFailedTests || 0,
        timestamp: data.timestamp || null,
      };
    } catch (e) {
      // fall through to default
    }
  }
  // Fall back to the count documented in CLAUDE.md
  return { total: 116, passed: 116, failed: 0, timestamp: null, source: 'documented' };
}

// ---------------------------------------------------------------------------
// Progress bar helper
// ---------------------------------------------------------------------------

function progressBar(done, total, width) {
  width = width || 20;
  if (total === 0) return '[' + '-'.repeat(width) + '] 0/0';
  const filled = Math.round((done / total) * width);
  const empty = width - filled;
  const pct = Math.round((done / total) * 100);
  return '[' + '█'.repeat(filled) + '░'.repeat(empty) + '] ' + done + '/' + total + ' (' + pct + '%)';
}

// ---------------------------------------------------------------------------
// Dashboard generator
// ---------------------------------------------------------------------------

function generateDashboard(milestones, phases, requirements, testInfo) {
  const now = new Date().toISOString().split('T')[0];
  const lines = [];

  lines.push('# ShiftWell — Progress Dashboard');
  lines.push('');
  lines.push('> Auto-generated by `scripts/progress-tracker.js`. Run `bash scripts/update-progress.sh` to refresh.');
  lines.push('> Last updated: ' + now);
  lines.push('');
  lines.push('---');
  lines.push('');

  // ---------------------------------------------------------------------------
  // Section 1: Milestone Progress Bars
  // ---------------------------------------------------------------------------
  lines.push('## Milestone Progress');
  lines.push('');

  const milestonePhaseMap = {
    'v1.0': { range: [1, 6], label: 'v1.0 TestFlight' },
    'v1.1': { range: [7, 12], label: 'v1.1 Adaptive Brain' },
    'v1.2': { range: [13, 18], label: 'v1.2 HealthKit Closed Loop' },
    'v1.3': { range: [19, 25], label: 'v1.3 AI Intelligence Layer' },
    'v1.4': { range: [26, 31], label: 'v1.4 Platform & Enterprise' },
    'v2.0': { range: [32, 38], label: 'v2.0 Advanced Intelligence' },
  };

  const milestoneOrder = ['v1.0', 'v1.1', 'v1.2', 'v1.3', 'v1.4', 'v2.0'];

  milestoneOrder.forEach(function(key) {
    const info = milestonePhaseMap[key];
    const inMilestone = phases.filter(function(p) {
      return p.number >= info.range[0] && p.number <= info.range[1];
    });
    const done = inMilestone.filter(function(p) { return p.status === 'complete'; }).length;
    const total = inMilestone.length;

    // Find milestone status from parsed milestones list
    const ms = milestones.find(function(m) { return m.name.indexOf(key) !== -1; });
    const statusBadge = ms ? ms.icon : '⏳';

    lines.push('### ' + statusBadge + ' ' + info.label);
    lines.push('');
    lines.push('`' + progressBar(done, total) + '`');
    lines.push('');

    if (inMilestone.length > 0) {
      inMilestone.forEach(function(p) {
        let icon = '[ ]';
        if (p.status === 'complete') icon = '[x]';
        else if (p.status === 'partial') icon = '[~]';
        const dateStr = p.completedDate ? ' — ' + p.completedDate : '';
        const blockerStr = p.blocker ? ' _(BLOCKED: ' + p.blocker + ')_' : '';
        lines.push('- ' + icon + ' Phase ' + p.number + ': ' + p.title + dateStr + blockerStr);
      });
    }
    lines.push('');
  });

  lines.push('---');
  lines.push('');

  // ---------------------------------------------------------------------------
  // Section 2: Phase Completion Timeline
  // ---------------------------------------------------------------------------
  lines.push('## Phase Completion Timeline');
  lines.push('');
  lines.push('| Phase | Title | Milestone | Status | Completed |');
  lines.push('|-------|-------|-----------|--------|-----------|');

  const completedPhases = phases.filter(function(p) { return p.status === 'complete'; });
  completedPhases.forEach(function(p) {
    lines.push('| ' + p.number + ' | ' + p.title + ' | ' + p.milestone + ' | ✅ Complete | ' + (p.completedDate || '—') + ' |');
  });

  const partialPhases = phases.filter(function(p) { return p.status === 'partial'; });
  partialPhases.forEach(function(p) {
    lines.push('| ' + p.number + ' | ' + p.title + ' | ' + p.milestone + ' | 〜 Partial | ' + (p.completedDate || '—') + ' |');
  });

  const blockedPhases = phases.filter(function(p) { return p.status !== 'complete' && p.status !== 'partial' && p.blocker; });
  blockedPhases.forEach(function(p) {
    lines.push('| ' + p.number + ' | ' + p.title + ' | ' + p.milestone + ' | 🚫 Blocked | — |');
  });

  lines.push('');
  lines.push('---');
  lines.push('');

  // ---------------------------------------------------------------------------
  // Section 3: Requirements Coverage
  // ---------------------------------------------------------------------------
  lines.push('## Requirements Coverage');
  lines.push('');
  lines.push('| Category | Complete | Total | Progress |');
  lines.push('|----------|----------|-------|----------|');

  // Group by milestone (using traceability section pattern if needed)
  // Group by version bucket based on requirement code ranges
  const milestoneReqMap = {
    'v1.1': ['BUG', 'BRAIN', 'TF', 'APP', 'LIVE'],
    'v1.2': ['HK', 'GRO', 'PREM'],
    'v1.3': ['AI', 'PRED', 'PAT', 'INT'],
    'v1.4': ['ENT', 'ASO'],
    'v2.0': ['WATCH', 'AUTO', 'VAL', 'AND'],
    'Research': ['RES'],
  };

  // Compute per-category stats
  const categoryStats = {};
  requirements.forEach(function(r) {
    const cat = r.category;
    if (!categoryStats[cat]) categoryStats[cat] = { done: 0, total: 0 };
    categoryStats[cat].total++;
    if (r.done) categoryStats[cat].done++;
  });

  // Print by milestone group
  const milestoneGroupOrder = ['v1.1', 'v1.2', 'v1.3', 'v1.4', 'v2.0', 'Research'];
  const categoryNames = {
    'Bug Fixes': 'v1.1', 'Adaptive Brain': 'v1.1', 'TestFlight Prep': 'v1.1',
    'App Store Prep': 'v1.1', 'ActivityKit': 'v1.1',
    'HealthKit': 'v1.2', 'Growth': 'v1.2', 'Premium Gating': 'v1.2',
    'AI Features': 'v1.3', 'Predictive': 'v1.3', 'Pattern Recognition': 'v1.3', 'Intelligence Polish': 'v1.3',
    'Enterprise': 'v1.4', 'App Store Optimization': 'v1.4',
    'Apple Watch': 'v2.0', 'Autopilot': 'v2.0', 'Validation Study': 'v2.0', 'Android': 'v2.0',
    'Research': 'Research',
  };

  const printedCategories = new Set();
  milestoneGroupOrder.forEach(function(group) {
    let groupDone = 0, groupTotal = 0;
    const groupCats = Object.keys(categoryStats).filter(function(cat) {
      return categoryNames[cat] === group;
    });
    groupCats.forEach(function(cat) {
      groupDone += categoryStats[cat].done;
      groupTotal += categoryStats[cat].total;
      printedCategories.add(cat);
    });
    if (groupTotal > 0) {
      lines.push('| **' + group + '** | ' + groupDone + ' | ' + groupTotal + ' | `' + progressBar(groupDone, groupTotal, 15) + '` |');
    }
  });

  // Any leftover categories not in the map
  Object.keys(categoryStats).forEach(function(cat) {
    if (!printedCategories.has(cat)) {
      const s = categoryStats[cat];
      lines.push('| ' + cat + ' | ' + s.done + ' | ' + s.total + ' | `' + progressBar(s.done, s.total, 15) + '` |');
    }
  });

  // Grand total
  const grandDone = requirements.filter(function(r) { return r.done; }).length;
  const grandTotal = requirements.length;
  lines.push('| **TOTAL** | **' + grandDone + '** | **' + grandTotal + '** | `' + progressBar(grandDone, grandTotal, 15) + '` |');

  lines.push('');
  lines.push('---');
  lines.push('');

  // ---------------------------------------------------------------------------
  // Section 4: Test Count
  // ---------------------------------------------------------------------------
  lines.push('## Test Coverage');
  lines.push('');
  if (testInfo.source === 'documented') {
    lines.push('> Source: documented count in CLAUDE.md (run `npm test` and cache results to `.jest-results.json` for live tracking)');
    lines.push('');
  } else if (testInfo.timestamp) {
    lines.push('> Last run: ' + testInfo.timestamp);
    lines.push('');
  }
  lines.push('| Metric | Count |');
  lines.push('|--------|-------|');
  lines.push('| Total Tests | ' + testInfo.total + ' |');
  lines.push('| Passing | ' + testInfo.passed + ' |');
  lines.push('| Failing | ' + testInfo.failed + ' |');
  lines.push('| Pass Rate | ' + (testInfo.total > 0 ? Math.round((testInfo.passed / testInfo.total) * 100) : 0) + '% |');
  lines.push('');
  lines.push('---');
  lines.push('');

  // ---------------------------------------------------------------------------
  // Section 5: Blockers
  // ---------------------------------------------------------------------------
  const allBlockers = phases.filter(function(p) { return p.blocker; });
  lines.push('## Blockers');
  lines.push('');
  if (allBlockers.length === 0) {
    lines.push('_No current blockers._');
  } else {
    allBlockers.forEach(function(p) {
      lines.push('- **Phase ' + p.number + ': ' + p.title + '** (' + p.milestone + ')');
      lines.push('  - ' + p.blocker);
    });
  }
  lines.push('');
  lines.push('---');
  lines.push('');

  // ---------------------------------------------------------------------------
  // Section 6: Next Up per Milestone
  // ---------------------------------------------------------------------------
  lines.push('## Next Up');
  lines.push('');
  lines.push('First incomplete phase per milestone:');
  lines.push('');

  milestoneOrder.forEach(function(key) {
    const info = milestonePhaseMap[key];
    const nextPhase = phases.find(function(p) {
      return p.number >= info.range[0] && p.number <= info.range[1] && p.status !== 'complete';
    });
    if (nextPhase) {
      const blockerNote = nextPhase.blocker ? ' _(blocked)_' : '';
      lines.push('- **' + key + '**: Phase ' + nextPhase.number + ' — ' + nextPhase.title + blockerNote);
    } else {
      lines.push('- **' + key + '**: All phases complete ✅');
    }
  });

  lines.push('');
  lines.push('---');
  lines.push('');

  // ---------------------------------------------------------------------------
  // Section 7: Auto-update hook documentation
  // ---------------------------------------------------------------------------
  lines.push('## Auto-Update Setup');
  lines.push('');
  lines.push('To keep this dashboard current automatically, add a git post-commit hook:');
  lines.push('');
  lines.push('```bash');
  lines.push('# .git/hooks/post-commit');
  lines.push('#!/bin/bash');
  lines.push('bash "$(git rev-parse --show-toplevel)/scripts/update-progress.sh"');
  lines.push('git add docs/PROGRESS-DASHBOARD.md 2>/dev/null');
  lines.push('git commit --amend --no-edit --no-verify 2>/dev/null || true');
  lines.push('```');
  lines.push('');
  lines.push('Or run manually at any time:');
  lines.push('');
  lines.push('```bash');
  lines.push('bash scripts/update-progress.sh');
  lines.push('```');
  lines.push('');
  lines.push('To cache Jest results for live test tracking:');
  lines.push('');
  lines.push('```bash');
  lines.push('# Add to package.json scripts:');
  lines.push('# "test:ci": "jest --json --outputFile=.jest-results.json"');
  lines.push('# Then run: npm run test:ci');
  lines.push('```');
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('_Generated by `scripts/progress-tracker.js` on ' + now + '_');

  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  if (!fs.existsSync(ROADMAP_PATH)) {
    console.error('ERROR: ROADMAP.md not found at ' + ROADMAP_PATH);
    process.exit(1);
  }
  if (!fs.existsSync(REQUIREMENTS_PATH)) {
    console.error('ERROR: REQUIREMENTS.md not found at ' + REQUIREMENTS_PATH);
    process.exit(1);
  }

  const roadmapText = fs.readFileSync(ROADMAP_PATH, 'utf8');
  const reqText = fs.readFileSync(REQUIREMENTS_PATH, 'utf8');

  const milestones = parseMilestones(roadmapText);
  const phases = parsePhases(roadmapText);
  const requirements = parseRequirements(reqText);
  const testInfo = getTestCount();

  console.log('Parsed ' + milestones.length + ' milestones');
  console.log('Parsed ' + phases.length + ' phases (' +
    phases.filter(function(p) { return p.status === 'complete'; }).length + ' complete, ' +
    phases.filter(function(p) { return p.blocker; }).length + ' blocked)');
  console.log('Parsed ' + requirements.length + ' requirements (' +
    requirements.filter(function(r) { return r.done; }).length + ' complete)');
  console.log('Test count: ' + testInfo.passed + '/' + testInfo.total + (testInfo.source === 'documented' ? ' (documented)' : ''));

  const dashboard = generateDashboard(milestones, phases, requirements, testInfo);

  // Ensure docs/ directory exists
  const docsDir = path.dirname(OUTPUT_PATH);
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }

  fs.writeFileSync(OUTPUT_PATH, dashboard, 'utf8');
  console.log('Dashboard written to: ' + OUTPUT_PATH);
}

main();
