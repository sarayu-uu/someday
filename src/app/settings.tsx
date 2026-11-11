import { Redirect, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { TabbedPage, TITLE_OFFSET } from '@/components/TabbedPage';
import { Button } from '@/components/ui';
import { useSession, type Profile } from '@/lib/session';
import { supabase } from '@/lib/supabase';
import { colors, fonts, paperShadow } from '@/lib/theme';

export default function Settings() {
  const router = useRouter();
  const { profile, forgetProfile } = useSession();
  const [profiles, setProfiles] = useState<Pick<Profile, 'profile_id' | 'display_label'>[]>([]);

  useEffect(() => {
    supabase
      .from('profiles')
      .select('profile_id, display_label')
      .order('display_label')
      .then(({ data }) => data && setProfiles(data));
  }, []);

  if (!profile) return <Redirect href="/" />;

  const switchPerson = () => {
    forgetProfile();
    router.replace({ pathname: '/', params: { switch: '1' } });
  };

  return (
    <TabbedPage title="Settings" subtitle="the small print, kept cozy." tape="#D4608A" titleOffset={TITLE_OFFSET} stackTape>
      <Section label="The two of us">
        {profiles.map((p) => (
          <View key={p.profile_id} style={s.person}>
            <Text style={s.personName}>{p.display_label}</Text>
            {p.profile_id === profile.profile_id ? <Text style={s.you}>you, on this device</Text> : null}
          </View>
        ))}
        <Button secondary label={`Not ${profile.display_label}? Switch`} onPress={switchPerson} />
      </Section>
    </TabbedPage>
  );
}

const SECTION_TILT = ['-0.6deg', '0.6deg', '-0.4deg'];

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  // Tilt by label length so each card keeps its lean across renders.
  return (
    <View style={[s.section, { transform: [{ rotate: SECTION_TILT[label.length % SECTION_TILT.length] }] }]}>
      <Text style={s.sectionLabel}>{label}</Text>
      {children}
    </View>
  );
}

const s = StyleSheet.create({
  section: {
    gap: 10,
    padding: 14,
    marginRight: 24,
    backgroundColor: '#FFFCF3',
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 14,
    ...paperShadow,
  },
  sectionLabel: {
    fontFamily: fonts.hand,
    fontSize: 28,
    color: colors.ink,
    alignSelf: 'flex-start',
    borderBottomWidth: 3,
    borderBottomColor: colors.washi,
  },
  person: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  personName: { fontFamily: fonts.hand, fontSize: 28, color: colors.ink },
  you: { fontFamily: fonts.bodySemi, fontSize: 13, color: colors.accent },
});
