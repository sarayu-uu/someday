import { Redirect, useRouter } from 'expo-router';
import { Platform, StyleSheet, useWindowDimensions, View } from 'react-native';

import { Jar, JAR_ASPECT, JAR_MAX_SCREEN_FRACTION } from '@/components/Jar';
import { TabbedPage, TITLE_OFFSET } from '@/components/TabbedPage';
import { useSession } from '@/lib/session';

export default function Home() {
  const router = useRouter();
  const { profile } = useSession();
  const { height, width } = useWindowDimensions();

  const desktop = Platform.OS === 'web' && width >= 700;
  // Desktop: a huge jar in the page flow, cropped by the bottom of the window so
  // about the top half shows (JAR_VISIBLE): lid, neck and the upper notes. Its
  // top edge sits ~180px down, under the title.
  const JAR_VISIBLE = 0.5;
  const maxJar = width * JAR_MAX_SCREEN_FRACTION; // keeps the tag on screen with the body centered
  const desktopJarWidth = Math.min(maxJar, ((height - 180) / JAR_VISIBLE) * JAR_ASPECT);
  // Phone: the jar stands on the bottom edge and is tall enough to cover
  // PHONE_JAR_HEIGHT of the screen. It is wider than a phone screen at that
  // height, so the sides (and some of the tag) are cropped by the screen edges.
  const PHONE_JAR_HEIGHT = 0.75;
  const JAR_SINK = 0.07; // fraction of the jar's own height pushed below the screen bottom
  const phoneJarWidth = height * PHONE_JAR_HEIGHT * JAR_ASPECT;

  // No acting profile (e.g. a direct visit or reload): back to the picker.
  // (Switching person lives in Settings, behind the heart icon.)
  if (!profile) return <Redirect href="/" />;

  return (
    <TabbedPage
      title="Someday Jar"
      subtitle="ideas for whenever we’re ready"
      onScrollPast={() => router.push('/lists')}
      titleOffset={TITLE_OFFSET}
      stackTape
      backdrop={
        desktop ? undefined : (
          // Sunk below the bottom edge so the base of the jar is cropped a little.
          <View pointerEvents="none" style={[s.bottomJar, { bottom: -JAR_SINK * (phoneJarWidth / JAR_ASPECT) }]}>
            <Jar maxWidth={phoneJarWidth} oversize />
          </View>
        )
      }>
      {desktop && <Jar maxWidth={desktopJarWidth} oversize />}
    </TabbedPage>
  );
}

const s = StyleSheet.create({
  bottomJar: { position: 'absolute', left: 0, right: 0, alignItems: 'center', overflow: 'hidden' },
});
