import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

import { categoryByKey } from '@/lib/categories';
import type { Idea } from '@/lib/ideas-store';
import { colors, fonts } from '@/lib/theme';

const INTERVAL_MS = 4500;

// Ambient "oh yeah, remember this?" card: one idea at a time on a little stack
// of papers, changing every few seconds. Order is shuffled once per mount.
export function IdeaCarousel({ ideas }: { ideas: Idea[] }) {
  const [order] = useState(() => [...ideas].sort(() => Math.random() - 0.5));
  const [i, setI] = useState(0);

  useEffect(() => {
    if (order.length < 2) return;
    const t = setInterval(() => setI((n) => (n + 1) % order.length), INTERVAL_MS);
    return () => clearInterval(t);
  }, [order.length]);

  const fade = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    fade.setValue(0);
    Animated.timing(fade, { toValue: 1, duration: 450, useNativeDriver: true }).start();
  }, [i, fade]);

  const idea = order[i];
  const cat = idea && categoryByKey(idea.category);
  if (!idea || !cat) return null;

  return (
    <View style={s.wrap}>
      <View style={[s.paper, { transform: [{ rotate: '3deg' }, { translateY: 6 }] }]} />
      <View style={[s.paper, { transform: [{ rotate: '-2.5deg' }, { translateY: 3 }] }]} />
      <Animated.View style={[s.card, { opacity: fade }]}>
        <View style={[s.icon, { backgroundColor: cat.color }]}>
          <MaterialCommunityIcons name={cat.icon} size={34} color="#fff" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[s.cat, { color: cat.color }]}>{cat.label}</Text>
          <Text style={s.title} numberOfLines={2}>
            {idea.title}
          </Text>
          <Text style={s.meta}>added by {idea.byMe ? 'you' : 'them'} · remember this?</Text>
        </View>
      </Animated.View>
      <View style={s.dots}>
        {order.map((o, n) => (
          <View key={o.id} style={[s.dot, n === i && s.dotActive]} />
        ))}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { marginVertical: 8 },
  paper: {
    position: 'absolute',
    top: 0,
    left: 6,
    right: 6,
    height: 96,
    backgroundColor: '#EFE7D3',
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 6,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    height: 96,
    padding: 12,
    backgroundColor: '#FFFCF3',
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 6,
    transform: [{ rotate: '-1deg' }],
  },
  icon: { width: 60, height: 60, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  cat: { fontFamily: fonts.handSemi, fontSize: 20, lineHeight: 22 },
  title: { fontFamily: fonts.hand, fontSize: 22, lineHeight: 24, color: colors.ink },
  meta: { fontFamily: fonts.bodySemi, fontSize: 12, color: colors.inkSoft },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginTop: 14 },
  dot: { width: 14, height: 8, borderRadius: 4, backgroundColor: 'rgba(58,42,31,0.18)' },
  dotActive: { width: 30, backgroundColor: colors.accent },
});
