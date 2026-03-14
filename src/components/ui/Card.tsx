import React from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
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
    backgroundColor: '#141929',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1E2235',
  },
  padding: {
    padding: 16,
  },
});
