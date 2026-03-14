import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

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
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        selected && styles.cardSelected,
        pressed && styles.pressed,
      ]}
      accessibilityRole="button"
      accessibilityState={{ selected }}
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
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#141929',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#1E2235',
    padding: 16,
    minHeight: 44,
  },
  cardSelected: {
    borderColor: '#4A90D9',
    backgroundColor: 'rgba(74, 144, 217, 0.08)',
  },
  pressed: {
    opacity: 0.7,
  },
  icon: {
    fontSize: 24,
    marginRight: 14,
  },
  content: {
    flex: 1,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  titleSelected: {
    color: '#4A90D9',
  },
  description: {
    color: '#9CA3AF',
    fontSize: 14,
    marginTop: 4,
    lineHeight: 20,
  },
});
