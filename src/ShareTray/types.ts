import type { ComponentType, ReactNode, RefCallback } from 'react';
import type { View } from 'react-native';

/** A single direct-share destination rendered as a button in the tray's carousel. */
export interface ShareTarget {
  /** Stable identifier, also used to build the button's testID (`share-button-${id}`). */
  id: string;
  /** Label rendered under/next to the share icon. */
  label: string;
  /**
   * One of `Share.Social`'s values (e.g. `Share.Social.WHATSAPP`). Typed as `string` rather
   * than react-native-share's `Social` union since `shareSingle`'s options type varies per
   * platform (e.g. Facebook Stories requires an extra `appId`); callers needing those extra
   * fields should call `Share.shareSingle` directly instead of going through ShareTray.
   */
  social: string;
}

/** Lifecycle events emitted by `useShareTray` (and, by extension, `<ShareTray>`) via `onEvent`. */
export type ShareTrayEvent =
  | { type: 'capture-success'; uri: string }
  | { type: 'capture-error'; error: unknown }
  | { type: 'share'; target: ShareTarget }
  | { type: 'share-error'; target: ShareTarget; error: unknown }
  | { type: 'copy-link' }
  | { type: 'more' }
  | { type: 'more-error'; error: unknown }
  | { type: 'dismiss' };

export interface UseShareTrayOptions {
  /** Share destinations rendered as a horizontal carousel once a capture is ready. */
  shareTargets: ShareTarget[];
  /**
   * A URL associated with the captured content. When provided, a "Copy link" action is
   * rendered in the carousel that copies this value to the clipboard, and it's included as
   * the `message` when the "More" action opens the generic system share sheet.
   */
  link?: string;
  /** Called for each tray lifecycle event - capture result, action presses, dismiss. */
  onEvent?: (event: ShareTrayEvent) => void;
}

export interface UseShareTrayResult {
  /** Captures whatever view is currently bound via `bind` and opens the tray to show it. */
  captureAndShare: () => Promise<void>;
  /**
   * Ref callback that marks a view as the capture target. Attach it to any View - visible or
   * rendered off-screen (e.g. `position: 'absolute', left: -9999`) - via `<View ref={bind}>`.
   * `captureAndShare` captures whichever view was most recently bound.
   */
  bind: RefCallback<View>;
  /**
   * Renders the tray's bottom-sheet UI. Stable component identity across renders (safe to
   * render unconditionally as `<TrayComponent />`) - it reads current state through a ref
   * rather than closing over props, so re-renders update it in place instead of remounting
   * the underlying native sheet.
   */
  TrayComponent: ComponentType;
}

export interface ShareTrayProps {
  /** The element to capture. Rendered unmodified as a child of ShareTray. */
  children: ReactNode;
  /** Share destinations rendered as a horizontal carousel once a capture is ready. */
  shareTargets: ShareTarget[];
  /**
   * A URL associated with the captured content. When provided, a "Copy link" action is
   * rendered in the carousel that copies this value to the clipboard, and it's included as
   * the `message` when the "More" action opens the generic system share sheet.
   */
  link?: string;
  /** Called for each tray lifecycle event - capture result, action presses, dismiss. */
  onEvent?: (event: ShareTrayEvent) => void;
}

export interface ShareTrayHandle {
  /** Captures a screenshot of the wrapped child and opens the tray to show it. */
  captureAndShare: () => Promise<void>;
}
