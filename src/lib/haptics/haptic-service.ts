import * as Haptics from 'expo-haptics';

export async function tapLight() {
  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

export async function tapSuccess() {
  await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
}

export async function scoreViewHaptic() {
  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

export async function windDownStartHaptic() {
  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium), 100);
  setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light), 200);
}

export async function countdownZeroHaptic() {
  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
}

export async function scoreHighHaptic() {
  await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  setTimeout(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success), 200);
}
