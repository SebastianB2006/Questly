import { useEffect, useRef } from 'react';
import { Animated, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

import ModalCard, { closeModal } from '../../components/ModalCard';
import Icon from '../../components/Icon';
import { Button, Eyebrow } from '../../components/ui';
import { useStyles, useTheme } from '../../theme/ThemeContext';
import { fonts } from '../../theme/fonts';

const PIECES = 16;
const RADIUS = 92;

// Confetti în jurul medaliei: aceleași 16 bucăți, unghiuri și culori ca în CSS-ul designului.
function Confetti() {
  const progress = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(progress, { toValue: 1, duration: 1200, useNativeDriver: true }).start();
  }, [progress]);

  return (
    // centrul medaliei: padding-ul ferestrei (30) + marginea de sus (15) + jumătate din medalie (47)
    <View style={{ position: 'absolute', top: 30 + 15 + 47, left: '50%' }} pointerEvents="none">
      {Array.from({ length: PIECES }, (_, i) => {
        const angle = (i * 39 * Math.PI) / 180;
        const n = i + 1;
        const square = n % 2 === 0;
        const color = n % 3 === 0 ? '#B8CB89' : square ? '#E7C38E' : '#B99BE7';
        const w = square ? 7 : 5;
        const h = square ? 7 : 11;
        const dist = progress.interpolate({ inputRange: [0, 1], outputRange: [RADIUS * 0.4, RADIUS] });
        return (
          <Animated.View
            key={i}
            style={{
              position: 'absolute',
              width: w,
              height: h,
              left: -w / 2,
              top: -h / 2,
              borderRadius: 2,
              backgroundColor: color,
              opacity: progress,
              transform: [
                { translateX: Animated.multiply(dist, Math.sin(angle)) },
                { translateY: Animated.multiply(dist, -Math.cos(angle)) },
                { rotate: `${i * 39}deg` },
              ],
            }}
          />
        );
      })}
    </View>
  );
}

export default function SuccessScreen() {
  const s = useStyles(makeStyles);
  const { colors: c } = useTheme();
  const { xp = '0', streak = '1' } = useLocalSearchParams();

  return (
    <ModalCard>
      <Confetti />
      <View style={s.medal}>
        <Icon name="check" size={45} color={c.medalIcon} strokeWidth={2} />
      </View>
      <Eyebrow style={{ textAlign: 'center' }}>One small quest. One big feeling.</Eyebrow>
      <Text style={s.h2}>Look at you go!</Text>
      <Text style={s.p}>You stepped outside your routine.{'\n'}That’s where the good stuff happens.</Text>

      <View style={s.rewards}>
        <View style={[s.reward, s.rewardDivider]}>
          <Icon name="bolt" size={23} color={c.purple} />
          <Text style={s.rewardValue}>+{xp} XP</Text>
          <Text style={s.rewardLabel}>A little more legendary</Text>
        </View>
        <View style={s.reward}>
          <Icon name="flame" size={23} color={c.streakIcon} />
          <Text style={s.rewardValue}>
            {streak} day streak
          </Text>
          <Text style={s.rewardLabel}>Keep that spark going</Text>
        </View>
      </View>

      <Button title="Take that good feeling with you" arrow onPress={closeModal} style={{ marginTop: 23 }} />
      <Button
        variant="text"
        title="See your adventure log"
        center
        onPress={() => {
          closeModal();
          router.navigate('/profile');
        }}
        style={{ marginTop: 16, alignSelf: 'center' }}
      />
    </ModalCard>
  );
}

const makeStyles = (c) => ({
  medal: {
    width: 95,
    height: 95,
    borderRadius: 48,
    alignSelf: 'center',
    marginTop: 15,
    marginBottom: 29,
    backgroundColor: c.medalBg,
    borderWidth: 7,
    borderColor: c.medalRing,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: `0 0 0 1px ${c.medalBg}`,
  },
  h2: { fontFamily: fonts.heading800, fontSize: 34, lineHeight: 44, letterSpacing: -1.15, color: c.text, textAlign: 'center', marginBottom: 12 },
  p: { fontFamily: fonts.body400, fontSize: 14, lineHeight: 22, color: c.secondary, textAlign: 'center' },
  rewards: { flexDirection: 'row', marginTop: 23, paddingVertical: 22, paddingHorizontal: 10, borderRadius: 12, borderWidth: 1, borderColor: c.border, backgroundColor: c.bg },
  reward: { flex: 1, alignItems: 'center', gap: 8 },
  rewardDivider: { borderRightWidth: 1, borderRightColor: c.border },
  rewardValue: { fontFamily: fonts.body700, fontSize: 17, color: c.text },
  rewardLabel: { fontFamily: fonts.body400, fontSize: 11.5, color: c.muted, textAlign: 'center' },
});
