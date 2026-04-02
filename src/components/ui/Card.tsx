import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { COLORS } from '@/src/theme';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  padding?: boolean;
}

export default function Card({ children, style, padding = true }: CardProps) {
  return (
    <View style={[styles.card, padding && styles.padding, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.background.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border.default,
  },
  padding: {
    padding: 16,
  },
});
