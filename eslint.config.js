module.exports = [
  {
    ignores: ['.expo/**', 'dist/**'],
  },
  ...require('eslint-config-expo/flat'),
  {
    files: ['server/**/*.cjs'],
    languageOptions: {
      globals: require('globals').node,
    },
  },
];