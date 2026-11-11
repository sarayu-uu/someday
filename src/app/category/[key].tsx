import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { IndexTabs } from '@/components/IndexTabs';
import { Paper } from '@/components/Paper';
import { DoneSheet } from '@/components/DoneSheet';
import { useIdeaSheet } from '@/components/IdeaSheet';
import { Sheet } from '@/components/Sheet';
import { Body, Button, Title } from '@/components/ui';
import { categoryByKey } from '@/lib/categories';
import { TOP_CAP, useIdeas, type Idea } from '@/lib/ideas-store';
import { useSession } from '@/lib/session';
import { colors, fonts, paperShadow } from '@/lib/theme';

type Tab = 'top' | 'all';

export default function CategoryDetail() {
  const router = useRouter();
  const { key } = useLocalSearchParams<{ key: string }>();
  const { profile } = useSession();
  const { top10, inbox, promote, demote, move, remove, markDone } = useIdeas();
  const { openEdit } = useIdeaSheet();
  const [tab, setTab] = useState<Tab>('top');
  const [swapFor, setSwapFor] = useState<Idea | null>(null); // idea waiting for a Top 10 slot
  const [deleting, setDeleting] = useState<Idea | null>(null);
  const [finishing, setFinishing] = useState<Idea | null>(null);
  const [menuFor, setMenuFor] = useState<Idea | null>(null);

  const cat = categoryByKey(key);
  if (!profile) return <Redirect href="/" />;
  if (!cat) return <Redirect href="/lists" />;

  const top = top10(cat.key);
  const all = inbox(cat.key);

  const onPromote = (idea: Idea) => (top.length >= TOP_CAP ? setSwapFor(idea) : promote(idea.id));

  return (
    <SafeAreaView style={s.screen}>
      <Paper />
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={s.content}>
          <Pressable accessibilityRole="button" accessibilityLabel="Back to lists" onPress={() => router.back()} style={s.back}>
            <MaterialCommunityIcons name="chevron-left" size={28} color={colors.ink} />
            <Text style={s.backText}>Lists</Text>
          </Pressable>

          <Title tape={cat.color} subtitle={`${top.length + all.length} ideas`}>
            {cat.label}
          </Title>

          <View style={s.tabs}>
            <TabButton active={tab === 'top'} color={cat.color} onPress={() => setTab('top')} label={`Top 10 · ${top.length}/${TOP_CAP}`} />
            <TabButton active={tab === 'all'} color={cat.color} onPress={() => setTab('all')} label={`All ideas · ${all.length}`} />
          </View>

          {tab === 'top' ? (
            top.length === 0 ? (
              <Body>Nothing in your Top 10 yet. Promote something from All ideas when you’re ready to plan.</Body>
            ) : (
              top.map((idea, i) => (
                <Row key={idea.id} idea={idea} accent={cat.color} icon={cat.icon} index={i} lead={String(i + 1)}>
                  <IconBtn icon="check-circle-outline" label="Mark as done" onPress={() => setFinishing(idea)} />
                  <IconBtn icon="chevron-up" label="Move up" disabled={i === 0} onPress={() => move(idea.id, -1)} />
                  <IconBtn icon="chevron-down" label="Move down" disabled={i === top.length - 1} onPress={() => move(idea.id, 1)} />
                  <IconBtn icon="dots-horizontal" label="More" onPress={() => setMenuFor(idea)} />
                </Row>
              ))
            )
          ) : all.length === 0 ? (
            <Body>Inbox zero. New ideas land here first.</Body>
          ) : (
            all.map((idea, i) => (
              <Row key={idea.id} idea={idea} accent={cat.color} icon={cat.icon} index={i}>
                <IconBtn icon="star-plus-outline" label="Promote to Top 10" onPress={() => onPromote(idea)} />
                <IconBtn icon="pencil-outline" label="Edit" onPress={() => openEdit(idea)} />
                <IconBtn icon="trash-can-outline" label="Delete" onPress={() => setDeleting(idea)} />
              </Row>
            ))
          )}
        </View>
      </ScrollView>

      <IndexTabs />

      <Sheet visible={!!menuFor} title={menuFor?.title ?? ''} onClose={() => setMenuFor(null)}>
        <Button
          secondary
          label="Edit"
          onPress={() => {
            if (menuFor) openEdit(menuFor);
            setMenuFor(null);
          }}
        />
        <Button
          secondary
          label="Back to All ideas"
          onPress={() => {
            if (menuFor) demote(menuFor.id);
            setMenuFor(null);
          }}
        />
        <Button
          secondary
          label="Delete"
          onPress={() => {
            setDeleting(menuFor);
            setMenuFor(null);
          }}
        />
      </Sheet>

      <DoneSheet idea={finishing} onClose={() => setFinishing(null)} onSubmit={markDone} />

      <Sheet visible={!!swapFor} title="Top 10 is full" onClose={() => setSwapFor(null)}>
        <Body>Pick one to send back to All ideas to make room for “{swapFor?.title}”.</Body>
        {top.map((idea, i) => (
          <Pressable
            key={idea.id}
            accessibilityRole="button"
            onPress={() => {
              if (swapFor) promote(swapFor.id, idea.id);
              setSwapFor(null);
            }}
            style={s.swapRow}>
            <Text style={s.swapRank}>{i + 1}</Text>
            <Text style={[s.rowTitle, { flex: 1 }]} numberOfLines={1}>
              {idea.title}
            </Text>
            <Text style={s.swapHint}>drop</Text>
          </Pressable>
        ))}
        <Button secondary label="Never mind" onPress={() => setSwapFor(null)} />
      </Sheet>

      <Sheet visible={!!deleting} title="Delete this idea?" onClose={() => setDeleting(null)}>
        <Body>“{deleting?.title}” will be gone for good. There’s no undo.</Body>
        <Button
          label="Delete"
          onPress={() => {
            if (deleting) remove(deleting.id);
            setDeleting(null);
          }}
        />
        <Button secondary label="Keep it" onPress={() => setDeleting(null)} />
      </Sheet>
    </SafeAreaView>
  );
}

function TabButton({ active, color, label, onPress }: { active: boolean; color: string; label: string; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={[s.tab, active && { backgroundColor: color, borderColor: color }]}>
      <Text style={[s.tabText, active && { color: '#fff' }]}>{label}</Text>
    </Pressable>
  );
}

function Row({
  idea,
  accent,
  icon,
  index,
  lead,
  children,
}: {
  idea: Idea;
  accent: string;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  index: number;
  lead?: string;
  children: React.ReactNode;
}) {
  return (
    <View style={[s.row, { transform: [{ rotate: `${index % 2 === 0 ? -0.6 : 0.6}deg` }] }]}>
      <View style={[s.iconTile, { backgroundColor: accent }]}>
        <MaterialCommunityIcons name={icon} size={22} color="#fff" />
        {lead ? <Text style={s.rank}>{lead}</Text> : null}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.rowTitle}>{idea.title}</Text>
        {idea.note ? <Text style={s.note}>{idea.note}</Text> : null}
        <Text style={s.meta}>added by {idea.byMe ? 'you' : 'them'}</Text>
      </View>
      <View style={s.actions}>{children}</View>
    </View>
  );
}

function IconBtn({
  icon,
  label,
  onPress,
  disabled,
}: {
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} disabled={disabled} onPress={onPress} hitSlop={6} style={{ opacity: disabled ? 0.25 : 1 }}>
      <MaterialCommunityIcons name={icon} size={24} color={colors.inkSoft} />
    </Pressable>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paper },
  scroll: { paddingBottom: 140 },
  content: { width: '100%', maxWidth: 520, alignSelf: 'center', paddingHorizontal: 20, paddingTop: 8, gap: 12 },
  back: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start' },
  backText: { fontFamily: fonts.bodySemi, fontSize: 16, color: colors.ink },
  tabs: { flexDirection: 'row', gap: 8, paddingRight: 24 },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: colors.line,
    backgroundColor: '#FFFCF3',
  },
  tabText: { fontFamily: fonts.bodyBold, fontSize: 14, color: colors.ink },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    marginRight: 24,
    backgroundColor: '#FFFCF3',
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 14,
    ...paperShadow,
  },
  iconTile: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  rank: { fontFamily: fonts.hand, fontSize: 18, lineHeight: 18, color: '#fff' },
  rowTitle: { fontFamily: fonts.hand, fontSize: 22, lineHeight: 24, color: colors.ink },
  note: { fontFamily: fonts.body, fontSize: 13, color: colors.ink },
  meta: { fontFamily: fonts.bodySemi, fontSize: 12, color: colors.inkSoft },
  actions: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  swapRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    backgroundColor: '#FFFCF3',
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 10,
  },
  swapRank: { fontFamily: fonts.hand, fontSize: 28, color: colors.accent, width: 28, textAlign: 'center' },
  swapHint: { fontFamily: fonts.bodyBold, fontSize: 13, color: colors.accent },
});
