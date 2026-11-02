import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Body, Button, Screen, Title } from '@/components/ui';
import { getRememberedProfileId, useSession, type Profile } from '@/lib/session';
import { supabase } from '@/lib/supabase';
import { colors, fonts } from '@/lib/theme';

type Load = { state: 'loading' } | { state: 'error' } | { state: 'ready'; profiles: Profile[] };

// Shown the first time on a device, or after "Switch" on the home screen
// (?switch=1). Otherwise the remembered profile skips straight to home.
export default function WhoIsOpening() {
  const router = useRouter();
  const { switch: switching } = useLocalSearchParams<{ switch?: string }>();
  const { chooseProfile } = useSession();
  const [load, setLoad] = useState<Load>({ state: 'loading' });

  const pick = useCallback(
    (profile: Profile) => {
      chooseProfile(profile);
      router.replace('/home');
    },
    [chooseProfile, router],
  );

  const fetchProfiles = useCallback(async () => {
    setLoad({ state: 'loading' });
    const { data, error } = await supabase
      .from('profiles')
      .select('profile_id, pair_id, display_label')
      .order('display_label');
    if (error || !data) return setLoad({ state: 'error' });

    const rememberedId = switching ? null : await getRememberedProfileId();
    const remembered = data.find((p) => p.profile_id === rememberedId);
    if (remembered) return pick(remembered);
    setLoad({ state: 'ready', profiles: data });
  }, [switching, pick]);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  return (
    <Screen>
      <Title subtitle="ideas for whenever we’re ready">Someday Jar</Title>
      <Text style={s.question}>Who’s opening the app?</Text>

      {load.state === 'loading' && <Body>Opening the jar…</Body>}

      {load.state === 'error' && (
        <>
          <Body error>Couldn’t reach the jar, try again.</Body>
          <Button label="Try again" onPress={fetchProfiles} />
        </>
      )}

      {load.state === 'ready' && load.profiles.length === 0 && (
        <Body error>No profiles found. Run supabase/seed.sql in the Supabase SQL editor.</Body>
      )}

      {load.state === 'ready' && (
        <View style={s.options}>
          {load.profiles.map((p, i) => (
            <Pressable
              key={p.profile_id}
              accessibilityRole="button"
              onPress={() => pick(p)}
              style={[s.card, { transform: [{ rotate: i % 2 === 0 ? '-1.5deg' : '1.5deg' }] }]}>
              <Text style={s.cardLabel}>{p.display_label}</Text>
            </Pressable>
          ))}
        </View>
      )}
    </Screen>
  );
}

const s = StyleSheet.create({
  question: { fontFamily: fonts.handSemi, fontSize: 32, color: colors.ink, textAlign: 'center', marginTop: 16 },
  options: { gap: 18, marginTop: 8 },
  card: {
    backgroundColor: '#FFFCF3',
    borderWidth: 1.5,
    borderColor: colors.line,
    borderRadius: 14,
    paddingVertical: 22,
    alignItems: 'center',
  },
  cardLabel: { fontFamily: fonts.hand, fontSize: 34, color: colors.ink },
});
