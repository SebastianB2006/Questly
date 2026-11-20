// Bara de jos din design: Today, Friends, Inbox, Profile. Tabul activ are un fundal mov deschis sub iconiță.
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Icon from './Icon';
import { useData } from '../context/DataContext';
import { useStyles, useTheme } from '../theme/ThemeContext';
import { fonts } from '../theme/fonts';

const TABS = {
  index: { label: 'Today', icon: 'sun' },
  friends: { label: 'Friends', icon: 'friends' },
  inbox: { label: 'Inbox', icon: 'inbox' },
  profile: { label: 'Profile', icon: 'user' },
};

export default function TabBar({ state }) {
  const s = useStyles(makeStyles);
  const { colors: c } = useTheme();
  const insets = useSafeAreaInsets();
  const { inbox, incomingRequests } = useData();

  return (
    <View style={[s.bar, { paddingBottom: Math.max(insets.bottom, 12) }]} accessibilityRole="tablist">
      {state.routes.map((route, index) => {
        const tab = TABS[route.name];
        if (!tab) return null;
        const focused = state.index === index;
        const dot = (route.name === 'inbox' && inbox.length > 0) || (route.name === 'friends' && incomingRequests.length > 0);
        const color = focused ? c.purple : c.muted;
        return (
          <Pressable
            key={route.key}
            style={s.item}
            accessibilityRole="tab"
            accessibilityState={{ selected: focused }}
            accessibilityLabel={dot ? `${tab.label}, new` : tab.label}
            onPress={() => {
              if (!focused) router.navigate(route.name === 'index' ? '/' : `/${route.name}`);
            }}
          >
            <View style={[s.iconWrap, focused && { backgroundColor: c.pale }]}>
              <Icon name={tab.icon} size={22} color={color} />
              {dot && <View style={s.dot} />}
            </View>
            <Text style={[s.label, { color }, focused && { fontFamily: fonts.body700 }]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const makeStyles = (c) => ({
  bar: {
    flexDirection: 'row',
    paddingTop: 10,
    paddingHorizontal: 9,
    backgroundColor: c.surface,
    borderTopWidth: 1,
    borderTopColor: c.border,
    boxShadow: '0 -5px 25px rgba(32, 23, 46, 0.03)',
  },
  item: { flex: 1, alignItems: 'center', gap: 5 },
  iconWrap: { width: 46, height: 30, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  dot: { position: 'absolute', top: 3, right: 9, width: 7, height: 7, borderRadius: 3.5, backgroundColor: c.purple, borderWidth: 1.5, borderColor: c.surface },
  label: { fontFamily: fonts.body500, fontSize: 11.5 },
});
