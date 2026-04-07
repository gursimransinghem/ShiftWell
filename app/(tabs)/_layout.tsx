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
        }}
      />
      <Tabs.Screen
        name="schedule"
        options={{
          title: 'Schedule',
        }}
      />
      <Tabs.Screen
        name="circadian"
        options={{
          title: 'Circadian',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
        }}
      />
      <Tabs.Screen
        name="brief"
        options={{
          title: 'Brief',
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="outcomes"
        options={{
          title: 'Outcomes',
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
