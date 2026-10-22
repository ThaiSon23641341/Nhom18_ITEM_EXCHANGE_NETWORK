import { defaultConfig } from '@tamagui/config/v6';
import { createTokens } from '@tamagui/core';
import { createTamagui } from 'tamagui';

const tokens = createTokens({
  ...defaultConfig.tokens,
  color: {
    ...defaultConfig.tokens.color,
    primary: '#2563EB',
    secondary: '#0F766E',
  },
});

export const config = createTamagui({
  ...defaultConfig,
  tokens,
  themes: {
    ...defaultConfig.themes,
    light: {
      ...defaultConfig.themes.light,
      background: '#FFFFFF',
      color: '#172033',
      primary: '#2563EB',
      secondary: '#0F766E',
    },
    dark: {
      ...defaultConfig.themes.dark,
      background: '#101827',
      color: '#F3F4F6',
      primary: '#60A5FA',
      secondary: '#5EEAD4',
    },
  },
});

type CustomConfig = typeof config;

declare module 'tamagui' {
  // Tamagui augments this interface with the app's generated config types.
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface TamaguiCustomConfig extends CustomConfig {}
}

export default config;
