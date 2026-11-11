import type { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

import { Washi } from '@/components/Washi';
import { colors, fonts } from '@/lib/theme';

// Bottom sheet on a dimmed backdrop. Used instead of Alert, which does nothing on web.
// The backdrop covers the whole screen (including behind the sheet), the sheet
// is anchored to the bottom edge with big rounded top corners.
export function Sheet({
  visible,
  title,
  onClose,
  tint = colors.washi,
  children,
}: {
  visible: boolean;
  title: string;
  onClose: () => void;
  tint?: string;
  children: ReactNode;
}) {
  const { height } = useWindowDimensions();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={s.root}>
        <Pressable style={[StyleSheet.absoluteFill, s.backdrop]} onPress={onClose} accessibilityLabel="Close" />
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={s.kav}>
          {/* View (not ScrollView) carries the radius + clipping so the corners are really round. */}
          <View style={[s.sheet, { maxHeight: height * 0.88 }]}>
            <ScrollView
              contentContainerStyle={s.content}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              bounces={false}>
              <View style={s.grip} />
              <Washi color={tint} tilt={-1.5} style={{ marginTop: 4 }}>
                <Text style={s.title} numberOfLines={2}>
                  {title}
                </Text>
              </Washi>
              {children}
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { backgroundColor: 'rgba(58,42,31,0.45)' },
  kav: { width: '100%', maxWidth: 520, alignSelf: 'center' },
  sheet: {
    backgroundColor: colors.paper,
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    overflow: 'hidden',
    borderTopWidth: 1.5,
    borderLeftWidth: 1.5,
    borderRightWidth: 1.5,
    borderColor: colors.line,
    boxShadow: '0px -3px 8px rgba(58,42,31,0.18)',
  },
  // Extra bottom padding keeps content clear of a phone's rounded bottom corners.
  content: { gap: 12, paddingHorizontal: 20, paddingTop: 14, paddingBottom: 40 },
  grip: { alignSelf: 'center', width: 44, height: 5, borderRadius: 3, backgroundColor: colors.line },
  title: { fontFamily: fonts.hand, fontSize: 30, color: colors.ink, textAlign: 'center' },
});
