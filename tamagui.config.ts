import { defaultConfig } from '@tamagui/config/v6';
import { createTokens } from '@tamagui/core';
import { createTamagui } from 'tamagui';

const tokens = createTokens({
  ...defaultConfig.tokens,
  color: {
    ...defaultConfig.tokens.color,
    primary: '#16815D',
    secondary: '#0D6247',
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
      primary: '#16815D',
      secondary: '#0D6247',
    },
    dark: {
      ...defaultConfig.themes.dark,
      background: '#101827',
      color: '#F3F4F6',
      primary: '#4ADE80',
      secondary: '#34D399',
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
