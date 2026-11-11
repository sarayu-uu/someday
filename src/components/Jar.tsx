import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

// Width / height of assets/images/jar.png (cropped tight to the jar).
export const JAR_ASPECT = 855 / 1106;
// Horizontal center of the glass body as a fraction of the image width (the tag
// pushes the image's own center to the right of the jar).
const BODY_CENTER = 0.435;
// Widest the picture can be and still keep the tag on screen when the body is centered.
export const JAR_MAX_SCREEN_FRACTION = 0.88;

// Decorative jar: a watercolor illustration (glass jar, wooden lid, twine, "Us,
// always" tag, paper notes). Purely visual, not interactive. The notes are part
// of the picture, so they no longer reflect the saved ideas one-to-one.
// With `oversize`, `maxWidth` is the exact width and may overflow the container
// (desktop: a huge jar cropped by the window).
export function Jar({ maxWidth = 340, oversize = false }: { maxWidth?: number; oversize?: boolean }) {
  return (
    <View
      style={[
        s.wrap,
        oversize
          ? // The hanging tag sticks out to the right, so shift the picture right
            // by the body's offset from the image center to center the jar itself.
            { width: maxWidth, flexShrink: 0, transform: [{ translateX: maxWidth * (0.5 - BODY_CENTER) }] }
          : { width: '100%', maxWidth },
      ]}
      accessibilityLabel="A jar full of ideas"
      accessible>
      <Image source={require('../../assets/images/jar.png')} contentFit="contain" style={StyleSheet.absoluteFill} />
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { aspectRatio: JAR_ASPECT, alignSelf: 'center' },
});
