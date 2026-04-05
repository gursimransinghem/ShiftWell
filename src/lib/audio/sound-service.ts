import { Audio } from 'expo-av';

let soundEnabled = true;

export function setSoundEnabled(enabled: boolean) {
  soundEnabled = enabled;
}

export function isSoundEnabled() {
  return soundEnabled;
}

export async function playCountdownComplete() {
  if (!soundEnabled) return;
  // Audio files will be added later
}

export async function playChecklistDone() {
  if (!soundEnabled) return;
}

export async function playNightSkyEnter() {
  if (!soundEnabled) return;
}
