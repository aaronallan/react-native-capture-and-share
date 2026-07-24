import React from 'react';
import { StyleSheet, View } from 'react-native';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import Share from 'react-native-share';

import { SOCIAL_APPS } from './socialApps';

const ICON_SIZE = 22;

const INSTAGRAM_GRADIENT = [
  '#f09433',
  '#e6683c',
  '#dc2743',
  '#cc2366',
  '#bc1888',
] as const;

const DEFAULT_BACKGROUND = '#8E8E93';

/** Circular, brand-colored icon for a direct-share platform. Falls back to a generic share glyph for unknown platforms. */
export function PlatformIcon({ social }: { social: string }) {
  if (social === Share.Social.INSTAGRAM) {
    return (
      <LinearGradient testID="platform-icon" colors={INSTAGRAM_GRADIENT} style={styles.circle}>
        <FontAwesome6
          testID="platform-icon-glyph"
          name="instagram"
          iconStyle="brand"
          size={ICON_SIZE}
          color="#fff"
        />
      </LinearGradient>
    );
  }

  const meta = SOCIAL_APPS[social];
  if (!meta) {
    return (
      <View testID="platform-icon" style={[styles.circle, { backgroundColor: DEFAULT_BACKGROUND }]}>
        <Ionicons
          testID="platform-icon-glyph"
          name="share-social-outline"
          size={ICON_SIZE}
          color="#fff"
        />
      </View>
    );
  }

  return (
    <View testID="platform-icon" style={[styles.circle, { backgroundColor: meta.backgroundColor }]}>
      <FontAwesome6
        testID="platform-icon-glyph"
        name={meta.icon}
        iconStyle={meta.iconStyle}
        size={ICON_SIZE}
        color={meta.glyphColor ?? '#fff'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
