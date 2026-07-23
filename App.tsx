import { useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Button, StyleSheet, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ShareTray, useShareTray } from './src/ShareTray';
import type { ShareTrayHandle, ShareTarget } from './src/ShareTray';

const shareTargets: ShareTarget[] = [
  { id: 'whatsapp', label: 'WhatsApp', social: 'whatsapp' },
  { id: 'twitter', label: 'Twitter', social: 'twitter' },
  { id: 'instagram', label: 'Instagram', social: 'instagram' },
];

/**
 * Demonstrates the off-screen capture case useShareTray exists for: this card is never
 * visible to the user, only mounted so captureAndShare has something to screenshot.
 */
function OffScreenCardDemo() {
  const { captureAndShare, bind, TrayComponent } = useShareTray({
    shareTargets,
    link: 'https://example.com/share/offscreen-card',
  });

  return (
    <>
      <View style={styles.offscreenHost} pointerEvents="none">
        <View ref={bind} collapsable={false} style={styles.offscreenCard}>
          <Text style={styles.offscreenCardTitle}>Shareable Card</Text>
          <Text style={styles.offscreenCardBody}>Rendered off-screen, captured on demand.</Text>
        </View>
      </View>
      <Button title="Share off-screen card" onPress={() => captureAndShare()} />
      <TrayComponent />
    </>
  );
}

export default function App() {
  const shareTrayRef = useRef<ShareTrayHandle>(null);

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <ShareTray
          ref={shareTrayRef}
          shareTargets={shareTargets}
          link="https://example.com/share/demo"
        >
          <View style={styles.content}>
            <Text>Open up App.tsx to start working on your app!</Text>
            <Button title="Capture & share" onPress={() => shareTrayRef.current?.captureAndShare()} />
            {/* Demo of the off-screen use case useShareTray exists for. Its button text ends
                up inside ShareTray's own capture above too, since it's nested in `children` -
                a real app would place this wherever makes sense, this is just for the demo. */}
            <OffScreenCardDemo />
            <StatusBar style="auto" />
          </View>
        </ShareTray>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  // Deliberately no alignItems/justifyContent here - centering the demo content is the inner
  // `content` style's job. Centering the root shrinks ShareTray (and the sheet inside it) to
  // content width instead of the full device width, since neither stretches by default.
  root: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  offscreenHost: {
    position: 'absolute',
    left: -9999,
    top: 0,
  },
  offscreenCard: {
    width: 320,
    padding: 24,
    backgroundColor: '#1c1c1e',
    borderRadius: 16,
  },
  offscreenCardTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  offscreenCardBody: {
    color: '#c7c7cc',
    fontSize: 14,
  },
});
