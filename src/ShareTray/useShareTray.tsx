import React, { useCallback, useRef, useState } from 'react';
import type { ComponentType } from 'react';
import type { View } from 'react-native';
import BottomSheet from '@gorhom/bottom-sheet';
import * as Clipboard from 'expo-clipboard';
import { captureRef } from 'react-native-view-shot';
import Share from 'react-native-share';
import type { ShareSingleOptions } from 'react-native-share';

import { ShareTrayBody } from './ShareTrayBody';
import type { ShareTarget, UseShareTrayOptions, UseShareTrayResult } from './types';

const COPY_CONFIRMATION_MS = 1500;

/**
 * Headless capture-and-share pipeline, decoupled from what's on screen. `bind` marks whichever
 * view should be captured - a visible child (what `<ShareTray>` does for you) or a card mounted
 * off-screen - and `captureAndShare` captures whatever's currently bound. See `<ShareTray>` for
 * the common visible-child case; use this hook directly when the shareable content isn't (or
 * isn't only) what's rendered on screen.
 */
export function useShareTray({ shareTargets, link, onEvent }: UseShareTrayOptions): UseShareTrayResult {
  const targetRef = useRef<View | null>(null);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [capturedUri, setCapturedUri] = useState<string | null>(null);
  const [justCopied, setJustCopied] = useState(false);

  const bind = useCallback((node: View | null) => {
    targetRef.current = node;
  }, []);

  const captureAndShare = useCallback(async () => {
    if (!targetRef.current) return;
    try {
      const uri = await captureRef(targetRef, { format: 'png', quality: 1 });
      setCapturedUri(uri);
      bottomSheetRef.current?.expand();
      onEvent?.({ type: 'capture-success', uri });
    } catch (error) {
      onEvent?.({ type: 'capture-error', error });
    }
  }, [onEvent]);

  const handleSheetClose = useCallback(() => {
    setCapturedUri(null);
    setJustCopied(false);
    onEvent?.({ type: 'dismiss' });
  }, [onEvent]);

  const handleCloseButtonPress = useCallback(() => {
    bottomSheetRef.current?.close();
  }, []);

  const handleSharePress = useCallback(
    async (target: ShareTarget) => {
      if (!capturedUri) return;
      // Cast: ShareSingleOptions is a discriminated union keyed on `social` with
      // platform-specific extra fields (e.g. Facebook Stories needs `appId`). ShareTray only
      // supports the common { social, url, type } shape; see ShareTarget['social'] in types.ts.
      await Share.shareSingle({
        social: target.social,
        url: capturedUri,
        type: 'image/png',
      } as ShareSingleOptions);
      onEvent?.({ type: 'share', target });
    },
    [capturedUri, onEvent]
  );

  const handleCopyLinkPress = useCallback(async () => {
    if (!link) return;
    await Clipboard.setStringAsync(link);
    setJustCopied(true);
    setTimeout(() => setJustCopied(false), COPY_CONFIRMATION_MS);
    onEvent?.({ type: 'copy-link' });
  }, [link, onEvent]);

  const handleMorePress = useCallback(async () => {
    if (!capturedUri) return;
    await Share.open({
      url: capturedUri,
      message: link,
      type: 'image/png',
    });
    onEvent?.({ type: 'more' });
  }, [capturedUri, link, onEvent]);

  // TrayComponent must keep the same identity across renders - if this were recreated each
  // render (e.g. via useCallback with changing deps), React would treat it as a different
  // component type at the same JSX position and remount the native BottomSheet view every
  // time capturedUri/justCopied change, destroying the sheet's open/close state. Instead, the
  // component itself is created exactly once and reads current values through a ref that's
  // kept in sync on every render, so it stays up to date without ever changing identity.
  const liveRef = useRef<ShareTrayBodyLiveProps>(null as unknown as ShareTrayBodyLiveProps);
  liveRef.current = {
    capturedUri,
    justCopied,
    shareTargets,
    link,
    onSheetClose: handleSheetClose,
    onCloseButtonPress: handleCloseButtonPress,
    onSharePress: handleSharePress,
    onCopyLinkPress: handleCopyLinkPress,
    onMorePress: handleMorePress,
  };

  const [TrayComponent] = useState<ComponentType>(() => {
    return function TrayComponent() {
      const live = liveRef.current;
      return (
        <ShareTrayBody
          bottomSheetRef={bottomSheetRef}
          capturedUri={live.capturedUri}
          justCopied={live.justCopied}
          shareTargets={live.shareTargets}
          link={live.link}
          onSheetClose={live.onSheetClose}
          onCloseButtonPress={live.onCloseButtonPress}
          onSharePress={live.onSharePress}
          onCopyLinkPress={live.onCopyLinkPress}
          onMorePress={live.onMorePress}
        />
      );
    };
  });

  return { captureAndShare, bind, TrayComponent };
}

interface ShareTrayBodyLiveProps {
  capturedUri: string | null;
  justCopied: boolean;
  shareTargets: ShareTarget[];
  link: string | undefined;
  onSheetClose: () => void;
  onCloseButtonPress: () => void;
  onSharePress: (target: ShareTarget) => void;
  onCopyLinkPress: () => void;
  onMorePress: () => void;
}
