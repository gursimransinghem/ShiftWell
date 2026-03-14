import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BACKGROUND, TEXT } from '@/src/theme';

export default function SettingsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <Text style={styles.subtitle}>Coming soon</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: TEXT.primary,
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    color: TEXT.tertiary,
    fontSize: 16,
  },
});
