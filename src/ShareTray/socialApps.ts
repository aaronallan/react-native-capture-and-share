import Share from 'react-native-share';

export interface SocialAppMeta {
  /** FontAwesome6 icon name rendered for this platform's circle. */
  icon: string;
  /** FontAwesome6 icon style (family) the icon name belongs to. */
  iconStyle: 'brand' | 'solid';
  /** Circle background color. */
  backgroundColor: string;
  /** Glyph color over the background; defaults to white when omitted. */
  glyphColor?: string;
  /**
   * URL scheme probed via `Linking.canOpenURL` to detect whether the app is installed on iOS.
   * Omitted for OS-level targets (SMS, Email) that have no separate app to detect - those are
   * always treated as available.
   */
  iosScheme?: string;
  /**
   * Package name probed via `Share.isPackageInstalled` to detect whether the app is installed
   * on Android. Omitted for OS-level targets (SMS, Email) that have no separate app to detect -
   * those are always treated as available.
   */
  androidPackage?: string;
}

/**
 * Metadata for every `Share.Social` value ShareTray supports as a `ShareTarget`, except: the
 * Stories variants, which require an extra required `appId` and so don't fit the single shared
 * shape ShareTray hands to `shareSingle` (see `ShareTarget['social']` in types.ts); and
 * Googleplus, a defunct product with no app left to curate. Drives both `PlatformIcon` and
 * `shareTargetAvailability`'s installed-app check.
 */
export const SOCIAL_APPS: Record<string, SocialAppMeta> = {
  [Share.Social.FACEBOOK]: {
    icon: 'facebook',
    iconStyle: 'brand',
    backgroundColor: '#1877F2',
    iosScheme: 'fb',
    androidPackage: 'com.facebook.katana',
  },
  [Share.Social.PAGESMANAGER]: {
    // react-native-share (and this social's name) still call it "Pages Manager", but Meta
    // renamed the app itself to "Meta Business Suite" - same app, same package/App Store
    // listing (com.facebook.pages.app), just rebranded. FontAwesome has no icon for either
    // name, so this uses a generic briefcase rather than reusing Facebook's own logo, which
    // would misrepresent it as the same app.
    icon: 'briefcase',
    iconStyle: 'solid',
    backgroundColor: '#0A5DC2',
    iosScheme: 'fb-pages-manager',
    androidPackage: 'com.facebook.pages.app',
  },
  [Share.Social.TWITTER]: {
    icon: 'x-twitter',
    iconStyle: 'brand',
    backgroundColor: '#000000',
    iosScheme: 'twitter',
    androidPackage: 'com.twitter.android',
  },
  [Share.Social.WHATSAPP]: {
    icon: 'whatsapp',
    iconStyle: 'brand',
    backgroundColor: '#25D366',
    iosScheme: 'whatsapp',
    androidPackage: 'com.whatsapp',
  },
  [Share.Social.WHATSAPPBUSINESS]: {
    icon: 'whatsapp',
    iconStyle: 'brand',
    backgroundColor: '#075E54',
    iosScheme: 'whatsapp-business',
    androidPackage: 'com.whatsapp.w4b',
  },
  [Share.Social.INSTAGRAM]: {
    // Background is overridden by PlatformIcon's gradient special-case; kept here as a
    // sensible flat fallback if that special-case is ever removed.
    icon: 'instagram',
    iconStyle: 'brand',
    backgroundColor: '#bc1888',
    iosScheme: 'instagram',
    androidPackage: 'com.instagram.android',
  },
  // Deliberately no entry for Share.Social.GOOGLEPLUS - Google+ shut down in 2019, so there's
  // no app left to detect or curate an icon for. It falls back to PlatformIcon's generic glyph
  // if a consumer configures it anyway.
  [Share.Social.EMAIL]: {
    icon: 'envelope',
    iconStyle: 'solid',
    backgroundColor: '#5F6368',
  },
  [Share.Social.PINTEREST]: {
    icon: 'pinterest',
    iconStyle: 'brand',
    backgroundColor: '#E60023',
    iosScheme: 'pinterest',
    androidPackage: 'com.pinterest',
  },
  [Share.Social.LINKEDIN]: {
    icon: 'linkedin',
    iconStyle: 'brand',
    backgroundColor: '#0A66C2',
    iosScheme: 'linkedin',
    androidPackage: 'com.linkedin.android',
  },
  [Share.Social.SMS]: {
    // Routes to Apple Messages on iOS and the device's default SMS app on Android (both
    // resolved natively by react-native-share) - there's no separate app to detect here.
    // A plain bubble, not 'comment-sms' (which bakes the literal text "SMS" into the glyph).
    icon: 'comment',
    iconStyle: 'solid',
    backgroundColor: '#34C759',
  },
  [Share.Social.TELEGRAM]: {
    icon: 'telegram',
    iconStyle: 'brand',
    backgroundColor: '#26A5E4',
    iosScheme: 'tg',
    androidPackage: 'org.telegram.messenger',
  },
  [Share.Social.SNAPCHAT]: {
    // Overridden by PlatformIcon's dark-glyph special-case - a white glyph is invisible on
    // Snapchat's signature yellow.
    icon: 'snapchat',
    iconStyle: 'brand',
    backgroundColor: '#FFFC00',
    glyphColor: '#000000',
    iosScheme: 'snapchat',
    androidPackage: 'com.snapchat.android',
  },
  [Share.Social.MESSENGER]: {
    icon: 'facebook-messenger',
    iconStyle: 'brand',
    backgroundColor: '#00B2FF',
    iosScheme: 'fb-messenger',
    androidPackage: 'com.facebook.orca',
  },
  [Share.Social.VIBER]: {
    icon: 'viber',
    iconStyle: 'brand',
    backgroundColor: '#7360F2',
    iosScheme: 'viber',
    androidPackage: 'com.viber.voip',
  },
  [Share.Social.DISCORD]: {
    icon: 'discord',
    iconStyle: 'brand',
    backgroundColor: '#5865F2',
    iosScheme: 'discord',
    androidPackage: 'com.discord',
  },
};
