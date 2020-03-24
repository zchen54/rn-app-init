// module.exports = {
//   root: true,
//   extends: '@react-native-community',
//   parser: '@typescript-eslint/parser',
//   plugins: ['@typescript-eslint'],
// };

module.exports = {
  rules: {
    'import/no-named-as-default': 0,
    'prefer-promise-reject-errors': 0,
    '@typescript-eslint/no-explicit-any': 2,
    '@typescript-eslint/class-name-casing': 2,
    'no-global-assign': 2,
    // 'array-bracket-spacing': [2, 'never'],
    // 'comma-dangle': [2, 'never'],
    // 'comma-spacing': [2, {before: false, after: true}],
    // eqeqeq: [2, 'allow-null'],
    // semi: [2, 'always'], //语句强制分号结尾
    // 'id-match': 0, //命名检测
  },
  globals: {
    __DEV__: 'readonly',
    __BUILD_INFO__: 'readonly',
  },
  parserOptions: {
    warnOnUnsupportedTypeScriptVersion: false,
  },
  settings: {
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx'],
    },
    'import/resolver': {
      typescript: {
        // "alwaysTryTypes": true // always try to resolve types under `<roo/>@types` directory even it doesn't contain any source code, like `@types/unist`
      },
    },
  },
};
