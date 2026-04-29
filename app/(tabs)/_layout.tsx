import React from 'react';
import { Tabs } from 'expo-router';
import { FloatingTabBar } from '@/src/components/navigation/FloatingTabBar';

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Today',
          tabBarAccessibilityLabel: 'Today tab',
        }}
      />
      <Tabs.Screen
        name="schedule"
        options={{
          title: 'Schedule',
          tabBarAccessibilityLabel: 'Schedule tab',
        }}
      />
      <Tabs.Screen
        name="circadian"
        options={{
          title: 'Circadian',
          tabBarAccessibilityLabel: 'Circadian tab',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarAccessibilityLabel: 'Profile tab',
        }}
      />
      <Tabs.Screen
        name="brief"
        options={{
          title: 'Brief',
          tabBarAccessibilityLabel: 'Brief tab',
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="outcomes"
        options={{
          title: 'Outcomes',
          tabBarAccessibilityLabel: 'Outcomes tab',
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
