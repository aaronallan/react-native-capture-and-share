import { Linking, Platform } from 'react-native';
import Share from 'react-native-share';

import { filterInstalledShareTargets } from './shareTargetAvailability';
import type { ShareTarget } from './types';

const ORIGINAL_OS = Platform.OS;

beforeEach(() => {
  jest.clearAllMocks();
});

afterEach(() => {
  Platform.OS = ORIGINAL_OS;
  jest.restoreAllMocks();
});

describe('on iOS', () => {
  beforeEach(() => {
    Platform.OS = 'ios';
  });

  it('keeps targets whose scheme Linking.canOpenURL resolves true for', async () => {
    jest.spyOn(Linking, 'canOpenURL').mockResolvedValue(true);
    const targets: ShareTarget[] = [
      { id: 'whatsapp', label: 'WhatsApp', social: Share.Social.WHATSAPP },
    ];

    const result = await filterInstalledShareTargets(targets);

    expect(Linking.canOpenURL).toHaveBeenCalledWith('whatsapp://');
    expect(result).toEqual(targets);
  });

  it('drops targets whose scheme Linking.canOpenURL resolves false for', async () => {
    jest.spyOn(Linking, 'canOpenURL').mockResolvedValue(false);
    const targets: ShareTarget[] = [
      { id: 'whatsapp', label: 'WhatsApp', social: Share.Social.WHATSAPP },
    ];

    const result = await filterInstalledShareTargets(targets);

    expect(result).toEqual([]);
  });

  it('preserves the original order of the targets it keeps', async () => {
    jest
      .spyOn(Linking, 'canOpenURL')
      .mockImplementation((url) => Promise.resolve(url !== 'twitter://'));
    const targets: ShareTarget[] = [
      { id: 'whatsapp', label: 'WhatsApp', social: Share.Social.WHATSAPP },
      { id: 'twitter', label: 'Twitter', social: Share.Social.TWITTER },
      { id: 'telegram', label: 'Telegram', social: Share.Social.TELEGRAM },
    ];

    const result = await filterInstalledShareTargets(targets);

    expect(result).toEqual([targets[0], targets[2]]);
  });

  it('does not probe a scheme for SMS or Email - both are always available', async () => {
    const canOpenURL = jest.spyOn(Linking, 'canOpenURL').mockResolvedValue(false);
    const targets: ShareTarget[] = [
      { id: 'sms', label: 'Messages', social: Share.Social.SMS },
      { id: 'email', label: 'Email', social: Share.Social.EMAIL },
    ];

    const result = await filterInstalledShareTargets(targets);

    expect(result).toEqual(targets);
    expect(canOpenURL).not.toHaveBeenCalled();
  });

  it('keeps a target with a social string not in the registry (fail open)', async () => {
    jest.spyOn(Linking, 'canOpenURL').mockResolvedValue(false);
    const targets: ShareTarget[] = [{ id: 'custom', label: 'Custom', social: 'some-custom-app' }];

    const result = await filterInstalledShareTargets(targets);

    expect(result).toEqual(targets);
  });

  it('keeps a target when Linking.canOpenURL rejects (fail open)', async () => {
    jest.spyOn(Linking, 'canOpenURL').mockRejectedValue(new Error('boom'));
    const targets: ShareTarget[] = [
      { id: 'whatsapp', label: 'WhatsApp', social: Share.Social.WHATSAPP },
    ];

    const result = await filterInstalledShareTargets(targets);

    expect(result).toEqual(targets);
  });
});

describe('on Android', () => {
  beforeEach(() => {
    Platform.OS = 'android';
  });

  it('keeps targets whose package Share.isPackageInstalled resolves installed for', async () => {
    (Share.isPackageInstalled as jest.Mock).mockResolvedValueOnce({
      isInstalled: true,
      message: '',
    });
    const targets: ShareTarget[] = [
      { id: 'whatsapp', label: 'WhatsApp', social: Share.Social.WHATSAPP },
    ];

    const result = await filterInstalledShareTargets(targets);

    expect(Share.isPackageInstalled).toHaveBeenCalledWith('com.whatsapp');
    expect(result).toEqual(targets);
  });

  it('drops targets whose package Share.isPackageInstalled resolves not-installed for', async () => {
    (Share.isPackageInstalled as jest.Mock).mockResolvedValueOnce({
      isInstalled: false,
      message: '',
    });
    const targets: ShareTarget[] = [
      { id: 'whatsapp', label: 'WhatsApp', social: Share.Social.WHATSAPP },
    ];

    const result = await filterInstalledShareTargets(targets);

    expect(result).toEqual([]);
  });

  it('does not probe a package for SMS or Email - both are always available', async () => {
    const targets: ShareTarget[] = [
      { id: 'sms', label: 'Messages', social: Share.Social.SMS },
      { id: 'email', label: 'Email', social: Share.Social.EMAIL },
    ];

    const result = await filterInstalledShareTargets(targets);

    expect(result).toEqual(targets);
    expect(Share.isPackageInstalled).not.toHaveBeenCalled();
  });

  it('keeps a target when Share.isPackageInstalled rejects (fail open)', async () => {
    (Share.isPackageInstalled as jest.Mock).mockRejectedValueOnce(new Error('boom'));
    const targets: ShareTarget[] = [
      { id: 'whatsapp', label: 'WhatsApp', social: Share.Social.WHATSAPP },
    ];

    const result = await filterInstalledShareTargets(targets);

    expect(result).toEqual(targets);
  });
});
