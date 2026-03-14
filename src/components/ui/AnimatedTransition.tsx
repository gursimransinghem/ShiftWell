import React, { useEffect, useRef } from 'react';
import { Animated, type ViewStyle } from 'react-native';

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
  delay = 0,
  duration = 250,
  style,
}: AnimatedTransitionProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, translateY, delay, duration]);

  return (
    <Animated.View style={[{ opacity, transform: [{ translateY }] }, style]}>
      {children}
    </Animated.View>
  );
}
