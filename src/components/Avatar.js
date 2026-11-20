// Avatarul ilustrat din design (păr, față, umeri), în 4 culori. Culoarea se alege din uid, ca să fie mereu aceeași.
import { View } from 'react-native';
import { AVATAR_TONES } from '../theme/colors';

const BASE = 41; // dimensiunea din design; celelalte mărimi sunt scalate

export function toneFor(seed = '') {
  let h = 0;
  for (const ch of String(seed)) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return AVATAR_TONES[h % AVATAR_TONES.length];
}

function hairStyle(tone) {
  if (tone.key === 'mint') {
    return {
      left: 8,
      top: 5,
      width: 25,
      height: 23,
      borderTopLeftRadius: 10,
      borderTopRightRadius: 12.5,
      borderBottomRightRadius: 7,
      borderBottomLeftRadius: 10,
      transform: [{ rotate: '-8deg' }],
    };
  }
  return {
    left: 8,
    top: 6,
    width: 25,
    height: tone.key === 'lilac' ? 36 : 30,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  };
}

/** `ring` = culoarea unui contur (ex. fundalul paginii, pentru avatarele suprapuse). */
export default function Avatar({ seed, size = BASE, ring }) {
  const tone = toneFor(seed);
  const scale = size / BASE;
  const offset = (size - BASE) / 2;

  const avatar = (
    <View
      style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: tone.bg, overflow: 'hidden' }}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <View style={{ position: 'absolute', width: BASE, height: BASE, left: offset, top: offset, transform: [{ scale }] }}>
        <View style={[{ position: 'absolute', backgroundColor: tone.hair }, hairStyle(tone)]} />
        <View
          style={{
            position: 'absolute',
            left: 12,
            top: 11,
            width: 18,
            height: 23,
            borderTopLeftRadius: 7.5,
            borderTopRightRadius: 7.5,
            borderBottomLeftRadius: 9,
            borderBottomRightRadius: 9,
            backgroundColor: '#E8B590',
          }}
        >
          <View style={{ position: 'absolute', top: 9, left: 4, width: 2, height: 2, borderRadius: 1, backgroundColor: '#4B3A33' }} />
          <View style={{ position: 'absolute', top: 9, left: 12, width: 2, height: 2, borderRadius: 1, backgroundColor: '#4B3A33' }} />
          <View
            style={{
              position: 'absolute',
              top: 13,
              left: 6.5,
              width: 5,
              height: 3,
              borderBottomWidth: 1,
              borderColor: '#965C4D',
              borderBottomLeftRadius: 2.5,
              borderBottomRightRadius: 2.5,
            }}
          />
        </View>
        <View
          style={{
            position: 'absolute',
            left: 5,
            top: 31,
            width: 32,
            height: 20,
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            backgroundColor: tone.body,
          }}
        />
      </View>
    </View>
  );

  if (!ring) return avatar;
  return <View style={{ padding: 2, borderRadius: size / 2 + 2, backgroundColor: ring }}>{avatar}</View>;
}
