import React from 'react';
import { StyleSheet, TouchableOpacity, View, Text } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { tapLight } from '@/src/lib/haptics/haptic-service';
import { usePlanStore } from '@/src/store/plan-store';

// ---------------------------------------------------------------------------
// Icon map — route name → [inactive icon, active icon]
// ---------------------------------------------------------------------------
type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

const ROUTE_ICONS: Record<string, [IoniconsName, IoniconsName]> = {
  index: ['sparkles-outline', 'sparkles'],
  today: ['sparkles-outline', 'sparkles'],
  schedule: ['calendar-outline', 'calendar'],
  circadian: ['pulse-outline', 'pulse'],
  profile: ['person-outline', 'person'],
  brief: ['briefcase-outline', 'briefcase'],
};

// Fallback icon pair for unrecognised route names
const FALLBACK_ICONS: [IoniconsName, IoniconsName] = ['ellipse-outline', 'ellipse'];

// Route name → display label
const ROUTE_LABELS: Record<string, string> = {
  index: 'Today',
  today: 'Today',
  schedule: 'Schedule',
  circadian: 'Circadian',
  profile: 'Profile',
  brief: 'Brief',
};

// ---------------------------------------------------------------------------
// FloatingTabBar
// ---------------------------------------------------------------------------
export function FloatingTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.wrapper,
        { bottom: Math.max(insets.bottom, 8) + 4 },
      ]}
      pointerEvents="box-none"
    >
      <BlurView intensity={40} tint="dark" style={styles.blurContainer}>
        <View style={styles.innerContainer}>
          {state.routes.map((route, index) => {
            const isFocused = state.index === index;
            const { options } = descriptors[route.key];
            // Skip routes marked hidden (href: null in Expo Router)
            if (!(route.name in ROUTE_LABELS)) return null;
            // Brief tab: only show when transition is approaching (≤7 days)
            if (route.name === 'brief') {
              const daysUntilTransition = usePlanStore.getState().daysUntilTransition;
              if (daysUntilTransition > 7) return null;
            }
            const label =
              ROUTE_LABELS[route.name] ??
              (typeof options.title === 'string' ? options.title : route.name);
            const [inactiveIcon, activeIcon] =
              ROUTE_ICONS[route.name] ?? FALLBACK_ICONS;
            const iconName = isFocused ? activeIcon : inactiveIcon;
            const color = isFocused ? '#C8A84B' : '#4B5563';

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                tapLight();
                navigation.navigate(route.name);
              }
            };

            const onLongPress = () => {
              navigation.emit({
                type: 'tabLongPress',
                target: route.key,
              });
            };

            return (
              <TouchableOpacity
                key={route.key}
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                accessibilityLabel={options.tabBarAccessibilityLabel}
                onPress={onPress}
                onLongPress={onLongPress}
                style={styles.tab}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={iconName}
                  size={22}
                  color={color}
                  style={isFocused ? styles.activeIconShadow : undefined}
                />
                <Text
                  style={[
                    styles.tabLabel,
                    { color },
                  ]}
                  numberOfLines={1}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 14,
    right: 14,
    zIndex: 100,
    // Drop shadow
    shadowColor: '#000000',
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.35,
    elevation: 12,
  },
  blurContainer: {
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    backgroundColor: 'rgba(11,13,22,0.92)',
  },
  innerContainer: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    gap: 3,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  activeIconShadow: {
    textShadowColor: 'rgba(200,168,75,0.6)',
    textShadowRadius: 10,
    textShadowOffset: { width: 0, height: 0 },
  },
});
