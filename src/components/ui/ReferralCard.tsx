/**
 * ReferralCard — "Invite a colleague" component.
 *
 * Renders a card with the user's referral link and a Share button.
 * Uses expo-sharing / React Native Share sheet.
 *
 * GRO-01: Referral deep link generation and sharing.
 */

import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useUserStore } from '@/src/store/user-store';
import { buildReferralUrl } from '@/src/lib/growth/referral';
import { COLORS, RADIUS, SPACING } from '@/src/theme';

export default function ReferralCard() {
  const profile = useUserStore((s) => s.profile);
  const [referralUrl, setReferralUrl] = useState<string | null>(null);
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    if (profile.id) {
      setReferralUrl(buildReferralUrl(profile.id));
    }
  }, [profile.id]);

  async function handleShare() {
    if (!referralUrl) return;
    setSharing(true);
    try {
      const message =
        "I've been optimizing my shift sleep with ShiftWell — the circadian app built for shift workers. Join me: " +
        referralUrl;
      await Share.share({ message, url: referralUrl });
    } finally {
      setSharing(false);
    }
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Ionicons name="people-outline" size={20} color={COLORS.accent.primary} />
        <Text style={styles.title}>Invite a colleague</Text>
      </View>

      <Text style={styles.subtitle}>
        Every shift worker deserves better sleep. Share ShiftWell with your team.
      </Text>

      {referralUrl ? (
        <View style={styles.linkRow}>
          <Text style={styles.linkText} numberOfLines={1} ellipsizeMode="tail">
            {referralUrl}
          </Text>
        </View>
      ) : (
        <View style={styles.linkRow}>
          <ActivityIndicator size="small" color={COLORS.text.muted} />
        </View>
      )}

      <TouchableOpacity
        style={[styles.shareBtn, (sharing || !referralUrl) && styles.shareBtnDisabled]}
        onPress={handleShare}
        disabled={sharing || !referralUrl}
        activeOpacity={0.8}
      >
        <Ionicons name="share-outline" size={16} color="#0B0D16" />
        <Text style={styles.shareBtnText}>{sharing ? 'Sharing…' : 'Share My Link'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.background.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    gap: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.text.secondary,
    lineHeight: 18,
  },
  linkRow: {
    backgroundColor: COLORS.background.elevated,
    borderRadius: RADIUS.sm,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 36,
    justifyContent: 'center',
  },
  linkText: {
    fontSize: 12,
    color: COLORS.text.muted,
    fontFamily: 'SpaceMono',
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.accent.primary,
    borderRadius: RADIUS.md,
    paddingVertical: 11,
    marginTop: 2,
  },
  shareBtnDisabled: {
    opacity: 0.5,
  },
  shareBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0B0D16',
  },
});
