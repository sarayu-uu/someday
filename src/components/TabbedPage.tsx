import { MaterialCommunityIcons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import { useEffect, type ReactNode } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { IndexTabs } from '@/components/IndexTabs';
import { Paper } from '@/components/Paper';
import { Title } from '@/components/ui';
import { useIdeas } from '@/lib/ideas-store';
import { colors, fonts } from '@/lib/theme';

// Space above the title that clears the phone's camera cutout; the Jar page and
// Memory Lane both use it so their titles sit at the same height.
export const TITLE_OFFSET = 85;

// Shared frame for the main screens: washi title, heart (Settings entry point,
// opens Settings), scrolling body and the right-edge index tabs.
export function TabbedPage({
  title,
  subtitle,
  tape,
  onScrollPast,
  backdrop,
  titleOffset = 0,
  stackTape = false,
  children,
}: {
  title: string;
  subtitle?: string;
  tape?: string;
  // Called when the reader scrolls well past the top content and lets go (Jar -> Your Lists).
  onScrollPast?: () => void;
  // Decorative art pinned behind the scrolling content (e.g. the jar on the bottom edge).
  backdrop?: ReactNode;
  // Extra space above the title, to push it down from the top edge.
  titleOffset?: number;
  // Add the two extra criss-crossing tapes behind the title.
  stackTape?: boolean;
  children: ReactNode;
}) {
  const { height, width } = useWindowDimensions();
  const { status, reload } = useIdeas();
  const router = useRouter();
  const pathname = usePathname();

  // Desktop jar page: no page scroll. The jar is oversized and cropped by the
  // window, and a mouse-wheel scroll down goes to Your Lists instead.
  const fixed = Platform.OS === 'web' && width >= 700 && !!onScrollPast;
  useEffect(() => {
    if (!fixed) return;
    let went = false;
    const onWheel = (e: WheelEvent) => {
      if (e.deltaY > 20 && !went) {
        went = true;
        onScrollPast?.();
      }
    };
    window.addEventListener('wheel', onWheel, { passive: true });
    return () => window.removeEventListener('wheel', onWheel);
  }, [fixed, onScrollPast]);

  return (
    <SafeAreaView style={[s.screen, fixed && { overflow: 'hidden' }]}>
      <Paper />
      {backdrop}
      <ScrollView
        scrollEnabled={!fixed}
        contentContainerStyle={[s.scroll, onScrollPast && { minHeight: fixed ? height : height + 120 }]}
        showsVerticalScrollIndicator={false}
        onScrollEndDrag={(e) => onScrollPast && e.nativeEvent.contentOffset.y > 60 && onScrollPast()}
        onMomentumScrollEnd={(e) => onScrollPast && e.nativeEvent.contentOffset.y > 60 && onScrollPast()}
        scrollEventThrottle={64}>
        <View style={[s.content, { paddingTop: 20 + titleOffset }]}>
          <Title subtitle={subtitle} tape={tape} stack={stackTape}>
            {title}
          </Title>
          {status === 'error' && (
            <Pressable accessibilityRole="button" onPress={reload} style={s.banner}>
              <Text style={s.bannerText}>Couldn’t reach the jar. Tap to retry.</Text>
            </Pressable>
          )}
          {children}
        </View>
      </ScrollView>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Settings"
        onPress={() => pathname !== '/settings' && router.push('/settings')}
        style={s.heart}>
        <MaterialCommunityIcons name="heart" size={24} color={colors.accent} />
      </Pressable>
      <IndexTabs />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paper },
  scroll: { paddingBottom: 140 },
  content: { width: '100%', maxWidth: 520, alignSelf: 'center', paddingHorizontal: 20, paddingTop: 20, gap: 16 },
  banner: { backgroundColor: '#F6D9D0', borderRadius: 10, padding: 10, marginRight: 24 },
  bannerText: { fontFamily: fonts.bodySemi, fontSize: 14, color: colors.error, textAlign: 'center' },
  heart: {
    position: 'absolute',
    top: 44,
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFCF3',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.line,
  },
});
