/**
 * TDD GREEN: verify Jest mocks for expo-notifications and react-native-svg
 * resolve without native module errors.
 */
import Notifications, {
  scheduleNotificationAsync,
  SchedulableTriggerInputTypes,
} from 'expo-notifications';
import React from 'react';
import Svg, { Circle } from 'react-native-svg';

describe('expo-notifications mock', () => {
  it('scheduleNotificationAsync resolves to mock-id', async () => {
    const id = await scheduleNotificationAsync({} as any);
    expect(id).toBe('mock-id');
  });

  it('SchedulableTriggerInputTypes.DATE equals date', () => {
    expect(SchedulableTriggerInputTypes.DATE).toBe('date');
  });

  it('default export has setNotificationHandler', () => {
    expect(typeof Notifications.setNotificationHandler).toBe('function');
  });
});

describe('react-native-svg mock', () => {
  it('Svg is a React component (not null)', () => {
    expect(typeof Svg).toBe('function');
  });

  it('Circle renders as a React element (not null)', () => {
    const el = React.createElement(Circle, { cx: 50, cy: 50, r: 40 } as any);
    expect(el).not.toBeNull();
    expect(el.type).toBe(Circle);
  });
});
