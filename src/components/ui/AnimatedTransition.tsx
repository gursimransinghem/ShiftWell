import React, { useEffect, useRef } from 'react';
import { Animated, View, type ViewStyle } from 'react-native';

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
  const isWeb = typeof document !== 'undefined';
  const opacity = useRef(new Animated.Value(isWeb ? 1 : 0)).current;
  const translateY = useRef(new Animated.Value(isWeb ? 0 : 20)).current;

  useEffect(() => {
    if (isWeb) {
      return;
    }

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
  }, [isWeb, opacity, translateY, delay, duration]);

  if (isWeb) {
    return <View style={style}>{children}</View>;
  }

  return (
    <Animated.View style={[{ opacity, transform: [{ translateY }] }, style]}>
      {children}
    </Animated.View>
  );
}
