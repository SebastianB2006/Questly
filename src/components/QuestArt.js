// Ilustrația din cardul „Your daily side quest”: două baloane de vorbă, orbite, steluțe și o insignă.
// Pozițiile sunt cele din CSS-ul designului, calculate față de centrul cardului.
import { useState } from 'react';
import { View } from 'react-native';
import Svg, { Ellipse, Polygon } from 'react-native-svg';
import Icon from './Icon';
import { useTheme } from '../theme/ThemeContext';

const H = 165;

/** `background` = culoarea de sub ilustrație (conturul insignei se potrivește cu ea). */
export default function QuestArt({ glow = false, background }) {
  const { colors: c } = useTheme();
  const [w, setW] = useState(300);
  const cx = w / 2;
  const cy = H * 0.48;

  return (
    <View
      style={{ height: H, width: '100%', maxWidth: 360, alignSelf: 'center' }}
      onLayout={(e) => setW(e.nativeEvent.layout.width)}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Svg width={w} height={H} style={{ position: 'absolute' }}>
        {glow && <Ellipse cx={cx} cy={cy} rx={Math.min(150, w / 2)} ry={78} fill={c.pale} opacity={0.55} />}
        <Ellipse cx={cx} cy={cy} rx={117} ry={62} stroke={c.orbit} strokeWidth={1} fill="none" transform={`rotate(-18 ${cx} ${cy})`} />
        <Ellipse cx={cx} cy={cy} rx={140} ry={50} stroke={c.orbit2} strokeWidth={1} fill="none" transform={`rotate(24 ${cx} ${cy})`} />
        <Ellipse cx={cx} cy={H - 6} rx={60} ry={4} fill={c.artShadow} opacity={0.8} />
      </Svg>

      <Icon name="spark" size={26} color={c.star} fill={c.star} strokeWidth={1} style={{ position: 'absolute', left: cx + 97, top: 14 }} />
      <Icon name="spark" size={16} color={c.star} fill={c.star} strokeWidth={1} style={{ position: 'absolute', left: cx - 133, top: 102 }} />
      <Icon name="plus" size={14} color={c.star} style={{ position: 'absolute', left: cx + 128, top: 106 }} />

      {/* balonul din spate, cu trei puncte */}
      <View
        style={{
          position: 'absolute',
          left: cx - 96,
          top: 20,
          width: 105,
          height: 75,
          borderRadius: 20,
          backgroundColor: c.bubbleBack,
          borderTopWidth: 3,
          borderTopColor: c.bubbleBackTop,
          transform: [{ rotate: '-13deg' }],
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          boxShadow: '0 10px 20px rgba(118, 84, 160, 0.10)',
        }}
      >
        <Svg width={25} height={27} style={{ position: 'absolute', bottom: -10, left: 22, transform: [{ rotate: '-12deg' }] }}>
          <Polygon points="0,0 25,0 0,27" fill={c.bubbleBack} />
        </Svg>
        {[0, 1, 2].map((i) => (
          <View key={i} style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: c.bubbleDots }} />
        ))}
      </View>

      {/* balonul din față, cu inimă */}
      <View
        style={{
          position: 'absolute',
          left: cx - 12,
          top: 51,
          width: 110,
          height: 85,
          borderRadius: 20,
          backgroundColor: c.bubbleFront,
          borderTopWidth: 3,
          borderTopColor: '#FFFFFF',
          transform: [{ rotate: '11deg' }],
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: `0 8px 0 ${c.bubbleFrontShade}, 0 18px 15px rgba(118, 84, 160, 0.13)`,
        }}
      >
        <Svg width={25} height={27} style={{ position: 'absolute', bottom: -10, right: 17 }}>
          <Polygon points="0,0 25,0 25,27" fill={c.bubbleFront} />
        </Svg>
        <View>
          <Icon name="heart" size={45} color="#8860BC" fill="#8860BC" strokeWidth={1} style={{ position: 'absolute', top: 3 }} />
          <Icon name="heart" size={45} color={c.heart} fill={c.heart} strokeWidth={1} />
        </View>
      </View>

      {/* insigna verde */}
      <View
        style={{
          position: 'absolute',
          left: cx - 34,
          top: 117,
          width: 40,
          height: 40,
          borderRadius: 20,
          borderWidth: 4,
          borderColor: background ?? c.card,
          backgroundColor: c.badge,
          alignItems: 'center',
          justifyContent: 'center',
          transform: [{ rotate: '13deg' }],
        }}
      >
        <Icon name="spark" size={20} color={c.badgeIcon} />
      </View>
    </View>
  );
}
