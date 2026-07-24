import React from 'react';
import { Text, View } from 'react-native';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { captureRef } from 'react-native-view-shot';
import Share from 'react-native-share';

import { useShareTray } from './useShareTray';
import type { ShareTarget, ShareTrayEvent } from './types';

const shareTargets: ShareTarget[] = [
  { id: 'whatsapp', label: 'WhatsApp', social: Share.Social.WHATSAPP },
  { id: 'twitter', label: 'Twitter', social: Share.Social.TWITTER },
];

/** Mirrors how a consumer wraps visible content: bind on the visible child itself. */
function VisibleHarness({
  onEvent,
  dismissOnBackdropPress,
  backdropStyle,
  backdropOpacity,
}: {
  onEvent?: (event: ShareTrayEvent) => void;
  dismissOnBackdropPress?: boolean;
  backdropStyle?: object;
  backdropOpacity?: number;
}) {
  const { captureAndShare, bind, TrayComponent } = useShareTray({
    shareTargets,
    link: 'https://example.com/p/1',
    onEvent,
    dismissOnBackdropPress,
    backdropStyle,
    backdropOpacity,
  });
  return (
    <>
      <View ref={bind}>
        <Text>visible content</Text>
      </View>
      <TrayComponent />
      <Text testID="trigger" onPress={() => captureAndShare()}>
        trigger
      </Text>
    </>
  );
}

/**
 * Mirrors the off-screen use case this hook exists for: the bound view is never rendered as
 * visible "children" of anything ShareTray-shaped, just mounted (here, off-screen-styled) and
 * bound directly.
 */
function OffScreenHarness({ onEvent }: { onEvent?: (event: ShareTrayEvent) => void }) {
  const { captureAndShare, bind, TrayComponent } = useShareTray({ shareTargets, onEvent });
  return (
    <>
      <View style={{ position: 'absolute', left: -9999 }} ref={bind}>
        <Text>off-screen shareable card</Text>
      </View>
      <TrayComponent />
      <Text testID="trigger" onPress={() => captureAndShare()}>
        trigger
      </Text>
    </>
  );
}

beforeEach(() => {
  jest.clearAllMocks();
});

it('captures the off-screen bound view, never a visible-children wrapper', async () => {
  await render(<OffScreenHarness />);

  await act(async () => {
    fireEvent.press(screen.getByTestId('trigger'));
  });

  expect(captureRef).toHaveBeenCalledTimes(1);
  expect(captureRef).toHaveBeenCalledWith(
    expect.anything(),
    expect.objectContaining({ format: 'png' })
  );
  // The tray still comes up and shows the capture, exactly as with visible content.
  expect(screen.getByTestId('share-tray-preview-image').props.source.uri).toBe(
    'file:///mock/capture.png'
  );
});

it('does nothing if captureAndShare is called before bind has attached to any view', async () => {
  function UnboundHarness() {
    const { captureAndShare, TrayComponent } = useShareTray({ shareTargets });
    return (
      <>
        <TrayComponent />
        <Text testID="trigger" onPress={() => captureAndShare()}>
          trigger
        </Text>
      </>
    );
  }
  await render(<UnboundHarness />);

  await act(async () => {
    fireEvent.press(screen.getByTestId('trigger'));
  });

  expect(captureRef).not.toHaveBeenCalled();
  expect(screen.queryByTestId('share-tray-preview-image')).toBeNull();
});

it('emits capture-success with the resulting uri', async () => {
  const onEvent = jest.fn();
  await render(<VisibleHarness onEvent={onEvent} />);

  await act(async () => {
    fireEvent.press(screen.getByTestId('trigger'));
  });

  expect(onEvent).toHaveBeenCalledWith({
    type: 'capture-success',
    uri: 'file:///mock/capture.png',
  });
});

it('emits capture-error instead of throwing when captureRef rejects', async () => {
  (captureRef as jest.Mock).mockRejectedValueOnce(new Error('boom'));
  const onEvent = jest.fn();
  await render(<VisibleHarness onEvent={onEvent} />);

  await act(async () => {
    fireEvent.press(screen.getByTestId('trigger'));
  });

  expect(onEvent).toHaveBeenCalledWith({ type: 'capture-error', error: expect.any(Error) });
  expect(screen.queryByTestId('share-tray-preview-image')).toBeNull();
});

it('emits a share event with the target when a share button is pressed', async () => {
  const onEvent = jest.fn();
  await render(<VisibleHarness onEvent={onEvent} />);

  await act(async () => {
    fireEvent.press(screen.getByTestId('trigger'));
  });
  await fireEvent.press(await screen.findByTestId('share-button-whatsapp'));

  expect(Share.shareSingle).toHaveBeenCalledWith(
    expect.objectContaining({ social: Share.Social.WHATSAPP, url: 'file:///mock/capture.png' })
  );
  expect(onEvent).toHaveBeenCalledWith({ type: 'share', target: shareTargets[0] });
});

it('copies the link, emits copy-link, and shows a confirmation', async () => {
  jest.useFakeTimers();
  const Clipboard = require('expo-clipboard');
  const onEvent = jest.fn();
  await render(<VisibleHarness onEvent={onEvent} />);

  await act(async () => {
    fireEvent.press(screen.getByTestId('trigger'));
  });
  const copyButton = await screen.findByTestId('share-tray-copy-link-button');
  await fireEvent.press(copyButton);

  expect(Clipboard.setStringAsync).toHaveBeenCalledWith('https://example.com/p/1');
  expect(onEvent).toHaveBeenCalledWith({ type: 'copy-link' });
  expect(screen.getByText('Copied')).toBeTruthy();

  await act(async () => {
    jest.runAllTimers();
  });
  expect(screen.getByText('Copy link')).toBeTruthy();
  jest.useRealTimers();
});

it('opens the generic share sheet and emits a more event', async () => {
  const onEvent = jest.fn();
  await render(<VisibleHarness onEvent={onEvent} />);

  await act(async () => {
    fireEvent.press(screen.getByTestId('trigger'));
  });
  await fireEvent.press(await screen.findByTestId('share-tray-more-button'));

  expect(Share.open).toHaveBeenCalledWith(
    expect.objectContaining({ url: 'file:///mock/capture.png' })
  );
  expect(onEvent).toHaveBeenCalledWith({ type: 'more' });
});

it('emits dismiss and clears the preview when the tray is closed', async () => {
  const onEvent = jest.fn();
  await render(<VisibleHarness onEvent={onEvent} />);

  await act(async () => {
    fireEvent.press(screen.getByTestId('trigger'));
  });
  expect(screen.getByTestId('share-tray-preview-image')).toBeTruthy();

  await fireEvent.press(screen.getByTestId('share-tray-close-button'));

  expect(screen.queryByTestId('share-tray-preview-image')).toBeNull();
  expect(onEvent).toHaveBeenCalledWith({ type: 'dismiss' });
});

it('configures the backdrop to dismiss on press by default', async () => {
  await render(<VisibleHarness />);

  await act(async () => {
    fireEvent.press(screen.getByTestId('trigger'));
  });

  expect(screen.getByTestId('bottom-sheet-backdrop').props.pressBehavior).toBe('close');
});

it('does not configure the backdrop to dismiss on press when dismissOnBackdropPress is false', async () => {
  await render(<VisibleHarness dismissOnBackdropPress={false} />);

  await act(async () => {
    fireEvent.press(screen.getByTestId('trigger'));
  });

  expect(screen.getByTestId('bottom-sheet-backdrop').props.pressBehavior).toBe('none');
});

it('passes backdropStyle and backdropOpacity through to the backdrop', async () => {
  await render(
    <VisibleHarness backdropStyle={{ backgroundColor: 'red' }} backdropOpacity={0.8} />
  );

  await act(async () => {
    fireEvent.press(screen.getByTestId('trigger'));
  });

  const backdrop = screen.getByTestId('bottom-sheet-backdrop');
  expect(backdrop.props.opacity).toBe(0.8);
  expect(backdrop.props.style).toEqual(
    expect.arrayContaining([expect.objectContaining({ backgroundColor: 'red' })])
  );
});

it('leaves backdropStyle/backdropOpacity undefined (library defaults) when not provided', async () => {
  await render(<VisibleHarness />);

  await act(async () => {
    fireEvent.press(screen.getByTestId('trigger'));
  });

  const backdrop = screen.getByTestId('bottom-sheet-backdrop');
  expect(backdrop.props.opacity).toBeUndefined();
});

it('keeps a stable TrayComponent identity across re-renders instead of remounting the sheet', async () => {
  const seenTypes = new Set<unknown>();
  function IdentityHarness() {
    const { captureAndShare, bind, TrayComponent } = useShareTray({ shareTargets });
    seenTypes.add(TrayComponent);
    return (
      <>
        <View ref={bind}>
          <Text>content</Text>
        </View>
        <TrayComponent />
        <Text testID="trigger" onPress={() => captureAndShare()}>
          trigger
        </Text>
      </>
    );
  }

  await render(<IdentityHarness />);
  await act(async () => {
    fireEvent.press(screen.getByTestId('trigger'));
  });
  // captureAndShare's setState calls above triggered at least one re-render of IdentityHarness;
  // if TrayComponent's identity changed across those renders, this set would have >1 entries.
  expect(seenTypes.size).toBe(1);
});
