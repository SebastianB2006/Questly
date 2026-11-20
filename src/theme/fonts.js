// Fonturile din design: Manrope pentru titluri, DM Sans pentru text.
import {
  useFonts as useManrope,
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
} from '@expo-google-fonts/manrope';
import {
  useFonts as useDMSans,
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
  DMSans_700Bold,
} from '@expo-google-fonts/dm-sans';

// În React Native fiecare grosime e o familie separată, deci nu folosim fontWeight cu ele.
export const fonts = {
  heading600: 'Manrope_600SemiBold',
  heading700: 'Manrope_700Bold',
  heading800: 'Manrope_800ExtraBold',
  body400: 'DMSans_400Regular',
  body500: 'DMSans_500Medium',
  body600: 'DMSans_600SemiBold',
  body700: 'DMSans_700Bold',
};

/** true când fonturile sunt gata (sau au eșuat: atunci aplicația folosește fontul sistemului). */
export function useAppFonts() {
  const [manropeLoaded, manropeError] = useManrope({ Manrope_600SemiBold, Manrope_700Bold, Manrope_800ExtraBold });
  const [dmLoaded, dmError] = useDMSans({ DMSans_400Regular, DMSans_500Medium, DMSans_600SemiBold, DMSans_700Bold });
  return (manropeLoaded || Boolean(manropeError)) && (dmLoaded || Boolean(dmError));
}
