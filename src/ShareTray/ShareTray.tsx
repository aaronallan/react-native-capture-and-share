import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import BottomSheet, { BottomSheetScrollView, BottomSheetView } from '@gorhom/bottom-sheet';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import * as Clipboard from 'expo-clipboard';
import { captureRef } from 'react-native-view-shot';
import Share from 'react-native-share';
import type { ShareSingleOptions } from 'react-native-share';

import { PlatformIcon } from './PlatformIcon';
import type { ShareTarget, ShareTrayHandle, ShareTrayProps } from './types';

const COPY_CONFIRMATION_MS = 1500;

export const ShareTray = forwardRef<ShareTrayHandle, ShareTrayProps>(function ShareTray(
  { children, shareTargets, link, onDismiss },
  ref
) {
  const captureTargetRef = useRef<View>(null);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [capturedUri, setCapturedUri] = useState<string | null>(null);
  const [justCopied, setJustCopied] = useState(false);

  const captureAndShare = useCallback(async () => {
    const uri = await captureRef(captureTargetRef, { format: 'png', quality: 1 });
    setCapturedUri(uri);
    bottomSheetRef.current?.expand();
  }, []);

  useImperativeHandle(ref, () => ({ captureAndShare }), [captureAndShare]);

  const handleClose = useCallback(() => {
    setCapturedUri(null);
    setJustCopied(false);
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

  const handleCopyLinkPress = useCallback(async () => {
    if (!link) return;
    await Clipboard.setStringAsync(link);
    setJustCopied(true);
    setTimeout(() => setJustCopied(false), COPY_CONFIRMATION_MS);
  }, [link]);

  const handleMorePress = useCallback(async () => {
    if (!capturedUri) return;
    await Share.open({
      url: capturedUri,
      message: link,
      type: 'image/png',
    });
  }, [capturedUri, link]);

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

          <BottomSheetScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.carousel}
            contentContainerStyle={styles.carouselContent}
          >
            {shareTargets.map((target) => (
              <View key={target.id} style={styles.actionItem}>
                <Pressable
                  testID={`share-button-${target.id}`}
                  onPress={() => handleSharePress(target)}
                >
                  <PlatformIcon social={target.social} />
                </Pressable>
                <Text style={styles.actionLabel} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.75}>
                  {target.label}
                </Text>
              </View>
            ))}

            {link ? (
              <View style={styles.actionItem}>
                <Pressable testID="share-tray-copy-link-button" onPress={handleCopyLinkPress}>
                  <View style={styles.neutralCircle}>
                    <FontAwesome6 name="copy" iconStyle="regular" size={20} color="#1c1c1e" />
                  </View>
                </Pressable>
                <Text style={styles.actionLabel} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.75}>
                  {justCopied ? 'Copied' : 'Copy link'}
                </Text>
              </View>
            ) : null}

            <View style={styles.actionItem}>
              <Pressable testID="share-tray-more-button" onPress={handleMorePress}>
                <View style={styles.neutralCircle}>
                  <FontAwesome6 name="plus" iconStyle="solid" size={20} color="#1c1c1e" />
                </View>
              </Pressable>
              <Text style={styles.actionLabel} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.75}>
                More
              </Text>
            </View>
          </BottomSheetScrollView>
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
    // width: '100%' is required - without an explicit width, BottomSheetScrollView
    // under-measures its own viewport here and silently stops scrolling partway through
    // its content, with no error and no way to reach the rest.
    width: '100%',
    flexGrow: 0,
  },
  carouselContent: {
    flexDirection: 'row',
    gap: 14,
  },
  actionItem: {
    alignItems: 'center',
    width: 58,
  },
  neutralCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
  },
  actionLabel: {
    marginTop: 6,
    fontSize: 12,
    color: '#1c1c1e',
    textAlign: 'center',
  },
});
