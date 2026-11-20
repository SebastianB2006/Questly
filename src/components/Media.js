// Afișarea pozelor și videoclipurilor unei provocări.
import { View, Image, Text, Pressable } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import Icon from './Icon';
import { useStyles } from '../theme/ThemeContext';
import { fonts } from '../theme/fonts';

const formatDuration = (ms) => {
  if (!ms) return '';
  const sec = Math.round(ms / 1000);
  return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;
};

/** Pătrățel mic: poză sau iconiță de video. `onRemove` afișează un buton „×”. */
export function MediaThumb({ item, size = 84, onRemove }) {
  const s = useStyles(makeStyles);
  return (
    <View>
      {item.type === 'video' ? (
        <View style={[s.thumb, s.videoThumb, { width: size, height: size }]}>
          <Icon name="play" size={size * 0.3} color="#FFFFFF" fill="#FFFFFF" />
          {!!item.duration && <Text style={s.duration}>{formatDuration(item.duration)}</Text>}
        </View>
      ) : (
        <Image source={{ uri: item.url ?? item.uri }} style={[s.thumb, { width: size, height: size }]} accessibilityLabel="Photo" />
      )}
      {onRemove && (
        <Pressable onPress={onRemove} hitSlop={8} style={s.remove} accessibilityRole="button" accessibilityLabel="Remove">
          <Icon name="close" size={14} color="#FFFFFF" strokeWidth={2.2} />
        </Pressable>
      )}
    </View>
  );
}

function QuestVideo({ uri }) {
  const s = useStyles(makeStyles);
  const player = useVideoPlayer(uri, (p) => {
    p.loop = false;
  });
  return <VideoView player={player} style={s.video} nativeControls contentFit="contain" />;
}

/** Galeria completă, pe lățimea ecranului (ecranul unei amintiri). */
export function MediaGallery({ media = [] }) {
  const s = useStyles(makeStyles);
  if (!media.length) return null;
  return (
    <View style={{ gap: 14 }}>
      {media.map((m, i) =>
        m.type === 'video' ? (
          <QuestVideo key={m.url ?? i} uri={m.url} />
        ) : (
          <Image
            key={m.url ?? i}
            source={{ uri: m.url }}
            style={[s.image, { aspectRatio: m.width && m.height ? m.width / m.height : 4 / 3 }]}
            resizeMode="cover"
            accessibilityLabel={`Photo ${i + 1}`}
          />
        )
      )}
    </View>
  );
}

const makeStyles = (c) => ({
  thumb: { borderRadius: 10, backgroundColor: c.pale },
  videoThumb: { backgroundColor: '#282735', alignItems: 'center', justifyContent: 'center' },
  duration: { position: 'absolute', bottom: 6, right: 8, color: '#FFFFFF', fontFamily: fonts.body600, fontSize: 11 },
  remove: {
    position: 'absolute',
    top: -7,
    right: -7,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#282735',
    borderWidth: 2,
    borderColor: c.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: { width: '100%', borderRadius: 14, backgroundColor: c.pale, maxHeight: 520 },
  video: { width: '100%', aspectRatio: 9 / 16, maxHeight: 520, borderRadius: 14, backgroundColor: '#000' },
});
