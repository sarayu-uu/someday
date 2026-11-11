import { MaterialCommunityIcons } from '@expo/vector-icons';
import { createElement, useEffect, useState, type ReactNode } from 'react';
import { Platform, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

// Web-only. On a wide browser window the app is shown inside an iPhone 17
// frame (393x852 logical points). The iPhone's Camera Control button on the
// right edge is the toggle: press it to switch between phone view and full
// window. The phone view is an <iframe> of the same URL, so the app gets a real
// 393x852 viewport (useWindowDimensions, sheets, safe areas all behave like on
// a phone). Inside the iframe, and on real phones, this component does nothing.

const KEY = 'somedayjar.mobileView';
const W = 393;
const H = 852;
const BEZEL = 12;
const FRAME_W = W + BEZEL * 2;
const FRAME_H = H + BEZEL * 2;
const MIN_DESKTOP_WIDTH = 700;

const inIframe = () => {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
};

export function DeviceShell({ children }: { children: ReactNode }) {
  const { width, height } = useWindowDimensions();
  const [mounted, setMounted] = useState(false);
  const [on, setOn] = useState(true);

  useEffect(() => {
    try {
      const v = localStorage.getItem(KEY);
      if (v !== null) setOn(v === '1');
    } catch {}
    setMounted(true);
  }, []);

  const setMode = (next: boolean) => {
    setOn(next);
    try {
      localStorage.setItem(KEY, next ? '1' : '0');
    } catch {}
  };
  const toggle = () => setMode(!on);

  // Native, SSR, first paint, inside the iframe, or a narrow window: plain app.
  if (Platform.OS !== 'web' || !mounted || inIframe() || width < MIN_DESKTOP_WIDTH) return <>{children}</>;

  if (!on) {
    return (
      <>
        {children}
        <ModeSwitch mobile={false} onChange={setMode} />
      </>
    );
  }

  const scale = Math.min(1, (height - 32) / FRAME_H);
  return (
    <View style={s.backdrop}>
      <View style={[s.stage, { transform: [{ scale }] }]}>
        {/* left edge: action button + volume */}
        <View style={[s.side, s.left, { top: 120, height: 28 }]} />
        <View style={[s.side, s.left, { top: 190, height: 56 }]} />
        <View style={[s.side, s.left, { top: 262, height: 56 }]} />
        {/* right edge: side (power) button */}
        <View style={[s.side, s.right, { top: 210, height: 90 }]} />

        <View style={s.frame}>
          <View style={s.screen}>
            {createElement('iframe', {
              src: window.location.href,
              title: 'Someday Jar mobile view',
              style: { width: W, height: H, border: 0, display: 'block', background: '#F8F4E9' },
            })}
            {/* Dynamic Island */}
            <View pointerEvents="none" style={s.island} />
          </View>
        </View>

        <CameraControl onPress={toggle} label="Switch to full-window view" />
      </View>
      <ModeSwitch mobile onChange={setMode} />
    </View>
  );
}

// Visible Desktop | Mobile switch, pinned bottom-left in both views.
function ModeSwitch({ mobile, onChange }: { mobile: boolean; onChange: (mobile: boolean) => void }) {
  const opt = (isMobile: boolean, icon: 'monitor' | 'cellphone', label: string) => {
    const active = mobile === isMobile;
    return (
      <Pressable
        onPress={() => onChange(isMobile)}
        accessibilityRole="button"
        accessibilityState={{ selected: active }}
        accessibilityLabel={`${label} view`}
        style={[s.seg, active && s.segActive]}
      >
        <MaterialCommunityIcons name={icon} size={16} color={active ? '#fff' : '#3A2A1F'} />
        <Text style={[s.segText, active && { color: '#fff' }]}>{label}</Text>
      </Pressable>
    );
  };
  return (
    <View style={s.switch}>
      {opt(false, 'monitor', 'Desktop')}
      {opt(true, 'cellphone', 'Mobile')}
    </View>
  );
}

// The iPhone 17 Camera Control: a small flush pill below the side button.
function CameraControl({ onPress, label, floating }: { onPress: () => void; label: string; floating?: boolean }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      // @ts-expect-error web-only prop: native tooltip
      title={label}
      hitSlop={10}
      style={({ pressed, hovered }: any) => [
        s.camera,
        floating ? s.cameraFloating : s.cameraOnFrame,
        (hovered || pressed) && s.cameraActive,
        pressed && { transform: [{ translateX: -1 }] },
      ]}
    >
      {floating ? <MaterialCommunityIcons name="cellphone" size={12} color="#E8E4DA" /> : <View style={s.cameraGlint} />}
    </Pressable>
  );
}

const s = StyleSheet.create({
  backdrop: {
    flex: 1,
    minHeight: '100vh' as any,
    backgroundColor: '#E9E2D2',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  stage: { width: FRAME_W, height: FRAME_H },
  frame: {
    width: FRAME_W,
    height: FRAME_H,
    borderRadius: 66,
    backgroundColor: '#2B2B2E',
    padding: BEZEL,
    borderWidth: 2,
    borderColor: '#4A4A4F',
    boxShadow: '0 30px 60px rgba(58,42,31,0.35), 0 8px 18px rgba(58,42,31,0.25)' as any,
  },
  screen: { width: W, height: H, borderRadius: 54, overflow: 'hidden', backgroundColor: '#000' },
  island: {
    position: 'absolute',
    top: 11,
    left: (W - 118) / 2,
    width: 118,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#000',
  },
  side: { position: 'absolute', width: 4, borderRadius: 2, backgroundColor: '#3A3A3E' },
  left: { left: -3 },
  right: { right: -3 },
  camera: {
    backgroundColor: '#3A3A3E',
    borderColor: '#55555B',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraOnFrame: { position: 'absolute', right: -5, top: 560, width: 7, height: 60, borderRadius: 4 },
  cameraFloating: {
    position: 'fixed' as any,
    right: 0,
    top: '62%' as any,
    width: 22,
    height: 64,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    zIndex: 1000,
  },
  switch: {
    position: 'fixed' as any,
    left: 16,
    bottom: 16,
    zIndex: 1000,
    flexDirection: 'row',
    padding: 4,
    gap: 4,
    borderRadius: 999,
    backgroundColor: '#FBF7EC',
    borderWidth: 1.5,
    borderColor: '#3A2A1F',
    boxShadow: '2px 3px 0 rgba(58,42,31,0.25)' as any,
  },
  seg: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 7, paddingHorizontal: 12, borderRadius: 999 },
  segActive: { backgroundColor: '#C1543A' },
  segText: { fontSize: 13, fontWeight: '700', color: '#3A2A1F' },
  cameraActive: { backgroundColor: '#C1543A', borderColor: '#E08A6F' },
  cameraGlint: { width: 2, height: 36, borderRadius: 1, backgroundColor: '#fff', opacity: 0.25 },
});
