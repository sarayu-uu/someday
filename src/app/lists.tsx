import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Redirect, useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { IdeaCarousel } from '@/components/IdeaCarousel';
import { TabbedPage } from '@/components/TabbedPage';
import { CATEGORIES } from '@/lib/categories';
import { useIdeas } from '@/lib/ideas-store';
import { useSession } from '@/lib/session';
import { colors, fonts } from '@/lib/theme';

export default function Lists() {
  const router = useRouter();
  const { profile } = useSession();
  const { ideas: all } = useIdeas();
  const ideas = all.filter((x) => x.status !== 'done'); // finished ideas live in Memory Lane
  if (!profile) return <Redirect href="/" />;

  return (
    <TabbedPage title="Your Lists" subtitle="pick a pile to dig through.">
      <IdeaCarousel ideas={ideas} />
      <View style={s.grid}>
        {CATEGORIES.map((c, i) => {
          const mine = ideas.filter((x) => x.category === c.key);
          const n = { ideas: mine.length, top10: mine.filter((x) => x.status === 'top10').length };
          return (
            <Pressable
              key={c.key}
              accessibilityRole="button"
              onPress={() => router.push({ pathname: '/category/[key]', params: { key: c.key } })}
              style={({ pressed }) => [
                s.card,
                { transform: [{ rotate: `${i % 2 === 0 ? -0.8 : 0.8}deg` }, { scale: pressed ? 0.97 : 1 }] },
              ]}>
              <View style={[s.icon, { backgroundColor: c.color }]}>
                <MaterialCommunityIcons name={c.icon} size={28} color="#fff" />
              </View>
              <Text style={s.label} numberOfLines={2}>
                {c.label}
              </Text>
              <Text style={s.count}>
                {n.ideas} ideas · {n.top10} in your Top 10
              </Text>
            </Pressable>
          );
        })}
      </View>
    </TabbedPage>
  );
}

const s = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, paddingRight: 24 },
  card: {
    flexBasis: '47%',
    flexGrow: 1,
    gap: 6,
    padding: 12,
    backgroundColor: '#FFFCF3',
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 14,
  },
  icon: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  label: { fontFamily: fonts.hand, fontSize: 22, lineHeight: 24, color: colors.ink, minHeight: 48 },
  count: { fontFamily: fonts.bodySemi, fontSize: 12, color: colors.inkSoft },
});
