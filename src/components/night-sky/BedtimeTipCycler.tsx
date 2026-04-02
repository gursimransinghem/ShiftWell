import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { TEXT } from '@/src/theme';

// ---------------------------------------------------------------------------
// Tip data — per D-05: three actionable wind-down prompts
// ---------------------------------------------------------------------------
const TIPS = [
  {
    emoji: '💧',
    text: 'Drink a glass of water now — it helps regulate body temperature overnight.',
  },
  {
    emoji: '📱',
    text: 'Place your phone face-down across the room — out of reach, out of mind.',
  },
  {
    emoji: '🌡️',
    text: 'Ideal sleep temp is 65-68°F (18-20°C). Lower your thermostat if you can.',
  },
];

// Cycle interval in ms
const CYCLE_INTERVAL_MS = 6000;

// ---------------------------------------------------------------------------
// BedtimeTipCycler — rotates through TIPS every 6 seconds
// ---------------------------------------------------------------------------
export function BedtimeTipCycler() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % TIPS.length);
    }, CYCLE_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  const tip = TIPS[index];

  return (
    <View
      style={{
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 16,
      }}
    >
      <Text style={{ fontSize: 28, marginBottom: 8 }}>{tip.emoji}</Text>
      <Text
        style={{
          color: TEXT.secondary,
          fontSize: 13,
          textAlign: 'center',
          lineHeight: 20,
        }}
      >
        {tip.text}
      </Text>
    </View>
  );
}
