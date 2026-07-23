import { useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Button, StyleSheet, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ShareTray } from './src/ShareTray';
import type { ShareTrayHandle, ShareTarget } from './src/ShareTray';

const shareTargets: ShareTarget[] = [
  { id: 'whatsapp', label: 'WhatsApp', social: 'whatsapp' },
  { id: 'twitter', label: 'Twitter', social: 'twitter' },
  { id: 'instagram', label: 'Instagram', social: 'instagram' },
];

export default function App() {
  const shareTrayRef = useRef<ShareTrayHandle>(null);

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <ShareTray
          ref={shareTrayRef}
          shareTargets={shareTargets}
          link="https://example.com/share/demo"
        >
          <View style={styles.container}>
            <Text>Open up App.tsx to start working on your app!</Text>
            <Button title="Capture & share" onPress={() => shareTrayRef.current?.captureAndShare()} />
            <StatusBar style="auto" />
          </View>
        </ShareTray>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
