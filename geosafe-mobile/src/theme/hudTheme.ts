import { Platform, ViewStyle, TextStyle } from 'react-native';

export const HUD_COLORS = {
  canvas: '#F9F8F6',
  surfaceDark: '#121212',
  surfaceCard: '#FFFFFF',
  borderBlack: '#000000',
  clay: '#C85A32',
  textBlack: '#000000',
  textMuted: '#525252',
  textLight: '#F9F8F6',
  textMutedLight: '#A3A3A3',
  riskLow: '#10B981',
  riskLowLight: '#ECFDF5',
  riskMod: '#F59E0B',
  riskModLight: '#FFFBEB',
  riskHigh: '#DC2626',
  riskHighLight: '#FEF2F2',
};

export const HUD_FONTS = {
  mono: Platform.select({
    web: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace',
    default: 'monospace',
  }),
  serif: Platform.select({
    web: '"Playfair Display", Georgia, Cambria, "Times New Roman", serif',
    default: 'serif',
  }),
  display: Platform.select({
    web: 'Impact, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    default: 'sans-serif',
  }),
};

export const HUD_SHADOWS = {
  hardSm: {
    shadowColor: '#000000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
    ...(Platform.OS === 'web' ? { boxShadow: '2px 2px 0px 0px #000000' } : {}),
  } as ViewStyle,
  hard: {
    shadowColor: '#000000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
    ...(Platform.OS === 'web' ? { boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)' } : {}),
  } as ViewStyle,
  hardLg: {
    shadowColor: '#000000',
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
    ...(Platform.OS === 'web' ? { boxShadow: '6px 6px 0px 0px rgba(0,0,0,1)' } : {}),
  } as ViewStyle,
  hardClay: {
    shadowColor: '#C85A32',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
    ...(Platform.OS === 'web' ? { boxShadow: '4px 4px 0px 0px #C85A32' } : {}),
  } as ViewStyle,
  hardWhite: {
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
    ...(Platform.OS === 'web' ? { boxShadow: '4px 4px 0px 0px #FFFFFF' } : {}),
  } as ViewStyle,
};
