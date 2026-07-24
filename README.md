# react-native-capture-and-share

A React Native component for capturing a screenshot of any view and sharing it directly to social apps via a bottom tray with a carousel of share targets.

Originally built internally at Coinbase as "ShareTray"; this project is an open-source reimplementation.

## Installation

```sh
npm install react-native-capture-and-share
```

This library wraps several native modules, which you need installed in your own project as peer dependencies:

```sh
npx expo install @expo/vector-icons @gorhom/bottom-sheet expo-asset expo-clipboard \
  expo-font expo-linear-gradient react-native-gesture-handler react-native-reanimated \
  react-native-safe-area-context react-native-share react-native-view-shot react-native-worklets
```

`@gorhom/bottom-sheet` requires `GestureHandlerRootView` to wrap your app - see its [installation guide](https://gorhom.dev/react-native-bottom-sheet/) if you don't already have one set up.

### Detecting installed apps

ShareTray only renders the `shareTargets` that are actually installed on the device - checked once on mount and again whenever the `shareTargets` array itself changes, not on every `captureAndShare()` call. Detection works differently per platform:

- **iOS**: `Linking.canOpenURL()` against each app's URL scheme. This only works for schemes your app has declared in `Info.plist`'s `LSApplicationQueriesSchemes` - anything else fails open (the target stays visible even if the app isn't installed).
- **Android**: `Share.isPackageInstalled()` against each app's package name.
- **SMS and Email** are OS-level (no separate app to detect - SMS opens Apple Messages on iOS and the device's default SMS app on Android) and are always shown.

react-native-share ships an Expo config plugin that registers exactly this for you - list the same social apps you pass as `shareTargets`:

```json
{
  "plugins": [
    [
      "react-native-share",
      {
        "ios": ["whatsapp", "twitter", "instagram"],
        "android": ["com.whatsapp", "com.twitter.android", "com.instagram.android"]
      }
    ]
  ]
}
```

Then rebuild the native project (`npx expo prebuild`). Bare (non-Expo) projects add the equivalent entries to `Info.plist`/`AndroidManifest.xml` directly - see [react-native-share's README](https://github.com/react-native-share/react-native-share).

## Usage

### Wrapping visible content

```tsx
import { useRef } from 'react';
import { Button, View } from 'react-native';
import { ShareTray, type ShareTrayHandle } from 'react-native-capture-and-share';

function MyScreen() {
  const trayRef = useRef<ShareTrayHandle>(null);

  return (
    <ShareTray
      ref={trayRef}
      shareTargets={[
        { id: 'whatsapp', label: 'WhatsApp', social: 'whatsapp' },
        { id: 'twitter', label: 'Twitter', social: 'twitter' },
      ]}
      link="https://example.com/share/this"
    >
      <View>{/* whatever should be captured and shared */}</View>
      <Button title="Share" onPress={() => trayRef.current?.captureAndShare()} />
    </ShareTray>
  );
}
```

### Capturing content that isn't on screen

`<ShareTray>` always captures its `children`. For a shareable card that's rendered off-screen (never shown to the user) or otherwise isn't what's currently visible, use the headless `useShareTray` hook directly instead:

```tsx
import { useShareTray } from 'react-native-capture-and-share';

function ShareableCard() {
  const { captureAndShare, bind, TrayComponent } = useShareTray({
    shareTargets: [{ id: 'whatsapp', label: 'WhatsApp', social: 'whatsapp' }],
  });

  return (
    <>
      <View style={{ position: 'absolute', left: -9999 }}>
        <View ref={bind}>{/* the card to capture, never actually seen */}</View>
      </View>
      <Button title="Share" onPress={() => captureAndShare()} />
      <TrayComponent />
    </>
  );
}
```

`bind` is a ref callback attachable to any `View` - visible or off-screen - and `captureAndShare()` captures whatever's currently bound.

## Development

This repo is an npm workspace: the library source lives in `src/`, and `example/` is a normal Expo app that consumes it via a local link, for developing and manually testing against real iOS/Android builds.

```sh
npm install                 # installs both the library's and example/'s dependencies
cd example
npm run ios                 # or npm run android
```

Edits to `src/` are picked up by the example app's Metro bundler directly (no build step needed) via the library's `"react-native"` package.json field.

```sh
npm test               # run the library's unit tests
npm run typecheck      # typecheck the library
npm run build           # produce the publishable lib/ output (CJS + ESM + types)
npm run verify-pack     # confirm `npm pack` would only publish src/ + lib/
```

## License

MIT — see [LICENSE](./LICENSE).
