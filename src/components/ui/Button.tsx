import React, { useRef } from 'react';
import {
  ActivityIndicator,
  Animated,
  Pressable,
  StyleSheet,
  Text,
  type ViewStyle,
  type TextStyle,
} from 'react-native';

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

const COLORS = {
  primary: '#4A90D9',
  textPrimary: '#FFFFFF',
  textSecondary: '#4A90D9',
  textGhost: '#4A90D9',
  disabledBg: '#1E2235',
  disabledText: '#555B6E',
  border: '#4A90D9',
};

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

  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (isDisabled) return;
    Animated.timing(scaleAnim, {
      toValue: 0.97,
      duration: 80,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    if (isDisabled) return;
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 120,
      useNativeDriver: true,
    }).start();
  };

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

  const indicatorColor = variant === 'primary' ? '#FFFFFF' : COLORS.primary;

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
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
    backgroundColor: COLORS.primary,
  },
  secondaryBg: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    backgroundColor: COLORS.disabledBg,
    borderColor: COLORS.disabledBg,
    opacity: 0.6,
  },
  text: {
    fontWeight: '600',
  },
  primaryText: {
    color: COLORS.textPrimary,
  },
  secondaryText: {
    color: COLORS.textSecondary,
  },
  disabledText: {
    color: COLORS.disabledText,
  },
  iconSpacing: {
    marginLeft: 8,
  },
});
