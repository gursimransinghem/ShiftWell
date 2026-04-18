import React from 'react';
import { Text as RNText, type StyleProp, type TextStyle } from 'react-native';
import {
  COLORS,
  heading1,
  heading2,
  heading3,
  body,
  bodySmall,
  caption,
  label,
  sectionLabel,
} from '@/src/theme';

type TextVariant = 'h1' | 'h2' | 'h3' | 'body' | 'bodySmall' | 'caption' | 'label' | 'overline';
type TextColor = keyof typeof COLORS.text;

const VARIANT_STYLES: Record<TextVariant, TextStyle> = {
  h1: heading1,
  h2: heading2,
  h3: heading3,
  body,
  bodySmall,
  caption,
  label,
  overline: sectionLabel,
};

interface TextProps {
  variant?: TextVariant;
  color?: TextColor;
  align?: 'left' | 'center' | 'right';
  weight?: '400' | '500' | '600' | '700';
  style?: StyleProp<TextStyle>;
  children: React.ReactNode;
  numberOfLines?: number;
}

export default function Text({
  variant = 'body',
  color = 'primary',
  align,
  weight,
  style,
  children,
  numberOfLines,
}: TextProps) {
  return (
    <RNText
      style={[
        VARIANT_STYLES[variant],
        { color: COLORS.text[color] },
        align != null ? { textAlign: align } : undefined,
        weight != null ? { fontWeight: weight } : undefined,
        style,
      ]}
      numberOfLines={numberOfLines}
    >
      {children}
    </RNText>
  );
}
