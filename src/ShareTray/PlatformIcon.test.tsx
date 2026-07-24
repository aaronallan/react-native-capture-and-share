import React from 'react';
import { render } from '@testing-library/react-native';
import type { TestInstance } from 'test-renderer';
import Share from 'react-native-share';

import { PlatformIcon } from './PlatformIcon';
import { SOCIAL_APPS } from './socialApps';

/** FontAwesome6/Ionicons fold `color` into a style array rather than exposing it as a prop. */
function glyphColor(glyph: TestInstance) {
  return (glyph.props.style as { color?: string }[]).find((s) => s?.color)?.color;
}

it('renders the registered brand icon style and color, and background, for a known social', async () => {
  const meta = SOCIAL_APPS[Share.Social.WHATSAPP]!;
  const { getByTestId } = await render(<PlatformIcon social={Share.Social.WHATSAPP} />);

  const glyph = getByTestId('platform-icon-glyph');
  expect(glyph.props.iconStyle).toBe('brand');
  expect(glyphColor(glyph)).toBe('#fff');
  expect(getByTestId('platform-icon').props.style).toEqual(
    expect.arrayContaining([expect.objectContaining({ backgroundColor: meta.backgroundColor })])
  );
});

it('gives WhatsApp Business the same glyph as WhatsApp but a distinct background', () => {
  const whatsapp = SOCIAL_APPS[Share.Social.WHATSAPP]!;
  const whatsappBusiness = SOCIAL_APPS[Share.Social.WHATSAPPBUSINESS]!;

  expect(whatsappBusiness.icon).toBe(whatsapp.icon);
  expect(whatsappBusiness.backgroundColor).not.toBe(whatsapp.backgroundColor);
});

it('renders Instagram inside its signature gradient with a white glyph', async () => {
  const { getByTestId } = await render(<PlatformIcon social={Share.Social.INSTAGRAM} />);

  expect(getByTestId('platform-icon').props.colors).toEqual([
    '#f09433',
    '#e6683c',
    '#dc2743',
    '#cc2366',
    '#bc1888',
  ]);
  const glyph = getByTestId('platform-icon-glyph');
  expect(glyph.props.iconStyle).toBe('brand');
  expect(glyphColor(glyph)).toBe('#fff');
});

it('renders Snapchat with a dark glyph so it stays visible on the yellow background', async () => {
  const { getByTestId } = await render(<PlatformIcon social={Share.Social.SNAPCHAT} />);

  const glyph = getByTestId('platform-icon-glyph');
  expect(glyphColor(glyph)).toBe('#000000');
  expect(getByTestId('platform-icon').props.style).toEqual(
    expect.arrayContaining([expect.objectContaining({ backgroundColor: '#FFFC00' })])
  );
});

it('falls back to a generic share glyph on a neutral background for an unregistered social', async () => {
  const { getByTestId } = await render(<PlatformIcon social="some-custom-app" />);

  const glyph = getByTestId('platform-icon-glyph');
  // Ionicons (the fallback), unlike FontAwesome6, has no `iconStyle` prop.
  expect(glyph.props.iconStyle).toBeUndefined();
  expect(glyphColor(glyph)).toBe('#fff');
  expect(getByTestId('platform-icon').props.style).toEqual(
    expect.arrayContaining([expect.objectContaining({ backgroundColor: '#8E8E93' })])
  );
});
