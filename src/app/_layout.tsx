import { Caveat_600SemiBold, Caveat_700Bold } from '@expo-google-fonts/caveat';
import { Quicksand_500Medium, Quicksand_600SemiBold, Quicksand_700Bold } from '@expo-google-fonts/quicksand';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { Platform } from 'react-native';

import { DeviceShell } from '@/components/DeviceShell';
import { Body, Button, Screen, Title } from '@/components/ui';
import { IdeaSheetProvider } from '@/components/IdeaSheet';
import { IdeasProvider } from '@/lib/ideas-store';
import { SessionProvider, useSession } from '@/lib/session';
import { colors } from '@/lib/theme';

SplashScreen.preventAutoHideAsync();

function Routes() {
  const { authStatus, retryAuth } = useSession();
  const [fontsLoaded] = useFonts({
    Caveat_600SemiBold,
    Caveat_700Bold,
    Quicksand_500Medium,
    Quicksand_600SemiBold,
    Quicksand_700Bold,
  });
  const ready = fontsLoaded && authStatus !== 'loading';

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  if (authStatus === 'error') {
    return (
      <Screen>
        <Title>Someday Jar</Title>
        <Body error>Couldn’t reach the jar, try again.</Body>
        <Button label="Try again" onPress={retryAuth} />
      </Screen>
    );
  }

  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.paper } }} />;
}

// On web, make the UI feel like a native app: no text selection, image
// dragging or tap highlight, except inside text fields.
function useAppLikeWeb() {
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;
    const style = document.createElement('style');
    style.setAttribute('data-app-like', '');
    style.textContent = `
      html, body, #root {
        -webkit-user-select: none;
        user-select: none;
        -webkit-touch-callout: none;
        -webkit-tap-highlight-color: transparent;
      }
      input, textarea, [contenteditable="true"] {
        -webkit-user-select: text;
        user-select: text;
      }
      img { -webkit-user-drag: none; user-drag: none; }
    `;
    document.head.appendChild(style);
    return () => {
      style.remove();
    };
  }, []);
}

export default function RootLayout() {
  useAppLikeWeb();
  return (
    <DeviceShell>
      <SessionProvider>
        <IdeasProvider>
          <IdeaSheetProvider>
            <Routes />
          </IdeaSheetProvider>
        </IdeasProvider>
      </SessionProvider>
    </DeviceShell>
  );
}
