import React, { createRef } from 'react';
import { Text } from 'react-native';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
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

it('renders its child unchanged', async () => {
  await render(
    <ShareTray shareTargets={shareTargets}>
      <Text>wrapped content</Text>
    </ShareTray>
  );

  expect(screen.getByText('wrapped content')).toBeTruthy();
});

it('invokes the view-shot capture function against the wrapped child ref when captureAndShare is called', async () => {
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
  expect(captureRef).toHaveBeenCalledWith(
    expect.anything(),
    expect.objectContaining({ format: 'png' })
  );
});

it('shows the tray with the captured image once capture resolves', async () => {
  const ref = createRef<ShareTrayHandle>();
  await render(
    <ShareTray ref={ref} shareTargets={shareTargets}>
      <Text>wrapped content</Text>
    </ShareTray>
  );

  await act(async () => {
    await ref.current?.captureAndShare();
  });

  await waitFor(() => {
    expect(screen.getByTestId('share-tray-preview-image').props.source.uri).toBe(
      'file:///mock/capture.png'
    );
  });
});

it('calls react-native-share with the correct payload when a share button is pressed', async () => {
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
    expect.objectContaining({
      social: Share.Social.WHATSAPP,
      url: 'file:///mock/capture.png',
    })
  );
});

it('hides the tray and clears the captured uri when dismissed', async () => {
  const ref = createRef<ShareTrayHandle>();
  const onDismiss = jest.fn();
  await render(
    <ShareTray ref={ref} shareTargets={shareTargets} onDismiss={onDismiss}>
      <Text>wrapped content</Text>
    </ShareTray>
  );

  await act(async () => {
    await ref.current?.captureAndShare();
  });
  expect(screen.getByTestId('share-tray-preview-image')).toBeTruthy();

  await fireEvent.press(screen.getByTestId('share-tray-close-button'));

  expect(screen.queryByTestId('share-tray-preview-image')).toBeNull();
  expect(onDismiss).toHaveBeenCalledTimes(1);
});
