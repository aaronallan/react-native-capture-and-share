import React, { createRef } from 'react';
import { Text } from 'react-native';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { captureRef } from 'react-native-view-shot';
import Share from 'react-native-share';

import { ShareTray } from './ShareTray';
import type { ShareTrayHandle, ShareTarget } from './types';

const shareTargets: ShareTarget[] = [
  { id: 'whatsapp', label: 'WhatsApp', social: Share.Social.WHATSAPP },
  { id: 'twitter', label: 'Twitter', social: Share.Social.TWITTER },
];

beforeEach(() => {
  jest.clearAllMocks();
});

// ShareTray is a thin wrapper over useShareTray (see useShareTray.test.tsx for the deep
// behavioral coverage - capture-error, per-action events, off-screen capture, TrayComponent
// identity stability). These tests just confirm the wrapper wires children/props/ref through
// to the hook correctly.

it('renders its child unchanged', async () => {
  await render(
    <ShareTray shareTargets={shareTargets}>
      <Text>wrapped content</Text>
    </ShareTray>
  );

  expect(screen.getByText('wrapped content')).toBeTruthy();
});

it('captures the wrapped child via the exposed ref handle and shows it in the tray', async () => {
  const ref = createRef<ShareTrayHandle>();
  await render(
    <ShareTray ref={ref} shareTargets={shareTargets}>
      <Text>wrapped content</Text>
    </ShareTray>
  );

  await act(async () => {
    await ref.current?.captureAndShare();
  });

  expect(captureRef).toHaveBeenCalledTimes(1);
  expect(screen.getByTestId('share-tray-preview-image').props.source.uri).toBe(
    'file:///mock/capture.png'
  );
});

it('passes shareTargets through so each renders a working share button', async () => {
  const ref = createRef<ShareTrayHandle>();
  await render(
    <ShareTray ref={ref} shareTargets={shareTargets}>
      <Text>wrapped content</Text>
    </ShareTray>
  );

  await act(async () => {
    await ref.current?.captureAndShare();
  });
  await fireEvent.press(await screen.findByTestId('share-button-whatsapp'));

  expect(Share.shareSingle).toHaveBeenCalledWith(
    expect.objectContaining({ social: Share.Social.WHATSAPP })
  );
});

it('only renders the copy-link action when a link is provided', async () => {
  const ref = createRef<ShareTrayHandle>();
  const { rerender } = await render(
    <ShareTray ref={ref} shareTargets={shareTargets}>
      <Text>wrapped content</Text>
    </ShareTray>
  );
  await act(async () => {
    await ref.current?.captureAndShare();
  });
  expect(screen.queryByTestId('share-tray-copy-link-button')).toBeNull();

  await rerender(
    <ShareTray ref={ref} shareTargets={shareTargets} link="https://example.com/p/1">
      <Text>wrapped content</Text>
    </ShareTray>
  );
  expect(screen.getByTestId('share-tray-copy-link-button')).toBeTruthy();
});

it('forwards lifecycle events to onEvent and clears the preview on dismiss', async () => {
  const ref = createRef<ShareTrayHandle>();
  const onEvent = jest.fn();
  await render(
    <ShareTray ref={ref} shareTargets={shareTargets} onEvent={onEvent}>
      <Text>wrapped content</Text>
    </ShareTray>
  );

  await act(async () => {
    await ref.current?.captureAndShare();
  });
  expect(onEvent).toHaveBeenCalledWith(expect.objectContaining({ type: 'capture-success' }));

  await fireEvent.press(screen.getByTestId('share-tray-close-button'));

  expect(screen.queryByTestId('share-tray-preview-image')).toBeNull();
  expect(onEvent).toHaveBeenCalledWith({ type: 'dismiss' });
});
