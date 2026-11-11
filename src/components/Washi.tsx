import { useId, useState, type ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Defs, Path, Pattern, Rect } from 'react-native-svg';

const TOOTH = 6; // zig-zag tooth height along the ends
const DEPTH = 4; // zig-zag tooth depth

// Outline of a strip whose short ends are cut with pinking shears.
function stripPath(w: number, h: number) {
  const pts: string[] = [`M0 0 L${w} 0`];
  let flip = false;
  for (let y = 0; y < h; y += TOOTH) {
    pts.push(`L${flip ? w : w - DEPTH} ${Math.min(y + TOOTH / 2, h)}`);
    flip = !flip;
  }
  pts.push(`L${w} ${h} L0 ${h}`);
  flip = false;
  for (let y = h; y > 0; y -= TOOTH) {
    pts.push(`L${flip ? 0 : DEPTH} ${Math.max(y - TOOTH / 2, 0)}`);
    flip = !flip;
  }
  pts.push('Z');
  return pts.join(' ');
}

// Mix a #RRGGBB color toward white; gives the solid pale stripe of the tape.
function lighten(hex: string, amount: number) {
  const n = parseInt(hex.slice(1), 16);
  const ch = (shift: number) => Math.round(((n >> shift) & 255) * (1 - amount) + 255 * amount);
  return `rgb(${ch(16)},${ch(8)},${ch(0)})`;
}

// Solid (opaque) diagonal candy-stripe tape with zig-zag cut ends, tilted a touch.
export function Washi({
  color,
  children,
  tilt = -2,
  style,
}: {
  color: string;
  children?: ReactNode;
  tilt?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const id = 'washi' + useId().replace(/[^a-zA-Z0-9]/g, '');
  const [size, setSize] = useState({ w: 0, h: 0 });
  return (
    <View
      onLayout={(e) => setSize({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}
      style={[{ alignSelf: 'center', transform: [{ rotate: `${tilt}deg` }] }, style]}>
      <View style={StyleSheet.absoluteFill}>
        <Svg width="100%" height="100%">
          <Defs>
            <Pattern id={id} width="26" height="26" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <Rect width="13" height="26" fill={color} />
              <Rect x="13" width="13" height="26" fill={lighten(color, 0.45)} />
            </Pattern>
          </Defs>
          {size.w > 0 && <Path d={stripPath(size.w, size.h)} fill={`url(#${id})`} />}
        </Svg>
      </View>
      <View style={{ paddingHorizontal: 30, paddingVertical: 2, alignItems: 'center' }}>{children}</View>
    </View>
  );
}
