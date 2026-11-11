import { Image } from 'expo-image';
import { StyleSheet } from 'react-native';

// Paper texture behind a screen. Put it first inside the screen's root view.
// paper.png is a single 512x512 sheet, not a seamless tile. React Native's own
// <Image resizeMode> prop is ignored here (it drew the sheet once at native size,
// leaving the rest of the screen flat), so use expo-image's contentFit to
// stretch the one sheet across the whole screen.
export function Paper() {
  return (
    <Image
      source={require('../../assets/images/paper.png')}
      contentFit="cover"
      pointerEvents="none"
      style={StyleSheet.absoluteFill}
      accessibilityElementsHidden
    />
  );
}
