// Iconițele din designul Figma (aceleași trasee SVG), desenate cu react-native-svg.
import Svg, { Circle, Path } from 'react-native-svg';

const ICONS = {
  spark: [['p', 'm12 2 2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5L12 2Z']],
  sun: [
    ['c', 12, 12, 4],
    ['p', 'M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5'],
  ],
  friends: [
    ['c', 9, 8, 3],
    ['p', 'M3 20v-2a6 6 0 0 1 12 0v2m2-15a3 3 0 0 1 0 6m2 3a5 5 0 0 1 3 4v2'],
  ],
  inbox: [['p', 'm3 4-1 12v4h20v-4L21 4H3Zm-1 11h6l2 3h4l2-3h6']],
  user: [
    ['c', 12, 8, 4],
    ['p', 'M4 22v-2a8 8 0 0 1 16 0v2'],
  ],
  arrow: [['p', 'M4 12h16m-6-6 6 6-6 6']],
  back: [['p', 'M20 12H4m6-6-6 6 6 6']],
  chevron: [['p', 'm9 5 7 7-7 7']],
  flame: [['p', 'M13 2c2 6-3 6-1 10 2-1 3-3 3-5 5 4 7 8 3 12-5 6-15 2-14-5 0-3 2-5 4-7-1 5 2 5 2 5-1-4 2-6 3-10Z']],
  check: [['p', 'm5 12 4 4L19 6']],
  shuffle: [['p', 'M3 6h3c5 0 7 12 12 12h3m-4-4 4 4-4 4M3 18h3c2 0 3-2 5-5m3-4c1-2 3-3 4-3h3m-4-4 4 4-4 4']],
  plus: [['p', 'M12 5v14M5 12h14']],
  close: [['p', 'm6 6 12 12M6 18 18 6']],
  moon: [['p', 'M21 13a9 9 0 0 1-10-10 9 9 0 1 0 10 10Z']],
  logout: [['p', 'M9 3H3v18h6m5-16 7 7-7 7M7 12h14']],
  search: [
    ['c', 10, 10, 6],
    ['p', 'm15 15 6 6'],
  ],
  bolt: [['p', 'm13 2-9 12h7l-1 8 10-13h-7l1-7Z']],
  flag: [['p', 'M5 22V3c5-5 9 5 15 0v11c-6 5-10-5-15 0']],
  clock: [
    ['c', 12, 12, 9],
    ['p', 'M12 7v5l3 2'],
  ],
  heart: [['p', 'M20 5c-3-3-7-1-8 1-1-2-5-4-8-1-5 5 3 11 8 15 5-4 13-10 8-15Z']],
  camera: [
    ['p', 'M3 8h4l2-3h6l2 3h4v12H3V8Z'],
    ['c', 12, 13.5, 3.5],
  ],
  image: [
    ['p', 'M3 4h18v16H3V4Zm0 12 5-5 4 4 3-3 6 6'],
    ['c', 15.5, 8.5, 1.5],
  ],
  video: [['p', 'M3 6h12v12H3V6Zm12 4 6-3v10l-6-3']],
  play: [['p', 'M8 5v14l11-7L8 5Z']],
  edit: [['p', 'M4 20h4L19 9l-4-4L4 16v4Zm9-13 4 4']],
  share: [['p', 'M12 3v12m-5-7 5-5 5 5M5 14v6h14v-6']],
};

/** `fill` umple forma (ex. inima din ilustrație); implicit iconițele sunt doar contur. */
export default function Icon({ name, size = 20, color = 'currentColor', fill = 'none', strokeWidth = 1.7, style }) {
  const parts = ICONS[name] ?? ICONS.spark;
  const common = { stroke: color, fill, strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round' };
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" style={style} pointerEvents="none">
      {parts.map((p, i) =>
        p[0] === 'c' ? <Circle key={i} cx={p[1]} cy={p[2]} r={p[3]} {...common} /> : <Path key={i} d={p[1]} {...common} />
      )}
    </Svg>
  );
}
