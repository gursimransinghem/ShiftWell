export const EntityTypes = { EVENT: 'event' };
export const CalendarAccessLevel = { OWNER: 'owner', READ: 'read' };
export const requestCalendarPermissionsAsync = jest.fn().mockResolvedValue({ status: 'granted' });
export const getCalendarsAsync = jest.fn().mockResolvedValue([]);
export const getDefaultCalendarAsync = jest.fn().mockResolvedValue({
  id: 'default-cal-id',
  source: { id: 'default-source', name: 'iCloud', type: 'caldav' },
});
export const getEventsAsync = jest.fn().mockResolvedValue([]);
export const createCalendarAsync = jest.fn().mockResolvedValue('new-cal-id');
export const createEventAsync = jest.fn().mockResolvedValue('new-event-id');
export const updateEventAsync = jest.fn().mockResolvedValue('updated-event-id');
export const deleteEventAsync = jest.fn().mockResolvedValue(undefined);
