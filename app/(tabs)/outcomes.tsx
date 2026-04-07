import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { OutcomeDashboard } from '@/src/components/outcomes/OutcomeDashboard';
import { BACKGROUND } from '@/src/theme';

export default function OutcomesScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <OutcomeDashboard />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND.primary,
  },
});
