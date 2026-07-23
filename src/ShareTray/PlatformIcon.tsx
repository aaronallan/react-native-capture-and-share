import React from 'react';
import { StyleSheet, View } from 'react-native';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import Share from 'react-native-share';

const ICON_SIZE = 22;

const INSTAGRAM_GRADIENT = [
  '#f09433',
  '#e6683c',
  '#dc2743',
  '#cc2366',
  '#bc1888',
] as const;

const PLATFORM_BACKGROUND: Record<string, string> = {
  [Share.Social.WHATSAPP]: '#25D366',
  [Share.Social.TWITTER]: '#000000',
  [Share.Social.FACEBOOK]: '#1877F2',
  [Share.Social.TELEGRAM]: '#26A5E4',
};

const DEFAULT_BACKGROUND = '#8E8E93';

function PlatformGlyph({ social, color }: { social: string; color: string }) {
  switch (social) {
    case Share.Social.WHATSAPP:
      return <FontAwesome6 name="whatsapp" iconStyle="brand" size={ICON_SIZE} color={color} />;
    case Share.Social.TWITTER:
      return <FontAwesome6 name="x-twitter" iconStyle="brand" size={ICON_SIZE} color={color} />;
    case Share.Social.INSTAGRAM:
      return <FontAwesome6 name="instagram" iconStyle="brand" size={ICON_SIZE} color={color} />;
    case Share.Social.FACEBOOK:
      return <FontAwesome6 name="facebook" iconStyle="brand" size={ICON_SIZE} color={color} />;
    case Share.Social.TELEGRAM:
      return <FontAwesome6 name="telegram" iconStyle="brand" size={ICON_SIZE} color={color} />;
    default:
      return <Ionicons name="share-social-outline" size={ICON_SIZE} color={color} />;
  }
}

/** Circular, brand-colored icon for a direct-share platform. Falls back to a generic share glyph for unknown platforms. */
export function PlatformIcon({ social }: { social: string }) {
  if (social === Share.Social.INSTAGRAM) {
    return (
      <LinearGradient colors={INSTAGRAM_GRADIENT} style={styles.circle}>
        <PlatformGlyph social={social} color="#fff" />
      </LinearGradient>
    );
  }

  const backgroundColor = PLATFORM_BACKGROUND[social] ?? DEFAULT_BACKGROUND;
  return (
    <View style={[styles.circle, { backgroundColor }]}>
      <PlatformGlyph social={social} color="#fff" />
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
