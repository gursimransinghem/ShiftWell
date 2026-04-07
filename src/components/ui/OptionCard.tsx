import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS, ACCENT, PURPLE } from '@/src/theme';

interface OptionCardProps {
  title: string;
  description?: string;
  selected: boolean;
  onPress: () => void;
  icon?: string;
}

export default function OptionCard({
  title,
  description,
  selected,
  onPress,
  icon,
}: OptionCardProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Smooth border/background transition via opacity overlay
  const selectionAnim = useRef(new Animated.Value(selected ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(selectionAnim, {
      toValue: selected ? 1 : 0,
      duration: 200,
      useNativeDriver: false, // needed for backgroundColor/borderColor
    }).start();
  }, [selected, selectionAnim]);

  const handlePressIn = () => {
    Animated.timing(scaleAnim, {
      toValue: 0.97,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  const animatedBorderColor = selectionAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [COLORS.border.default, PURPLE],
  });

  const animatedBackgroundColor = selectionAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [COLORS.background.surface, 'rgba(123, 97, 255, 0.08)'],
  });

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessibilityRole="button"
        accessibilityState={{ selected }}
      >
        <Animated.View
          style={[
            styles.card,
            {
              borderColor: animatedBorderColor,
              backgroundColor: animatedBackgroundColor,
            },
          ]}
        >
          {icon && (
            <Text style={styles.icon}>{icon}</Text>
          )}
          <View style={styles.content}>
            <Text style={[styles.title, selected && styles.titleSelected]}>
              {title}
            </Text>
            {description && (
              <Text style={styles.description}>{description}</Text>
            )}
          </View>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1.5,
    padding: 16,
    minHeight: 44,
  },
  icon: {
    fontSize: 24,
    marginRight: 14,
  },
  content: {
    flex: 1,
  },
  title: {
    color: COLORS.text.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  titleSelected: {
    color: PURPLE,
  },
  description: {
    color: COLORS.text.secondary,
    fontSize: 14,
    marginTop: 4,
    lineHeight: 20,
  },
});
