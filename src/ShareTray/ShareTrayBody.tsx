import React from 'react';
import type { RefObject } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';

import { PlatformIcon } from './PlatformIcon';
import type { ShareTarget } from './types';

export interface ShareTrayBodyProps {
  bottomSheetRef: RefObject<BottomSheet | null>;
  capturedUri: string | null;
  justCopied: boolean;
  shareTargets: ShareTarget[];
  link?: string;
  dismissOnBackdropPress: boolean;
  backdropStyle?: StyleProp<ViewStyle>;
  backdropOpacity?: number;
  onSheetClose: () => void;
  onCloseButtonPress: () => void;
  onSharePress: (target: ShareTarget) => void;
  onCopyLinkPress: () => void;
  onMorePress: () => void;
  /** Fired on every native layout pass of the sheet's content (image, carousel, etc). */
  onContentLayout: () => void;
}

/** Pure presentational tray UI. Rendered by `useShareTray`'s `TrayComponent`; not exported. */
export function ShareTrayBody({
  bottomSheetRef,
  capturedUri,
  justCopied,
  shareTargets,
  link,
  dismissOnBackdropPress,
  backdropStyle,
  backdropOpacity,
  onSheetClose,
  onCloseButtonPress,
  onSharePress,
  onCopyLinkPress,
  onMorePress,
  onContentLayout,
}: ShareTrayBodyProps) {
  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      enableDynamicSizing
      enablePanDownToClose
      onClose={onSheetClose}
      // Without these, the sheet's own vertical pan gesture competes with the horizontal
      // carousel below and steals slightly-diagonal swipes, making the scroll feel janky.
      // activeOffsetY requires >10px of vertical movement before the sheet starts responding
      // to the drag at all; failOffsetX yields to a horizontal gesture (the carousel's
      // ScrollView) once movement is clearly horizontal.
      activeOffsetY={[-10, 10]}
      failOffsetX={[-10, 10]}
      backgroundStyle={styles.sheetBackground}
      backdropComponent={(props) => (
        <BottomSheetBackdrop
          {...props}
          // Matches this sheet's own index scheme (closed: -1, open: 0 - there's only ever
          // one snap point, from enableDynamicSizing) rather than the library's defaults
          // (1/0), which assume a sheet with a collapsed AND expanded snap point.
          appearsOnIndex={0}
          disappearsOnIndex={-1}
          pressBehavior={dismissOnBackdropPress ? 'close' : 'none'}
          style={[props.style, backdropStyle]}
          opacity={backdropOpacity}
        />
      )}
    >
      <BottomSheetView style={styles.sheetContent} onLayout={onContentLayout}>
        <View style={[styles.header, styles.paddedContent]}>
          <Text style={styles.title}>Share</Text>
          <Pressable
            testID="share-tray-close-button"
            onPress={onCloseButtonPress}
            hitSlop={8}
            style={styles.closeButton}
          >
            <FontAwesome6 name="xmark" iconStyle="solid" size={18} color="#1c1c1e" />
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

        {/* A horizontal ScrollView/BottomSheetScrollView here silently truncates to whatever
            fit in the initial viewport with no way to scroll further, on-device, unless given
            an explicit width - see the `carousel` style comment below. */}
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
                onPress={() => onSharePress(target)}
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
              <Pressable testID="share-tray-copy-link-button" onPress={onCopyLinkPress}>
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
            <Pressable testID="share-tray-more-button" onPress={onMorePress}>
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
  );
}

const styles = StyleSheet.create({
  sheetContent: {
    paddingTop: 4,
    paddingBottom: 28,
  },
  paddedContent: {
    paddingHorizontal: 20,
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
  sheetBackground: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 30,
  },
  preview: {
    marginHorizontal: 20,
    height: 220,
    borderRadius: 14,
    backgroundColor: '#eee',
    marginBottom: 20,
  },
  carousel: {
    // width: '100%' is required - without an explicit width, BottomSheetScrollView
    // under-measures its own viewport here and silently stops scrolling partway through
    // its content, with no error and no way to reach the rest. Left unpadded (unlike
    // header/preview) so the scrollable viewport reaches the sheet's true edges; the
    // resting inset instead comes from carouselContent's contentContainerStyle padding.
    width: '100%',
    flexGrow: 0,
  },
  carouselContent: {
    flexDirection: 'row',
    gap: 14,
    paddingHorizontal: 20,
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
