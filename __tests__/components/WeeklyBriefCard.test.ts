/**
 * WeeklyBriefCard component tests (Phase 20)
 *
 * Strategy: parse component source to verify callback wiring and render
 * patterns — same approach as AdaptiveInsightCard.test.ts.
 * No React Native rendering environment needed.
 */

import * as fs from 'fs';
import * as path from 'path';

const COMPONENT_PATH = path.resolve(
  __dirname,
  '../../src/components/today/WeeklyBriefCard.tsx',
);

const source = fs.readFileSync(COMPONENT_PATH, 'utf8');

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

function countPattern(pattern: RegExp): number {
  return (source.match(pattern) || []).length;
}

function containsPattern(pattern: RegExp): boolean {
  return pattern.test(source);
}

// ---------------------------------------------------------------------------
// Tests — structural verification
// ---------------------------------------------------------------------------

describe('WeeklyBriefCard — render structure', () => {
  it('renders the weekly brief header text', () => {
    expect(containsPattern(/Weekly Sleep Brief/)).toBe(true);
  });

  it('renders summary text', () => {
    expect(containsPattern(/brief\.summary/)).toBe(true);
  });

  it('renders trend indicator', () => {
    // The component should display an arrow indicator based on trend
    expect(containsPattern(/trendIndicator/)).toBe(true);
    expect(containsPattern(/improving/)).toBe(true);
    expect(containsPattern(/declining/)).toBe(true);
    expect(containsPattern(/stable/)).toBe(true);
  });

  it('renders recommendation', () => {
    expect(containsPattern(/brief\.recommendation/)).toBe(true);
  });

  it('renders encouragement footer', () => {
    expect(containsPattern(/brief\.encouragement/)).toBe(true);
  });

  it('has a dismiss button', () => {
    expect(containsPattern(/onDismiss/)).toBe(true);
    expect(containsPattern(/TouchableOpacity/)).toBe(true);
  });
});

describe('WeeklyBriefCard — dismiss behavior', () => {
  it('calls onDismiss from props', () => {
    // Verify that the dismiss button wires to onDismiss prop
    expect(containsPattern(/onPress={onDismiss}/)).toBe(true);
  });

  it('uses accessibilityLabel on dismiss button', () => {
    expect(containsPattern(/accessibilityLabel/)).toBe(true);
    expect(containsPattern(/[Dd]ismiss/)).toBe(true);
  });
});

describe('WeeklyBriefCard — trend indicators', () => {
  it('maps improving to up arrow (↑)', () => {
    // Unicode \u2191 or the literal ↑
    expect(containsPattern(/\\u2191|↑/)).toBe(true);
  });

  it('maps declining to down arrow (↓)', () => {
    expect(containsPattern(/\\u2193|↓/)).toBe(true);
  });

  it('maps stable to right arrow (→)', () => {
    expect(containsPattern(/\\u2192|→/)).toBe(true);
  });

  it('uses green color for improving trend', () => {
    expect(containsPattern(/#34D399/)).toBe(true);
  });

  it('uses red color for declining trend', () => {
    expect(containsPattern(/#FF6B6B/)).toBe(true);
  });
});

describe('WeeklyBriefCard — theme compliance', () => {
  it('uses COLORS from theme', () => {
    expect(containsPattern(/COLORS/)).toBe(true);
  });

  it('uses SPACING from theme', () => {
    expect(containsPattern(/SPACING/)).toBe(true);
  });

  it('uses RADIUS from theme', () => {
    expect(containsPattern(/RADIUS/)).toBe(true);
  });

  it('uses TYPOGRAPHY from theme', () => {
    expect(containsPattern(/TYPOGRAPHY/)).toBe(true);
  });

  it('uses COLORS.background.surface as card background', () => {
    expect(containsPattern(/COLORS\.background\.surface/)).toBe(true);
  });
});

describe('WeeklyBriefCard — prop interface', () => {
  it('accepts brief prop of BriefResponse type', () => {
    expect(containsPattern(/brief: BriefResponse/)).toBe(true);
  });

  it('accepts onDismiss callback prop', () => {
    expect(containsPattern(/onDismiss: \(\) => void/)).toBe(true);
  });
});
