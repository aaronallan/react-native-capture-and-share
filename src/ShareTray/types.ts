import type { ReactNode } from 'react';

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

export interface ShareTrayProps {
  /** The element to capture. Rendered unmodified as a child of ShareTray. */
  children: ReactNode;
  /** Share destinations rendered as a horizontal carousel once a capture is ready. */
  shareTargets: ShareTarget[];
  /** Called after the tray is dismissed and its captured-image state is cleared. */
  onDismiss?: () => void;
}

export interface ShareTrayHandle {
  /** Captures a screenshot of the wrapped child and opens the tray to show it. */
  captureAndShare: () => Promise<void>;
}
