import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Stars } from '@/components/DoneSheet';
import { categoryByKey } from '@/lib/categories';
import type { Idea } from '@/lib/ideas-store';
import { colors, fonts } from '@/lib/theme';

const HOLE = 16;

// A completed idea as a torn ticket stub: polaroid on the left, dashed
// perforation with punched holes, details on the right.
export function Ticket({ idea, index, onUndo }: { idea: Idea; index: number; onUndo: () => void }) {
  const cat = categoryByKey(idea.category);
  const date = idea.doneAt
    ? new Date(idea.doneAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })
    : '';

  return (
    <View style={[s.ticket, { transform: [{ rotate: `${index % 2 === 0 ? -0.8 : 0.8}deg` }] }]}>
      <View style={s.stub}>
        <View style={[s.polaroid, { transform: [{ rotate: index % 2 === 0 ? '-3deg' : '3deg' }] }]}>
          {idea.photoUri ? (
            <Image source={{ uri: idea.photoUri }} style={s.photo} contentFit="cover" />
          ) : (
            <View style={[s.photo, { backgroundColor: cat?.color, alignItems: 'center', justifyContent: 'center' }]}>
              {cat ? <MaterialCommunityIcons name={cat.icon} size={30} color="rgba(255,255,255,0.85)" /> : null}
            </View>
          )}
        </View>
      </View>

      <View style={s.perf}>
        <View style={[s.hole, { top: -HOLE / 2 }]} />
        <View style={[s.hole, { bottom: -HOLE / 2 }]} />
      </View>

      <View style={s.body}>
        <View style={s.topRow}>
          {cat ? (
            <View style={[s.pill, { backgroundColor: cat.color }]}>
              <Text style={s.pillText}>{cat.label}</Text>
            </View>
          ) : null}
          {idea.wouldRepeat ? (
            <MaterialCommunityIcons name="repeat" size={20} color={colors.inkSoft} accessibilityLabel="Would do again" />
          ) : null}
        </View>
        <Text style={s.title} numberOfLines={2}>
          {idea.title}
        </Text>
        <Text style={s.date}>Done · {date}</Text>
        <View style={s.bottomRow}>
          <Stars value={idea.rating ?? 0} />
          <Pressable accessibilityRole="button" accessibilityLabel="Unmark as done" onPress={onUndo} hitSlop={8}>
            <MaterialCommunityIcons name="undo-variant" size={20} color={colors.inkSoft} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  ticket: {
    flexDirection: 'row',
    backgroundColor: '#FFF8E6',
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 10,
    marginRight: 24,
    minHeight: 124,
  },
  stub: { width: 112, alignItems: 'center', justifyContent: 'center', padding: 8 },
  polaroid: { backgroundColor: '#fff', padding: 5, paddingBottom: 14, borderWidth: 1, borderColor: colors.line },
  photo: { width: 80, height: 80 },
  perf: { width: 0, borderLeftWidth: 2, borderStyle: 'dashed', borderColor: colors.line, marginVertical: 6 },
  hole: { position: 'absolute', left: -HOLE / 2 - 1, width: HOLE, height: HOLE, borderRadius: HOLE / 2, backgroundColor: colors.paper },
  body: { flex: 1, padding: 12, gap: 2, justifyContent: 'center' },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pill: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 2, borderRadius: 12 },
  pillText: { fontFamily: fonts.bodyBold, fontSize: 12, color: '#fff' },
  title: { fontFamily: fonts.hand, fontSize: 22, lineHeight: 24, color: colors.ink },
  date: { fontFamily: fonts.bodySemi, fontSize: 12, color: colors.inkSoft },
  bottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 },
});
