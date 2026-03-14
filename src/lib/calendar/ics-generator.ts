/**
 * ICS file generator.
 *
 * Generates RFC 5545 compliant .ics files from a SleepPlan.
 * The generated file can be imported into any calendar app
 * (Apple Calendar, Google Calendar, Outlook, etc.).
 *
 * Each PlanBlock becomes a VEVENT with appropriate properties:
 * - SUMMARY: Human-readable label
 * - DESCRIPTION: Science-backed context
 * - CATEGORIES: For filtering (SHIFTWELL-SLEEP, SHIFTWELL-NAP, etc.)
 * - VALARM: Reminder before wind-down blocks
 * - COLOR: Visual differentiation by block type
 */

import { format } from 'date-fns';
import type { SleepPlan, PlanBlock, SleepBlockType } from '../circadian/types';

/**
 * Format a Date to ICS datetime format: 20260315T190000
 */
function formatICSDate(date: Date): string {
  return format(date, "yyyyMMdd'T'HHmmss");
}

/**
 * Map block types to calendar categories and display info.
 */
const BLOCK_CONFIG: Record<
  SleepBlockType,
  { category: string; emoji: string; color: string }
> = {
  'main-sleep': {
    category: 'SHIFTWELL-SLEEP',
    emoji: '\u{1F634}', // sleeping face
    color: '#6B5CE7', // Purple
  },
  'nap': {
    category: 'SHIFTWELL-NAP',
    emoji: '\u{1F4A4}', // zzz
    color: '#9B8FEF', // Light purple
  },
  'wind-down': {
    category: 'SHIFTWELL-WINDDOWN',
    emoji: '\u{1F319}', // crescent moon
    color: '#4A4080', // Dark purple
  },
  'wake': {
    category: 'SHIFTWELL-WAKE',
    emoji: '\u{2600}\u{FE0F}', // sun
    color: '#FFD700', // Gold
  },
  'caffeine-cutoff': {
    category: 'SHIFTWELL-CAFFEINE',
    emoji: '\u{2615}', // coffee
    color: '#8B4513', // Brown
  },
  'meal-window': {
    category: 'SHIFTWELL-MEAL',
    emoji: '\u{1F957}', // green salad
    color: '#4CAF50', // Green
  },
  'light-seek': {
    category: 'SHIFTWELL-LIGHT',
    emoji: '\u{2600}\u{FE0F}', // sun
    color: '#FFA500', // Orange
  },
  'light-avoid': {
    category: 'SHIFTWELL-LIGHT',
    emoji: '\u{1F576}\u{FE0F}', // dark sunglasses
    color: '#333333', // Dark gray
  },
};

/**
 * Escape special characters in ICS text fields.
 */
function escapeICS(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

/**
 * Generate a single VEVENT block.
 */
function generateVEvent(block: PlanBlock): string {
  const config = BLOCK_CONFIG[block.type];
  const summary = `${config.emoji} ${block.label}`;
  const lines: string[] = [
    'BEGIN:VEVENT',
    `UID:${block.id}@nightshift.app`,
    `DTSTART:${formatICSDate(block.start)}`,
    `DTEND:${formatICSDate(block.end)}`,
    `SUMMARY:${escapeICS(summary)}`,
    `DESCRIPTION:${escapeICS(block.description)}`,
    `CATEGORIES:${config.category}`,
    `X-APPLE-CALENDAR-COLOR:${config.color}`,
    `TRANSP:OPAQUE`,
  ];

  // Add alarm for critical blocks (main sleep, wind-down)
  if (block.priority === 1 || block.type === 'wind-down') {
    lines.push(
      'BEGIN:VALARM',
      'TRIGGER:-PT15M',
      'ACTION:DISPLAY',
      `DESCRIPTION:${escapeICS(block.label)} starts in 15 minutes`,
      'END:VALARM'
    );
  }

  // Add alarm for caffeine cutoff
  if (block.type === 'caffeine-cutoff' && block.label === 'Caffeine Cutoff') {
    lines.push(
      'BEGIN:VALARM',
      'TRIGGER:-PT5M',
      'ACTION:DISPLAY',
      'DESCRIPTION:Caffeine cutoff in 5 minutes. Last chance for coffee!',
      'END:VALARM'
    );
  }

  lines.push('END:VEVENT');
  return lines.join('\r\n');
}

/**
 * Filter options for what to include in the export.
 */
export interface ExportOptions {
  includeSleep: boolean;
  includeNaps: boolean;
  includeWindDown: boolean;
  includeCaffeine: boolean;
  includeMeals: boolean;
  includeLight: boolean;
}

export const DEFAULT_EXPORT_OPTIONS: ExportOptions = {
  includeSleep: true,
  includeNaps: true,
  includeWindDown: true,
  includeCaffeine: true,
  includeMeals: true,
  includeLight: false, // Off by default to avoid calendar clutter
};

/**
 * Type-to-option mapping for filtering.
 */
function shouldInclude(blockType: SleepBlockType, options: ExportOptions): boolean {
  switch (blockType) {
    case 'main-sleep':
      return options.includeSleep;
    case 'nap':
      return options.includeNaps;
    case 'wind-down':
      return options.includeWindDown;
    case 'caffeine-cutoff':
      return options.includeCaffeine;
    case 'meal-window':
      return options.includeMeals;
    case 'light-seek':
    case 'light-avoid':
      return options.includeLight;
    case 'wake':
      return options.includeSleep;
    default:
      return true;
  }
}

/**
 * Generate a complete .ics file from a SleepPlan.
 *
 * @param plan - The generated sleep plan
 * @param options - Which block types to include (defaults to all except light)
 * @returns RFC 5545 compliant .ics file content as a string
 */
export function generateICS(
  plan: SleepPlan,
  options: ExportOptions = DEFAULT_EXPORT_OPTIONS,
): string {
  const filteredBlocks = plan.blocks.filter((b) => shouldInclude(b.type, options));

  const header = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//ShiftWell//Sleep Plan//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:ShiftWell Sleep Plan',
    'X-WR-CALDESC:Science-backed sleep schedule optimized for your shift pattern',
    'X-APPLE-CALENDAR-COLOR:#6B5CE7',
  ].join('\r\n');

  const events = filteredBlocks.map(generateVEvent).join('\r\n');

  const footer = 'END:VCALENDAR';

  return `${header}\r\n${events}\r\n${footer}\r\n`;
}
