import { MaterialCommunityIcons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useIdeaSheet } from '@/components/IdeaSheet';
import { colors, fonts } from '@/lib/theme';

const TABS = [
  { label: 'Jar', icon: 'bottle-tonic-outline', path: '/home', match: ['/home', '/lists', '/category'] },
  { label: 'Add', icon: 'plus', path: null, match: [] },
  { label: 'Memories', icon: 'ticket-outline', path: '/memories', match: ['/memories'] },
] as const;

// Notebook-style tabs on the right edge: the primary nav. Only the active tab
// shows its label, so the idle ones barely cover the page.
export function IndexTabs() {
  const router = useRouter();
  const pathname = usePathname();
  const { openAdd } = useIdeaSheet();

  return (
    <View pointerEvents="box-none" style={s.wrap}>
      {TABS.map((t) => {
        const active = t.match.some((m) => pathname.startsWith(m));
        return (
          <Pressable
            key={t.label}
            accessibilityRole="tab"
            accessibilityLabel={t.label}
            accessibilityState={{ selected: active }}
            onPress={() => {
              // Add is a sheet, not a page; inside a category it preselects that pile.
              if (!t.path) return openAdd(pathname.match(/^\/category\/([^/]+)/)?.[1]);
              if (!active) router.replace(t.path);
            }}
            style={[s.tab, active ? s.tabActive : s.tabIdle]}>
            <MaterialCommunityIcons name={t.icon} size={22} color={active ? '#fff' : colors.ink} />
            {active && <Text style={s.label}>{t.label}</Text>}
          </Pressable>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { position: 'absolute', right: 0, bottom: 90, gap: 12, alignItems: 'flex-end' },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 46,
    paddingLeft: 12,
    paddingRight: 8,
    borderTopLeftRadius: 23,
    borderBottomLeftRadius: 23,
    borderWidth: 1.5,
    borderRightWidth: 0,
    borderColor: colors.line,
  },
  tabIdle: { backgroundColor: '#FFFCF3', width: 48 },
  tabActive: { backgroundColor: colors.accent, borderColor: colors.accent, paddingRight: 14 },
  label: { fontFamily: fonts.hand, fontSize: 22, color: '#fff' },
});
