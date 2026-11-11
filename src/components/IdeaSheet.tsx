import { MaterialCommunityIcons } from '@expo/vector-icons';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Sheet } from '@/components/Sheet';
import { Button, Field } from '@/components/ui';
import { CATEGORIES } from '@/lib/categories';
import { useIdeas, type Idea } from '@/lib/ideas-store';
import { colors, fonts } from '@/lib/theme';

type Open = { mode: 'add'; category?: string } | { mode: 'edit'; idea: Idea };

const Ctx = createContext<{ openAdd: (category?: string) => void; openEdit: (idea: Idea) => void } | null>(null);

export const useIdeaSheet = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error('useIdeaSheet must be used inside IdeaSheetProvider');
  return v;
};

const URL_RE = /^https?:\/\/\S+$/i;

// One sheet for both adding and editing, mounted once at the root so the
// Add tab can open it from any screen.
export function IdeaSheetProvider({ children }: { children: ReactNode }) {
  const { add, update } = useIdeas();
  const [open, setOpen] = useState<Open | null>(null);
  const [category, setCategory] = useState<string>(CATEGORIES[0].key);
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [sourceUrl, setSourceUrl] = useState<string | undefined>();
  const [showErr, setShowErr] = useState(false);

  useEffect(() => {
    if (!open) return;
    const editing = open.mode === 'edit' ? open.idea : null;
    setCategory(editing?.category ?? (open.mode === 'add' ? open.category : undefined) ?? CATEGORIES[0].key);
    setTitle(editing?.title ?? '');
    setNote(editing?.note ?? '');
    setSourceUrl(editing?.sourceUrl);
    setShowErr(false);
  }, [open]);

  const openAdd = useCallback((c?: string) => setOpen({ mode: 'add', category: c }), []);
  const openEdit = useCallback((idea: Idea) => setOpen({ mode: 'edit', idea }), []);
  const value = useMemo(() => ({ openAdd, openEdit }), [openAdd, openEdit]);

  // Smart-paste (basic): a pasted link goes to source_url and the title is left
  // for you to name. Fetching the page title/image needs the Edge Function.
  const onTitle = (t: string) => {
    const trimmed = t.trim();
    if (URL_RE.test(trimmed)) {
      setSourceUrl(trimmed);
      setTitle('');
    } else setTitle(t);
  };

  const save = () => {
    const clean = title.trim();
    if (!clean) return setShowErr(true);
    const n = note.trim() || undefined;
    if (open?.mode === 'edit') update(open.idea.id, { category, title: clean, note: n });
    else add({ category, title: clean, note: n, sourceUrl });
    setOpen(null);
  };

  return (
    <Ctx.Provider value={value}>
      {children}
      <Sheet
        visible={!!open}
        title={open?.mode === 'edit' ? 'Edit idea' : 'Add an idea'}
        tint={CATEGORIES.find((c) => c.key === category)?.color}
        onClose={() => setOpen(null)}>
        <Field
          label="What’s the idea?"
          value={title}
          onChangeText={onTitle}
          placeholder="Paste a link or write it out"
          autoFocus
        />
        {sourceUrl ? (
          <Text style={s.link} numberOfLines={1}>
            🔗 {sourceUrl}
          </Text>
        ) : null}
        {showErr && !title.trim() ? <Text style={s.err}>Give it a name first.</Text> : null}
        <Field label="A note (optional)" value={note} onChangeText={setNote} placeholder="Why, where, with whom…" multiline />

        <Text style={s.label}>Which pile?</Text>
        <View style={s.chips}>
          {CATEGORIES.map((c, i) => {
            const on = c.key === category;
            return (
              <Pressable
                key={c.key}
                accessibilityRole="button"
                accessibilityState={{ selected: on }}
                onPress={() => setCategory(c.key)}
                style={[
                  s.chip,
                  { transform: [{ rotate: `${i % 2 === 0 ? -1 : 1}deg` }] },
                  on && { backgroundColor: c.color, borderColor: c.color },
                ]}>
                <MaterialCommunityIcons name={c.icon} size={15} color={on ? '#fff' : c.color} />
                <Text style={[s.chipText, on && { color: '#fff' }]}>{c.label}</Text>
              </Pressable>
            );
          })}
        </View>

        <Button label={open?.mode === 'edit' ? 'Save changes' : 'Drop it in the jar'} onPress={save} />
      </Sheet>
    </Ctx.Provider>
  );
}

const s = StyleSheet.create({
  label: { fontFamily: fonts.bodySemi, fontSize: 14, color: colors.inkSoft },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.line,
    backgroundColor: '#FFFCF3',
  },
  chipText: { fontFamily: fonts.bodySemi, fontSize: 13, color: colors.ink },
  link: { fontFamily: fonts.body, fontSize: 12, color: colors.inkSoft },
  err: { fontFamily: fonts.bodySemi, fontSize: 13, color: colors.error },
});
