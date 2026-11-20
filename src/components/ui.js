// Componentele de bază ale designului Questly: titluri, carduri, butoane, etichete, câmpuri.
import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native';
import Icon from './Icon';
import { useStyles, useTheme } from '../theme/ThemeContext';
import { fonts } from '../theme/fonts';
import { CATEGORIES } from '../constants/quests';

export const firstName = (name = '') => name.trim().split(/\s+/)[0] ?? '';

/** Sigla: semnul mov înclinat cu steluță + „questly.” */
export function Brand({ size = 26 }) {
  const { colors: c } = useTheme();
  const mark = size * 1.3;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }} accessibilityRole="header" accessibilityLabel="Questly">
      <View
        style={{
          width: mark * 0.86,
          height: mark,
          borderRadius: size * 0.46,
          backgroundColor: '#7950DC',
          alignItems: 'center',
          justifyContent: 'center',
          transform: [{ rotate: '-7deg' }],
          marginRight: size * 0.33,
        }}
      >
        <Icon name="spark" size={size * 0.78} color="#FFFFFF" />
      </View>
      <Text style={{ fontFamily: fonts.heading800, fontSize: size, letterSpacing: -size * 0.05, color: c.text }}>
        questly<Text style={{ color: c.purple }}>.</Text>
      </Text>
    </View>
  );
}

export function Eyebrow({ children, color, style }) {
  const s = useStyles(makeStyles);
  return <Text style={[s.eyebrow, color && { color }, style]}>{String(children).toUpperCase()}</Text>;
}

export function PageHeading({ eyebrow, title, subtitle, right }) {
  const s = useStyles(makeStyles);
  return (
    <View style={s.pageHeading}>
      <View style={{ flex: 1 }}>
        {!!eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        <Text style={s.h1} accessibilityRole="header">
          {title}
        </Text>
        {!!subtitle && <Text style={s.pageSubtitle}>{subtitle}</Text>}
      </View>
      {right}
    </View>
  );
}

export function SectionHeading({ title, count, right, subtitle }) {
  const s = useStyles(makeStyles);
  return (
    <View style={{ gap: 6 }}>
      <View style={s.sectionRow}>
        <View style={s.sectionTitleRow}>
          <Text style={s.sectionTitle} accessibilityRole="header">
            {title}
          </Text>
          {count != null && (
            <View style={s.count}>
              <Text style={s.countText}>{count}</Text>
            </View>
          )}
        </View>
        {right}
      </View>
      {!!subtitle && <Text style={s.sectionSubtitle}>{subtitle}</Text>}
    </View>
  );
}

export function Card({ children, style, onPress, accessibilityLabel }) {
  const s = useStyles(makeStyles);
  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        style={({ pressed }) => [s.card, pressed && { opacity: 0.85 }, style]}
      >
        {children}
      </Pressable>
    );
  }
  return <View style={[s.card, style]}>{children}</View>;
}

/**
 * variant: 'primary' (mov) | 'secondary' (alb, contur) | 'subtle' (text gri) | 'text' (link mov) | 'dashed'
 * `icon` în stânga, `arrow` = săgeată în dreapta, ca în design.
 */
export function Button({ title, onPress, variant = 'primary', icon, arrow = false, loading = false, disabled = false, style, small = false, center }) {
  const s = useStyles(makeStyles);
  const { colors: c } = useTheme();
  const isDisabled = disabled || loading;
  const fg = variant === 'primary' ? '#FFFFFF' : variant === 'subtle' ? c.muted : c.purple;
  const box = {
    primary: s.btnPrimary,
    secondary: s.btnSecondary,
    subtle: s.btnSubtle,
    text: s.btnText,
    dashed: s.btnDashed,
  }[variant];
  const label = {
    primary: s.btnPrimaryLabel,
    secondary: s.btnSecondaryLabel,
    subtle: s.btnSubtleLabel,
    text: s.btnTextLabel,
    dashed: s.btnDashedLabel,
  }[variant];
  const iconSize = variant === 'text' ? 15 : 18;
  const centered = center ?? variant !== 'text';

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      hitSlop={variant === 'text' || variant === 'subtle' ? 8 : 0}
      style={({ pressed }) => [
        box,
        small && s.btnSmall,
        centered ? { justifyContent: 'center' } : { alignSelf: 'flex-start' },
        pressed && variant === 'primary' && { backgroundColor: c.buttonPressed },
        pressed && (variant === 'secondary' || variant === 'dashed') && { backgroundColor: c.pale },
        pressed && (variant === 'text' || variant === 'subtle') && { opacity: 0.6 },
        isDisabled && { opacity: 0.45 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <>
          {!!icon && <Icon name={icon} size={iconSize} color={fg} />}
          <Text style={[label, small && s.btnSmallLabel, arrow && variant !== 'text' && { flex: 1, textAlign: icon ? 'left' : 'center' }]}>
            {title}
          </Text>
          {arrow && <Icon name="arrow" size={iconSize} color={fg} />}
        </>
      )}
    </Pressable>
  );
}

/** Butonul rotund cu săgeată din rândurile „From your friends”. */
export function CircleButton({ icon = 'arrow', onPress, label }) {
  const s = useStyles(makeStyles);
  const { colors: c } = useTheme();
  return (
    <Pressable onPress={onPress} hitSlop={8} accessibilityRole="button" accessibilityLabel={label} style={({ pressed }) => [s.circleBtn, pressed && { backgroundColor: c.pale }]}>
      <Icon name={icon} size={17} color={c.secondary} />
    </Pressable>
  );
}

/** Eticheta de categorie (Social, Active, Creative, Chill). */
export function Tag({ category }) {
  const { categories } = useTheme();
  const s = useStyles(makeStyles);
  const tone = categories[category] ?? categories.social;
  return (
    <View style={[s.tag, { backgroundColor: tone.bg }]}>
      <Text style={[s.tagText, { color: tone.fg }]}>{CATEGORIES[category]?.label ?? 'Social'}</Text>
    </View>
  );
}

const STATUS_LABELS = { pending: 'Pending', active: 'Accepted', completed: 'Completed', declined: 'Declined' };

export function StatusTag({ status }) {
  const { statuses } = useTheme();
  const s = useStyles(makeStyles);
  const tone = statuses[status] ?? statuses.pending;
  return (
    <View style={[s.status, { backgroundColor: tone.bg }]}>
      {(status === 'completed' || status === 'active') && <Icon name="check" size={12} color={tone.fg} />}
      <Text style={[s.statusText, { color: tone.fg }]}>{STATUS_LABELS[status] ?? status}</Text>
    </View>
  );
}

/** Câmp de formular: etichetă, input (sau textarea cu `multiline`) și indiciu dedesubt. */
export function Field({ label, optional, hint, multiline = false, error, icon, style, inputStyle, ...inputProps }) {
  const s = useStyles(makeStyles);
  const { colors: c } = useTheme();
  return (
    <View style={style}>
      {!!label && (
        <Text style={s.fieldLabel}>
          {label}
          {optional ? <Text style={s.fieldOptional}> (optional)</Text> : null}
        </Text>
      )}
      <View style={[s.inputBox, multiline && s.inputBoxMulti, !!error && { borderColor: c.error }]}>
        {!!icon && <Icon name={icon} size={18} color={c.muted} />}
        <TextInput
          style={[s.input, multiline && s.inputMulti, inputStyle]}
          placeholderTextColor={c.muted}
          multiline={multiline}
          accessibilityLabel={label ?? inputProps.placeholder}
          {...inputProps}
        />
      </View>
      {!!hint && <Text style={s.fieldHint}>{hint}</Text>}
    </View>
  );
}

export function EmptyState({ children }) {
  const s = useStyles(makeStyles);
  return (
    <View style={s.empty}>
      <Text style={s.emptyText}>{children}</Text>
    </View>
  );
}

export function ErrorText({ message, style }) {
  const s = useStyles(makeStyles);
  if (!message) return null;
  return (
    <Text style={[s.error, style]} accessibilityRole="alert" accessibilityLiveRegion="polite">
      {message}
    </Text>
  );
}

/** Pătrățelul mov cu iconiță din capul ferestrelor (flag, spark, friends). */
export function ModalIcon({ name }) {
  const s = useStyles(makeStyles);
  const { colors: c } = useTheme();
  return (
    <View style={s.modalIcon}>
      <Icon name={name} size={26} color={c.purple} />
    </View>
  );
}

export const makeStyles = (c) => ({
  eyebrow: { fontFamily: fonts.body700, fontSize: 10, letterSpacing: 1.5, color: c.muted, marginBottom: 10 },
  pageHeading: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  h1: { fontFamily: fonts.heading800, fontSize: 30, lineHeight: 37, letterSpacing: -1.1, color: c.text },
  pageSubtitle: { fontFamily: fonts.body400, fontSize: 14, lineHeight: 21, color: c.secondary, marginTop: 10 },
  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 1 },
  sectionTitle: { fontFamily: fonts.heading700, fontSize: 17, lineHeight: 23, letterSpacing: -0.35, color: c.text },
  count: { minWidth: 22, height: 22, paddingHorizontal: 6, borderRadius: 6, backgroundColor: c.pale, alignItems: 'center', justifyContent: 'center' },
  countText: { fontFamily: fonts.body600, fontSize: 11.5, color: c.purple },
  sectionSubtitle: { fontFamily: fonts.body400, fontSize: 13, lineHeight: 19, color: c.muted },
  card: { backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, borderRadius: 14, padding: 20 },
  btnPrimary: {
    minHeight: 50,
    borderRadius: 10,
    backgroundColor: c.button,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 18,
    boxShadow: '0 4px 7px rgba(116, 80, 181, 0.10)',
  },
  btnPrimaryLabel: { fontFamily: fonts.body600, fontSize: 15, color: '#FFFFFF' },
  btnSecondary: {
    minHeight: 46,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: c.border,
    backgroundColor: c.surface,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    paddingHorizontal: 16,
  },
  btnSecondaryLabel: { fontFamily: fonts.body600, fontSize: 14.5, color: c.purple },
  btnSubtle: { minHeight: 40, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10 },
  btnSubtleLabel: { fontFamily: fonts.body400, fontSize: 14, color: c.muted },
  btnText: { flexDirection: 'row', alignItems: 'center', gap: 7, paddingVertical: 4 },
  btnTextLabel: { fontFamily: fonts.body600, fontSize: 13, color: c.purple },
  btnDashed: {
    minHeight: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: c.dark ? '#5B4A7A' : '#D5C6E9',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    paddingHorizontal: 12,
  },
  btnDashedLabel: { fontFamily: fonts.body500, fontSize: 13.5, color: c.purple },
  btnSmall: { minHeight: 42, paddingHorizontal: 14 },
  btnSmallLabel: { fontSize: 13.5 },
  circleBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: c.border,
    backgroundColor: c.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tag: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 5 },
  tagText: { fontFamily: fonts.body500, fontSize: 11 },
  status: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 9, paddingVertical: 4, borderRadius: 6 },
  statusText: { fontFamily: fonts.body500, fontSize: 11.5 },
  fieldLabel: { fontFamily: fonts.body600, fontSize: 13, color: c.text, marginBottom: 9 },
  fieldOptional: { fontFamily: fonts.body400, fontSize: 12, color: c.muted },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 50,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: c.border,
    backgroundColor: c.inputBg,
  },
  inputBoxMulti: { alignItems: 'flex-start' },
  input: { flex: 1, fontFamily: fonts.body400, fontSize: 15, color: c.text, paddingVertical: 12, outlineStyle: 'none' },
  inputMulti: { minHeight: 118, textAlignVertical: 'top', lineHeight: 22 },
  fieldHint: { fontFamily: fonts.body400, fontSize: 11.5, color: c.muted, marginTop: 8 },
  empty: { padding: 20, borderRadius: 12, borderWidth: 1, borderStyle: 'dashed', borderColor: c.border, alignItems: 'center' },
  emptyText: { fontFamily: fonts.body400, fontSize: 13.5, lineHeight: 20, color: c.muted, textAlign: 'center' },
  error: { fontFamily: fonts.body500, fontSize: 13, lineHeight: 19, color: c.error },
  modalIcon: { width: 50, height: 50, borderRadius: 15, backgroundColor: c.pale, alignItems: 'center', justifyContent: 'center', marginBottom: 22 },
});
