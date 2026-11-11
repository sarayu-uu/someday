import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Sheet } from '@/components/Sheet';
import { Button } from '@/components/ui';
import type { DoneFeedback, Idea } from '@/lib/ideas-store';
import { categoryByKey } from '@/lib/categories';
import { colors, fonts, paperShadow } from '@/lib/theme';

export const STAR = '#E8A92E';

export function Stars({ value, size = 18, onChange }: { value: number; size?: number; onChange?: (n: number) => void }) {
  return (
    <View style={{ flexDirection: 'row', gap: 4 }}>
      {[1, 2, 3, 4, 5].map((n) => {
        const icon = <MaterialCommunityIcons name={n <= value ? 'star' : 'star-outline'} size={size} color={STAR} />;
        return onChange ? (
          <Pressable key={n} accessibilityRole="button" accessibilityLabel={`${n} star${n > 1 ? 's' : ''}`} onPress={() => onChange(n)} hitSlop={4}>
            {icon}
          </Pressable>
        ) : (
          <View key={n}>{icon}</View>
        );
      })}
    </View>
  );
}

// Feedback popup that closes the loop on a Top 10 idea: photo, 1-5 stars, "again?".
export function DoneSheet({
  idea,
  onClose,
  onSubmit,
}: {
  idea: Idea | null;
  onClose: () => void;
  onSubmit: (id: string, feedback: DoneFeedback) => void;
}) {
  const [rating, setRating] = useState(0);
  const [again, setAgain] = useState<boolean | null>(null);
  const [photoUri, setPhotoUri] = useState<string | undefined>();

  useEffect(() => {
    setRating(0);
    setAgain(null);
    setPhotoUri(undefined);
  }, [idea?.id]);

  const pick = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.7 });
    if (!res.canceled) setPhotoUri(res.assets[0].uri);
  };

  const ready = rating > 0 && again !== null;

  return (
    <Sheet visible={!!idea} title="We did it!" tint={categoryByKey(idea?.category ?? '')?.color} onClose={onClose}>
      <Text style={s.idea} numberOfLines={2}>
        {idea?.title}
      </Text>

      <Pressable accessibilityRole="button" accessibilityLabel="Add a photo" onPress={pick} style={s.polaroid}>
        <View style={s.photo}>
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={StyleSheet.absoluteFill} contentFit="cover" />
          ) : (
            <>
              <MaterialCommunityIcons name="camera-plus-outline" size={30} color={colors.inkSoft} />
              <Text style={s.photoHint}>Add a photo</Text>
            </>
          )}
        </View>
      </Pressable>

      <Text style={s.label}>How was it?</Text>
      <Stars value={rating} size={36} onChange={setRating} />

      <Text style={s.label}>Want to do this again?</Text>
      <View style={s.row}>
        {([true, false] as const).map((v) => (
          <Pressable
            key={String(v)}
            accessibilityRole="button"
            accessibilityState={{ selected: again === v }}
            onPress={() => setAgain(v)}
            style={[s.choice, again === v && s.choiceOn]}>
            <Text style={[s.choiceText, again === v && { color: '#fff' }]}>{v ? 'Yes!' : 'Once was enough'}</Text>
          </Pressable>
        ))}
      </View>

      <Button
        label={ready ? 'File it in Memory Lane' : 'Rate it and pick yes or no'}
        onPress={() => {
          if (!idea || !ready) return;
          onSubmit(idea.id, { rating, wouldRepeat: again!, photoUri });
          onClose();
        }}
      />
    </Sheet>
  );
}

const s = StyleSheet.create({
  idea: { fontFamily: fonts.handSemi, fontSize: 24, color: colors.ink, textAlign: 'center' },
  polaroid: {
    alignSelf: 'center',
    backgroundColor: '#fff',
    padding: 8,
    paddingBottom: 26,
    borderWidth: 1,
    borderColor: colors.line,
    transform: [{ rotate: '-2deg' }],
    ...paperShadow,
  },
  photo: {
    width: 130,
    height: 130,
    borderWidth: 1.5,
    borderColor: colors.line,
    borderStyle: 'dashed',
    backgroundColor: '#FFFCF3',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  photoHint: { fontFamily: fonts.bodySemi, fontSize: 13, color: colors.inkSoft },
  label: { fontFamily: fonts.bodySemi, fontSize: 14, color: colors.inkSoft, textAlign: 'center' },
  row: { flexDirection: 'row', gap: 10, justifyContent: 'center' },
  choice: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: colors.line,
    backgroundColor: '#FFFCF3',
  },
  choiceOn: { backgroundColor: colors.accent, borderColor: colors.accent },
  choiceText: { fontFamily: fonts.bodyBold, fontSize: 14, color: colors.ink },
});
