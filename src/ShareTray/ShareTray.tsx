import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { captureRef } from 'react-native-view-shot';
import Share from 'react-native-share';
import type { ShareSingleOptions } from 'react-native-share';

import type { ShareTarget, ShareTrayHandle, ShareTrayProps } from './types';

export const ShareTray = forwardRef<ShareTrayHandle, ShareTrayProps>(function ShareTray(
  { children, shareTargets, onDismiss },
  ref
) {
  const captureTargetRef = useRef<View>(null);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [capturedUri, setCapturedUri] = useState<string | null>(null);

  const captureAndShare = useCallback(async () => {
    const uri = await captureRef(captureTargetRef, { format: 'png', quality: 1 });
    setCapturedUri(uri);
    bottomSheetRef.current?.expand();
  }, []);

  useImperativeHandle(ref, () => ({ captureAndShare }), [captureAndShare]);

  const handleClose = useCallback(() => {
    setCapturedUri(null);
    onDismiss?.();
  }, [onDismiss]);

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
    },
    [capturedUri]
  );

  return (
    <View style={styles.container}>
      <View ref={captureTargetRef} collapsable={false} style={styles.captureTarget}>
        {children}
      </View>

      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        enableDynamicSizing
        enablePanDownToClose
        onClose={handleClose}
      >
        <BottomSheetView style={styles.sheetContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Share</Text>
            <Pressable
              testID="share-tray-close-button"
              onPress={handleCloseButtonPress}
              hitSlop={8}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonLabel}>Close</Text>
            </Pressable>
          </View>

          {capturedUri ? (
            <Image
              testID="share-tray-preview-image"
              source={{ uri: capturedUri }}
              style={styles.preview}
              resizeMode="cover"
            />
          ) : null}

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.carouselContent}
            style={styles.carousel}
          >
            {shareTargets.map((target) => (
              <Pressable
                key={target.id}
                testID={`share-button-${target.id}`}
                onPress={() => handleSharePress(target)}
                style={styles.shareButton}
              >
                <Text>{target.label}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </BottomSheetView>
      </BottomSheet>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  captureTarget: {
    flex: 1,
  },
  sheetContent: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 28,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
  },
  closeButton: {
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  closeButtonLabel: {
    fontSize: 15,
    color: '#666',
  },
  preview: {
    width: '100%',
    height: 220,
    borderRadius: 14,
    backgroundColor: '#eee',
    marginBottom: 20,
  },
  carousel: {
    flexGrow: 0,
  },
  carouselContent: {
    flexDirection: 'row',
    gap: 12,
  },
  shareButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
  },
});
