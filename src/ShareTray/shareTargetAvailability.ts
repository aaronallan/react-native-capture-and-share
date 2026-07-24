import { Linking, Platform } from 'react-native';
import Share from 'react-native-share';

import { SOCIAL_APPS } from './socialApps';
import type { ShareTarget } from './types';

async function isInstalled(social: string): Promise<boolean> {
  const meta = SOCIAL_APPS[social];
  // OS-level targets (SMS routes to Apple Messages/the device's default SMS app, Email to
  // Mail) have no separate app to detect, and a social string outside the registry can't be
  // checked either - both stay visible rather than being guessed away.
  if (!meta || (!meta.iosScheme && !meta.androidPackage)) return true;

  try {
    if (Platform.OS === 'ios') {
      return meta.iosScheme ? await Linking.canOpenURL(`${meta.iosScheme}://`) : true;
    }
    if (Platform.OS === 'android') {
      return meta.androidPackage
        ? (await Share.isPackageInstalled(meta.androidPackage)).isInstalled
        : true;
    }
  } catch {
    // Detection failing - e.g. the consumer's app didn't register this scheme/package via
    // react-native-share's Expo config plugin - shouldn't hide a target they explicitly
    // configured, so this fails open rather than propagating.
  }
  return true;
}

/** Narrows `targets` down to the ones actually installed on the device, preserving order. */
export async function filterInstalledShareTargets(targets: ShareTarget[]): Promise<ShareTarget[]> {
  const installed = await Promise.all(targets.map((target) => isInstalled(target.social)));
  return targets.filter((_, index) => installed[index]);
}
