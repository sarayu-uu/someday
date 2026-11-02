import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, fonts } from '@/lib/theme';

export function Screen({ children }: { children: ReactNode }) {
  return (
    <SafeAreaView style={s.screen}>
      <View style={s.content}>{children}</View>
    </SafeAreaView>
  );
}

// Washi-tape title strip. Flat tint for now; candy stripes come with the real UI pass.
export function Title({ children, subtitle }: { children: string; subtitle?: string }) {
  return (
    <View style={s.titleWrap}>
      <View style={s.washi}>
        <Text style={s.title}>{children}</Text>
      </View>
      {subtitle ? <Text style={s.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

export function Button({
  label,
  onPress,
  busy,
  secondary,
}: {
  label: string;
  onPress: () => void;
  busy?: boolean;
  secondary?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={busy}
      style={[s.button, secondary && s.buttonSecondary, busy && { opacity: 0.6 }]}>
      <Text style={[s.buttonText, secondary && { color: colors.accent }]}>{busy ? '…' : label}</Text>
    </Pressable>
  );
}

export function Field(props: TextInputProps & { label: string }) {
  const { label, ...rest } = props;
  return (
    <View style={{ gap: 4 }}>
      <Text style={s.label}>{label}</Text>
      <TextInput placeholderTextColor={colors.inkSoft} style={s.input} {...rest} />
    </View>
  );
}

export const Body = ({ children, error }: { children: ReactNode; error?: boolean }) => (
  <Text style={[s.body, error && { color: colors.error }]}>{children}</Text>
);

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paper },
  content: { flex: 1, width: '100%', maxWidth: 480, alignSelf: 'center', padding: 24, gap: 16 },
  titleWrap: { alignItems: 'center', marginBottom: 8, gap: 6 },
  washi: {
    backgroundColor: colors.washi,
    opacity: 0.9,
    paddingHorizontal: 28,
    paddingVertical: 4,
    transform: [{ rotate: '-2deg' }],
  },
  title: { fontFamily: fonts.hand, fontSize: 44, color: colors.ink },
  subtitle: { fontFamily: fonts.bodySemi, fontSize: 16, color: colors.inkSoft, textAlign: 'center' },
  label: { fontFamily: fonts.bodySemi, fontSize: 14, color: colors.inkSoft },
  input: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.ink,
    borderBottomWidth: 2,
    borderBottomColor: colors.line,
    paddingVertical: 8,
  },
  button: { backgroundColor: colors.accent, borderRadius: 22, paddingVertical: 12, alignItems: 'center' },
  buttonSecondary: { backgroundColor: 'transparent', borderWidth: 2, borderColor: colors.accent },
  buttonText: { fontFamily: fonts.bodyBold, fontSize: 16, color: '#fff' },
  body: { fontFamily: fonts.body, fontSize: 16, color: colors.ink, lineHeight: 22 },
});
