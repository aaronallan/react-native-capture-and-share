module.exports = {
  shareSingle: jest.fn(() => Promise.resolve({ success: true, message: '' })),
  open: jest.fn(() => Promise.resolve({ success: true, message: '' })),
  isPackageInstalled: jest.fn(() => Promise.resolve({ isInstalled: true, message: '' })),
  // Mirrors the real Share.Social enum (node_modules/react-native-share/lib/typescript/index.d.ts)
  // in full, since socialApps.ts keys its registry off every one of these values.
  Social: {
    FACEBOOK: 'facebook',
    FACEBOOK_STORIES: 'facebookstories',
    PAGESMANAGER: 'pagesmanager',
    TWITTER: 'twitter',
    WHATSAPP: 'whatsapp',
    WHATSAPPBUSINESS: 'whatsappbusiness',
    INSTAGRAM: 'instagram',
    INSTAGRAM_STORIES: 'instagramstories',
    GOOGLEPLUS: 'googleplus',
    EMAIL: 'email',
    PINTEREST: 'pinterest',
    LINKEDIN: 'linkedin',
    SMS: 'sms',
    TELEGRAM: 'telegram',
    SNAPCHAT: 'snapchat',
    MESSENGER: 'messenger',
    VIBER: 'viber',
    DISCORD: 'discord',
  },
};
