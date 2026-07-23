import React, { forwardRef, useImperativeHandle } from 'react';
import { StyleSheet, View } from 'react-native';

import { useShareTray } from './useShareTray';
import type { ShareTrayHandle, ShareTrayProps } from './types';

/**
 * Wraps `children`, capturing and sharing exactly what's rendered inside it. This is the
 * common case; for content that isn't (or isn't only) what's on screen - e.g. a shareable
 * card rendered off-screen - use `useShareTray` directly instead of wrapping anything here.
 */
export const ShareTray = forwardRef<ShareTrayHandle, ShareTrayProps>(function ShareTray(
  { children, shareTargets, link, onEvent },
  ref
) {
  const { captureAndShare, bind, TrayComponent } = useShareTray({ shareTargets, link, onEvent });

  useImperativeHandle(ref, () => ({ captureAndShare }), [captureAndShare]);

  return (
    <View style={styles.container}>
      <View ref={bind} collapsable={false} style={styles.captureTarget}>
        {children}
      </View>
      <TrayComponent />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // Defensive: a reusable component shouldn't depend on the consumer's outer layout not
    // setting alignItems: 'center' on an ancestor (which would otherwise shrink this - and
    // the sheet inside it - to content width instead of the full device width).
    alignSelf: 'stretch',
  },
  captureTarget: {
    flex: 1,
    // Fallback background for the capture itself: react-native-view-shot captures whatever
    // is actually opaque, so if the wrapped content doesn't set its own background, the
    // capture comes out with transparent PNG areas - which then show through as whatever
    // color sits behind the preview Image instead of looking like a normal screenshot. A
    // consumer's own background still paints over this.
    backgroundColor: '#fff',
  },
});
