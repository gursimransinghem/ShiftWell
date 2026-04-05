import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { TEXT } from '@/src/theme';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface InsightLineProps {
  text: string;
  onToggle?: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function InsightLine({ text, onToggle }: InsightLineProps) {
  const content = (
    <View style={styles.container}>
      <Text style={styles.icon}>💡</Text>
      <Text style={styles.text}>{text}</Text>
    </View>
  );

  if (onToggle) {
    return (
      <Pressable onPress={onToggle}>
        {content}
      </Pressable>
    );
  }

  return content;
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.04)',
  },
  icon: {
    fontSize: 14,
    marginRight: 8,
    flexShrink: 0,
    lineHeight: 20,
  },
  text: {
    fontSize: 13,
    color: TEXT.secondary,
    lineHeight: 20,
    flex: 1,
  },
});
