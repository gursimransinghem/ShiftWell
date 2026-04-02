/**
 * Calendar types and interfaces for Apple and Google Calendar integration.
 *
 * Provides normalized event and calendar metadata types used throughout
 * the calendar sync pipeline.
 */

export interface RawCalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  calendarId: string;
  source: 'apple' | 'google';
  allDay?: boolean;
}

export interface CalendarMeta {
  id: string;
  title: string;       // Apple: title, Google: summary
  color: string;
  enabled: boolean;    // User toggle — default true (D-03)
  source: 'apple' | 'google';
  allowsModifications: boolean;
}

export type ChangeNotificationMode = 'silent' | 'badge' | 'push';
