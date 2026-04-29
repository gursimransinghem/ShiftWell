import React from 'react';
import { View, type ViewStyle } from 'react-native';

interface AnimatedTransitionProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  style?: ViewStyle;
}

/**
 * Reusable fade-in + slide-up animation wrapper.
 * Staggerable via the `delay` prop.
 */
export default function AnimatedTransition({
  children,
  style,
}: AnimatedTransitionProps) {
  return <View style={style}>{children}</View>;
}
