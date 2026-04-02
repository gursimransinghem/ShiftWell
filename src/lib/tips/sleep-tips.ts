/**
 * Sleep tips engine for ShiftWell.
 *
 * A comprehensive library of evidence-based tips for shift workers,
 * organized by category and mapped to specific day types.
 *
 * All tips are sourced from peer-reviewed sleep and circadian research.
 */

import type { DayType, UserProfile } from '../circadian/types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SleepTip {
  id: string;
  title: string;
  body: string;
  category: 'sleep' | 'caffeine' | 'light' | 'nutrition' | 'recovery' | 'general';
  emoji: string;
  source?: string;
  relevantDayTypes: DayType[];
  priority: number; // 1=critical, 2=important, 3=nice-to-know
}

export type TipCategory = SleepTip['category'];

// ---------------------------------------------------------------------------
// All day types — convenience constant for tips that apply universally
// ---------------------------------------------------------------------------

const ALL_DAY_TYPES: DayType[] = [
  'work-day',
  'work-evening',
  'work-night',
  'work-extended',
  'off',
  'transition-to-nights',
  'transition-to-days',
  'recovery',
];

const NIGHT_TYPES: DayType[] = ['work-night', 'work-extended'];
const TRANSITION_TYPES: DayType[] = ['transition-to-nights', 'transition-to-days', 'recovery'];
const OFF_TYPES: DayType[] = ['off', 'recovery', 'transition-to-days'];

// ---------------------------------------------------------------------------
// Tip library — 28 evidence-based tips
// ---------------------------------------------------------------------------

export const SLEEP_TIPS: SleepTip[] = [
  // ---- SLEEP (7 tips) ----
  {
    id: 'sleep-01',
    title: 'Blackout your bedroom completely',
    body: 'Even small amounts of light during sleep reduce melatonin production and sleep quality. Use blackout curtains, cover LEDs with tape, and consider a sleep mask as backup.',
    category: 'sleep',
    emoji: '\u{1F311}',
    source: 'Gooley et al., 2011',
    relevantDayTypes: ALL_DAY_TYPES,
    priority: 1,
  },
  {
    id: 'sleep-02',
    title: 'Keep your bedroom cool',
    body: 'Set your thermostat to 65\u201368\u00B0F (18\u201320\u00B0C). Your core body temperature needs to drop 2\u20133\u00B0F for sleep initiation. A cool room accelerates this process.',
    category: 'sleep',
    emoji: '\u{1F9CA}',
    source: 'Harding et al., 2019',
    relevantDayTypes: ALL_DAY_TYPES,
    priority: 1,
  },
  {
    id: 'sleep-03',
    title: 'Use earplugs or white noise',
    body: 'Environmental noise is the #1 sleep disruptor for day sleepers. White or pink noise machines mask sudden sounds that trigger micro-arousals, even if you don\'t fully wake.',
    category: 'sleep',
    emoji: '\u{1F50A}',
    source: 'Basner et al., 2011',
    relevantDayTypes: [...NIGHT_TYPES, 'recovery', 'transition-to-days'],
    priority: 1,
  },
  {
    id: 'sleep-04',
    title: 'Avoid screens before your sleep window',
    body: 'Blue light from phones and tablets suppresses melatonin production by up to 50%. Put devices away 30 minutes before your planned sleep time, or use a strong blue-light filter.',
    category: 'sleep',
    emoji: '\u{1F4F1}',
    source: 'Chang et al., 2015',
    relevantDayTypes: ALL_DAY_TYPES,
    priority: 2,
  },
  {
    id: 'sleep-05',
    title: 'Anchor sleep is non-negotiable',
    body: 'Try to keep at least 4 hours of sleep at the same time every day, even across shift changes. This "anchor sleep" stabilizes your circadian rhythm and reduces jet-lag-like symptoms.',
    category: 'sleep',
    emoji: '\u{2693}',
    source: 'Minors & Waterhouse, 1981',
    relevantDayTypes: ALL_DAY_TYPES,
    priority: 1,
  },
  {
    id: 'sleep-06',
    title: 'Strategic napping boosts night shift performance',
    body: 'A 20\u201390 minute nap before your night shift can reduce fatigue-related errors by up to 50%. Time it to end at least 30 minutes before your commute to clear sleep inertia.',
    category: 'sleep',
    emoji: '\u{1F4A4}',
    source: 'Ruggiero & Redeker, 2014',
    relevantDayTypes: ['work-night', 'work-extended', 'transition-to-nights'],
    priority: 1,
  },
  {
    id: 'sleep-07',
    title: 'Wind down with a consistent routine',
    body: 'A 20\u201330 minute pre-sleep ritual signals your brain to transition. Try gentle stretching, reading (physical book), or breathing exercises. Consistency matters more than the activity itself.',
    category: 'sleep',
    emoji: '\u{1F9D8}',
    relevantDayTypes: ALL_DAY_TYPES,
    priority: 2,
  },

  // ---- CAFFEINE (5 tips) ----
  {
    id: 'caffeine-01',
    title: 'Respect your personalized caffeine cutoff',
    body: 'Your caffeine cutoff is calculated from your individual half-life. Even "decaf" contains 2\u201315mg of caffeine. After your cutoff time, switch to herbal tea or water.',
    category: 'caffeine',
    emoji: '\u{2615}',
    source: 'Drake et al., 2013',
    relevantDayTypes: ALL_DAY_TYPES,
    priority: 1,
  },
  {
    id: 'caffeine-02',
    title: 'Time your coffee strategically',
    body: 'Caffeine peaks in your bloodstream 30\u201360 minutes after consumption and takes 5\u20136 hours to halve. For a night shift starting at 7 PM, a coffee at 6:30 PM gives peak alertness at 7:30 PM.',
    category: 'caffeine',
    emoji: '\u{23F0}',
    relevantDayTypes: [...NIGHT_TYPES, 'work-evening'],
    priority: 2,
  },
  {
    id: 'caffeine-03',
    title: 'Front-load caffeine in your shift',
    body: 'Consume caffeine in the first half of your shift for maximum benefit. Caffeine in the second half lingers during your sleep window and reduces slow-wave (deep) sleep.',
    category: 'caffeine',
    emoji: '\u{26A1}',
    source: 'Landolt et al., 2004',
    relevantDayTypes: [...NIGHT_TYPES, 'work-evening', 'work-extended'],
    priority: 2,
  },
  {
    id: 'caffeine-04',
    title: 'The "nappuccino" technique',
    body: 'Drink a coffee then immediately nap for 20 minutes. Caffeine takes ~20 min to kick in, so you get the benefits of both the nap and the caffeine boost when you wake.',
    category: 'caffeine',
    emoji: '\u{1F680}',
    source: 'Hayashi et al., 2003',
    relevantDayTypes: ['work-night', 'work-extended'],
    priority: 3,
  },
  {
    id: 'caffeine-05',
    title: 'Know your personal caffeine sensitivity',
    body: 'CYP1A2 gene variants make some people "slow metabolizers" with a half-life of 8+ hours. If you still feel wired at bedtime despite an early cutoff, you may need an even earlier one.',
    category: 'caffeine',
    emoji: '\u{1F9EC}',
    source: 'Sachse et al., 1999',
    relevantDayTypes: ALL_DAY_TYPES,
    priority: 3,
  },

  // ---- LIGHT (5 tips) ----
  {
    id: 'light-01',
    title: 'Wear blue-blocking glasses after night shift',
    body: 'Put on amber or orange-tinted glasses for your commute home after a night shift. Morning sunlight suppresses melatonin \u2014 blocking it preserves your ability to fall asleep.',
    category: 'light',
    emoji: '\u{1F576}\uFE0F',
    source: 'Eastman & Burgess, 2009',
    relevantDayTypes: NIGHT_TYPES,
    priority: 1,
  },
  {
    id: 'light-02',
    title: 'Seek bright light when waking on recovery days',
    body: 'Get 30 minutes of bright outdoor light within the first hour of waking on recovery and off days. This is the single strongest signal to reset your circadian clock back to a normal schedule.',
    category: 'light',
    emoji: '\u{2600}\uFE0F',
    source: 'Czeisler et al., 1990',
    relevantDayTypes: [...OFF_TYPES, 'transition-to-days'],
    priority: 1,
  },
  {
    id: 'light-03',
    title: 'Use bright light strategically during night shifts',
    body: 'Expose yourself to bright light (>2,500 lux) during the first half of your night shift. This helps phase-delay your clock and improves alertness. Avoid bright light in the last 2 hours.',
    category: 'light',
    emoji: '\u{1F4A1}',
    source: 'Crowley et al., 2003',
    relevantDayTypes: NIGHT_TYPES,
    priority: 2,
  },
  {
    id: 'light-04',
    title: 'Dim lights at home before sleep',
    body: 'Switch to warm, dim lighting at least an hour before your sleep window. Overhead lights are especially suppressive to melatonin. Use table lamps or candles instead.',
    category: 'light',
    emoji: '\u{1F56F}\uFE0F',
    source: 'Gooley et al., 2011',
    relevantDayTypes: ALL_DAY_TYPES,
    priority: 2,
  },
  {
    id: 'light-05',
    title: 'Night shift commute: sunglasses are your friend',
    body: 'If you drive home after a night shift in daylight, wraparound sunglasses reduce circadian-disrupting light exposure. Even overcast skies deliver 10,000+ lux \u2014 enough to shift your clock.',
    category: 'light',
    emoji: '\u{1F60E}',
    relevantDayTypes: NIGHT_TYPES,
    priority: 2,
  },

  // ---- NUTRITION (5 tips) ----
  {
    id: 'nutrition-01',
    title: 'Eat your largest meal before night shift',
    body: 'Front-load calories before your shift, not during it. Eating during your circadian nadir (2\u20135 AM) impairs glucose metabolism and increases long-term metabolic risk.',
    category: 'nutrition',
    emoji: '\u{1F37D}\uFE0F',
    source: 'Chellappa et al., 2021',
    relevantDayTypes: ['work-night', 'work-extended', 'transition-to-nights'],
    priority: 1,
  },
  {
    id: 'nutrition-02',
    title: 'Front-load calories in your wake period',
    body: 'Aim to consume most of your daily calories within the first 10 hours of your wake period. Time-restricted eating aligned to your circadian phase improves metabolic health markers.',
    category: 'nutrition',
    emoji: '\u{1F552}',
    source: 'Manoogian et al., 2022',
    relevantDayTypes: ALL_DAY_TYPES,
    priority: 2,
  },
  {
    id: 'nutrition-03',
    title: 'Keep night shift snacks light and protein-rich',
    body: 'If you need to eat during your night shift, choose small protein-rich snacks (nuts, yogurt, cheese). Avoid heavy carbs \u2014 they spike blood sugar and worsen the 3\u20135 AM circadian dip.',
    category: 'nutrition',
    emoji: '\u{1F95C}',
    relevantDayTypes: NIGHT_TYPES,
    priority: 2,
  },
  {
    id: 'nutrition-04',
    title: 'Avoid heavy meals within 2 hours of sleep',
    body: 'Large meals close to your sleep window raise core body temperature and activate digestion, both of which oppose sleep initiation. A light snack is fine if you\'re hungry.',
    category: 'nutrition',
    emoji: '\u{1F34C}',
    relevantDayTypes: ALL_DAY_TYPES,
    priority: 2,
  },
  {
    id: 'nutrition-05',
    title: 'Stay hydrated but taper before sleep',
    body: 'Dehydration impairs cognitive performance during shifts. Drink water throughout your shift but taper off 1\u20132 hours before your sleep window to minimize bathroom disruptions.',
    category: 'nutrition',
    emoji: '\u{1F4A7}',
    relevantDayTypes: ALL_DAY_TYPES,
    priority: 3,
  },

  // ---- RECOVERY (3 tips) ----
  {
    id: 'recovery-01',
    title: 'Don\'t immediately flip to a normal schedule',
    body: 'After a night shift stretch, don\'t try to sleep at your normal bedtime right away. Use a gradual delay protocol: shift your bedtime 2 hours later each day until you reach your target.',
    category: 'recovery',
    emoji: '\u{1F504}',
    relevantDayTypes: ['recovery', 'transition-to-days'],
    priority: 1,
  },
  {
    id: 'recovery-02',
    title: 'Split sleep bridges you back to normal',
    body: 'On recovery days, a morning recovery nap (3\u20134 hours after your last night shift) plus an early evening bedtime helps you transition without accumulating excessive sleep debt.',
    category: 'recovery',
    emoji: '\u{1F309}',
    relevantDayTypes: ['recovery'],
    priority: 1,
  },
  {
    id: 'recovery-03',
    title: 'Prioritize social time on recovery days',
    body: 'Social connection is a circadian zeitgeber (time-giver). Spending time with family or friends during daylight hours on recovery days helps re-entrain your biological clock.',
    category: 'recovery',
    emoji: '\u{1F46B}',
    source: 'Mistlberger & Skene, 2004',
    relevantDayTypes: ['recovery', 'off', 'transition-to-days'],
    priority: 3,
  },

  // ---- GENERAL (3 tips) ----
  {
    id: 'general-01',
    title: 'Know the signs of Shift Work Sleep Disorder',
    body: 'SWSD affects 10\u201338% of night workers. If you consistently can\'t sleep despite good habits, experience excessive sleepiness during shifts, or feel unrested after sleep, talk to a sleep medicine doctor.',
    category: 'general',
    emoji: '\u{1FA7A}',
    source: 'Drake et al., 2004',
    relevantDayTypes: ALL_DAY_TYPES,
    priority: 2,
  },
  {
    id: 'general-02',
    title: 'Exercise improves sleep quality',
    body: 'Regular exercise enhances slow-wave sleep and total sleep time. However, avoid intense exercise within 3 hours of your sleep window \u2014 it raises core temperature and cortisol.',
    category: 'general',
    emoji: '\u{1F3CB}\uFE0F',
    source: 'Kredlow et al., 2015',
    relevantDayTypes: ALL_DAY_TYPES,
    priority: 2,
  },
  {
    id: 'general-03',
    title: 'Communicate your schedule to household members',
    body: 'Let family and housemates know your sleep windows. A "Do Not Disturb" sign and shared calendar reduce accidental wake-ups \u2014 the most frustrating barrier to day sleep.',
    category: 'general',
    emoji: '\u{1F3E0}',
    relevantDayTypes: ALL_DAY_TYPES,
    priority: 2,
  },
];

// ---------------------------------------------------------------------------
// Engine functions
// ---------------------------------------------------------------------------

/**
 * Returns all tips relevant to the given day type, sorted by priority,
 * with optional personalization based on user profile.
 */
export function getTipsForDay(dayType: DayType, profile: UserProfile): SleepTip[] {
  const relevant = SLEEP_TIPS.filter((tip) => tip.relevantDayTypes.includes(dayType));

  // Boost certain tips based on profile
  const scored = relevant.map((tip) => {
    let adjustedPriority = tip.priority;

    // Household noise is more relevant for people with young children
    if (tip.id === 'sleep-03' && profile.hasYoungChildren) {
      adjustedPriority = Math.max(1, adjustedPriority - 1);
    }

    // Nap tips are less relevant if user doesn't want naps
    if (
      (tip.id === 'sleep-06' || tip.id === 'caffeine-04') &&
      !profile.napPreference
    ) {
      adjustedPriority = adjustedPriority + 1;
    }

    // Caffeine sensitivity tip is more relevant for slow metabolizers
    if (tip.id === 'caffeine-05' && profile.caffeineHalfLife > 6) {
      adjustedPriority = Math.max(1, adjustedPriority - 1);
    }

    // Household communication tip is more relevant for larger households
    if (tip.id === 'general-03' && profile.householdSize > 1) {
      adjustedPriority = Math.max(1, adjustedPriority - 1);
    }

    // Commute-related light tips are more relevant for longer commutes
    if (
      (tip.id === 'light-01' || tip.id === 'light-05') &&
      profile.commuteDuration >= 30
    ) {
      adjustedPriority = Math.max(1, adjustedPriority - 1);
    }

    return { ...tip, priority: adjustedPriority };
  });

  // Sort: lower priority number = more important = first
  return scored.sort((a, b) => a.priority - b.priority);
}

/**
 * Returns a single "Tip of the Day" that rotates daily.
 *
 * Uses a date-based hash so the same tip shows for the entire day,
 * but changes each day. Only considers tips relevant to the current day type.
 */
export function getTipOfTheDay(dayType: DayType, profile: UserProfile): SleepTip {
  const tips = getTipsForDay(dayType, profile);

  // Date-based hash: consistent for the whole day
  const today = new Date();
  const dateHash =
    today.getFullYear() * 10000 +
    (today.getMonth() + 1) * 100 +
    today.getDate();

  const index = dateHash % tips.length;
  return tips[index];
}

/**
 * Returns all tips for a given category.
 */
export function getTipsByCategory(category: TipCategory): SleepTip[] {
  return SLEEP_TIPS.filter((tip) => tip.category === category);
}

/**
 * Returns the category display color (for use in UI badges).
 * Maps to the ShiftWell color palette.
 */
export function getCategoryColor(category: TipCategory): string {
  const colors: Record<TipCategory, string> = {
    sleep: '#7B61FF',     // BLOCK_COLORS.sleep
    caffeine: '#FF6B6B',  // SEMANTIC.error (red for caffeine)
    light: '#FCD34D',     // BLOCK_COLORS.lightProtocol
    nutrition: '#34D399',  // BLOCK_COLORS.meal
    recovery: '#B794F6',   // BLOCK_COLORS.nap
    general: '#C8A84B',    // ACCENT.primary (warm gold)
  };
  return colors[category];
}

/**
 * Returns a human-readable label for a tip category.
 */
export function getCategoryLabel(category: TipCategory): string {
  const labels: Record<TipCategory, string> = {
    sleep: 'Sleep',
    caffeine: 'Caffeine',
    light: 'Light',
    nutrition: 'Nutrition',
    recovery: 'Recovery',
    general: 'General',
  };
  return labels[category];
}
