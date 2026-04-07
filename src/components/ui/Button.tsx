import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { COLORS, ACCENT, PURPLE } from '@/src/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
}

const SIZE_CONFIG: Record<string, { height: number; paddingHorizontal: number; fontSize: number }> = {
  sm: { height: 44, paddingHorizontal: 16, fontSize: 14 },
  md: { height: 48, paddingHorizontal: 24, fontSize: 16 },
  lg: { height: 56, paddingHorizontal: 32, fontSize: 18 },
};

export default function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  icon,
}: ButtonProps) {
  const sizeConfig = SIZE_CONFIG[size];
  const isDisabled = disabled || loading;

  const scale = useSharedValue(1);

  const handlePressIn = () => {
    if (isDisabled) return;
    scale.value = withSpring(0.97, { damping: 20, stiffness: 400 });
  };

  const handlePressOut = () => {
    if (isDisabled) return;
    scale.value = withSpring(1, { damping: 20, stiffness: 400 });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const containerStyle: ViewStyle[] = [
    styles.base,
    {
      height: sizeConfig.height,
      paddingHorizontal: sizeConfig.paddingHorizontal,
      minHeight: 44,
    },
  ];

  if (variant === 'primary') {
    containerStyle.push(styles.primaryBg);
  } else if (variant === 'secondary') {
    containerStyle.push(styles.secondaryBg);
  }
  // ghost has no background or border

  if (fullWidth) {
    containerStyle.push(styles.fullWidth);
  }

  if (isDisabled) {
    containerStyle.push(styles.disabled);
  }

  const textStyle: TextStyle[] = [
    styles.text,
    { fontSize: sizeConfig.fontSize },
  ];

  if (variant === 'primary') {
    textStyle.push(styles.primaryText);
  } else {
    textStyle.push(styles.secondaryText);
  }

  if (isDisabled) {
    textStyle.push(styles.disabledText);
  }

  const indicatorColor = variant === 'primary' ? COLORS.text.primary : PURPLE;

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDisabled}
        style={containerStyle}
        accessibilityRole="button"
        accessibilityState={{ disabled: isDisabled }}
      >
        {loading ? (
          <ActivityIndicator color={indicatorColor} size="small" />
        ) : (
          <>
            {icon && <>{icon}</>}
            <Text style={[...textStyle, icon ? styles.iconSpacing : undefined]}>
              {title}
            </Text>
          </>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    minHeight: 44,
  },
  primaryBg: {
    backgroundColor: PURPLE,
  },
  secondaryBg: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: PURPLE,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    backgroundColor: COLORS.background.elevated,
    borderColor: COLORS.background.elevated,
    opacity: 0.6,
  },
  text: {
    fontWeight: '600',
  },
  primaryText: {
    color: COLORS.text.primary,
  },
  secondaryText: {
    color: PURPLE,
  },
  disabledText: {
    color: COLORS.text.tertiary,
  },
  iconSpacing: {
    marginLeft: 8,
  },
});
