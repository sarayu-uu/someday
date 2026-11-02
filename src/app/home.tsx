import { Redirect, useRouter } from 'expo-router';

import { Body, Button, Screen, Title } from '@/components/ui';
import { useSession } from '@/lib/session';

// Placeholder home until the jar is built (step 8).
export default function Home() {
  const router = useRouter();
  const { profile, forgetProfile } = useSession();

  // No acting profile (e.g. a direct visit or reload): back to the picker.
  if (!profile) return <Redirect href="/" />;

  const switchPerson = () => {
    forgetProfile();
    router.replace({ pathname: '/', params: { switch: '1' } });
  };

  return (
    <Screen>
      <Title subtitle={`signed in as ${profile.display_label}`}>Someday Jar</Title>
      <Body>The jar comes later.</Body>
      <Button secondary label={`Not ${profile.display_label}? Switch`} onPress={switchPerson} />
    </Screen>
  );
}
