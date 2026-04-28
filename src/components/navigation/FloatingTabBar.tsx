import React, { useEffect } from 'react';
import { StyleSheet, Pressable, View, Text } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';
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

const FALLBACK_ICONS: [IoniconsName, IoniconsName] = ['ellipse-outline', 'ellipse'];

const ROUTE_LABELS: Record<string, string> = {
  index: 'Today',
  today: 'Today',
  schedule: 'Schedule',
  circadian: 'Circadian',
  profile: 'Profile',
  brief: 'Brief',
};

const ACTIVE_COLOR = '#7B61FF';
const INACTIVE_COLOR = '#6B7280';

// ---------------------------------------------------------------------------
// Tab item with press-scale + icon swap
// ---------------------------------------------------------------------------

interface TabItemProps {
  label: string;
  iconName: IoniconsName;
  isFocused: boolean;
  onPress: () => void;
  onLongPress: () => void;
  accessibilityLabel?: string;
}

function TabItem({
  label,
  iconName,
  isFocused,
  onPress,
  onLongPress,
  accessibilityLabel,
}: TabItemProps) {
  const scale = useSharedValue(1);
  const focusProgress = useSharedValue(isFocused ? 1 : 0);

  useEffect(() => {
    focusProgress.value = withTiming(isFocused ? 1 : 0, {
      duration: 220,
      easing: Easing.out(Easing.quad),
    });
  }, [isFocused, focusProgress]);

  const handlePressIn = () => {
    scale.value = withSpring(0.92, { damping: 18, stiffness: 380 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 18, stiffness: 380 });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const pillStyle = useAnimatedStyle(() => ({
    opacity: focusProgress.value,
    transform: [
      {
        scale: 0.92 + focusProgress.value * 0.08,
      },
    ],
  }));

  const color = isFocused ? ACTIVE_COLOR : INACTIVE_COLOR;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={isFocused ? { selected: true } : {}}
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onLongPress={onLongPress}
      style={styles.tab}
    >
      <Animated.View style={[styles.pill, pillStyle]} pointerEvents="none" />
      <Animated.View style={[styles.tabContent, animatedStyle]}>
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
            isFocused && styles.tabLabelActive,
          ]}
          numberOfLines={1}
        >
          {label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

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
        {/* Subtle inner highlight stripe along the top edge */}
        <View pointerEvents="none" style={styles.topHighlight} />
        <View style={styles.innerContainer}>
          {state.routes.map((route, index) => {
            const isFocused = state.index === index;
            const { options } = descriptors[route.key];
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
              <TabItem
                key={route.key}
                label={label}
                iconName={iconName}
                isFocused={isFocused}
                onPress={onPress}
                onLongPress={onLongPress}
                accessibilityLabel={options.tabBarAccessibilityLabel}
              />
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
    shadowColor: '#000000',
    shadowRadius: 18,
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.45,
    elevation: 14,
  },
  blurContainer: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(123,97,255,0.14)',
    backgroundColor: 'rgba(8,11,20,0.86)',
  },
  topHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  innerContainer: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  tab: {
    flex: 1,
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderRadius: 18,
    overflow: 'hidden',
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  pill: {
    ...StyleSheet.absoluteFillObject,
    margin: 4,
    borderRadius: 16,
    backgroundColor: 'rgba(123,97,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(123,97,255,0.22)',
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  tabLabelActive: {
    fontWeight: '600',
  },
  activeIconShadow: {
    textShadowColor: 'rgba(123,97,255,0.8)',
    textShadowRadius: 14,
    textShadowOffset: { width: 0, height: 0 },
  },
});
