import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { COLORS, RADIUS } from '@/src/theme';

type CardVariant = 'default' | 'elevated' | 'outlined';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  padding?: boolean;
  variant?: CardVariant;
}

export default function Card({ children, style, padding = true, variant = 'default' }: CardProps) {
  return (
    <View style={[styles.base, styles[variant], padding && styles.padding, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: RADIUS.lg,
  },
  default: {
    backgroundColor: COLORS.background.surface,
    borderWidth: 1,
    borderColor: COLORS.border.default,
  },
  elevated: {
    backgroundColor: COLORS.background.elevated,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  outlined: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.border.strong,
  },
  padding: {
    padding: 16,
  },
});
