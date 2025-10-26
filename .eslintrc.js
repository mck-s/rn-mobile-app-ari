/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  env: {
    es2022: true,
    node: true,
    jest: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: { jsx: true },
    ecmaVersion: 'latest',
    sourceType: 'module',
    // No "project" field so linting stays fast and simple
  },
  settings: {
    react: { version: 'detect' },
    'import/resolver': {
      typescript: {
        // so eslint can resolve TS paths if you add them later
        alwaysTryTypes: true,
      },
    },
  },
  plugins: ['@typescript-eslint', 'react', 'react-hooks', 'react-native', 'import', 'prettier'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:react-native/all',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'plugin:prettier', // shows Prettier issues as ESLint problems
    'prettier', // turns off ESLint formatting rules that conflict with Prettier
  ],
  rules: {
    // RN / Expo niceties
    'react/react-in-jsx-scope': 'off',
    'react-native/no-inline-styles': 'off', // turn to 'warn' later if you like
    'react/prop-types': 'off',

    // Imports
    'import/order': [
      'warn',
      {
        'newlines-between': 'always',
        groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
        alphabetize: { order: 'asc', caseInsensitive: true },
      },
    ],

    // TypeScript
    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      },
    ],

    // Prettier as source of truth for formatting
    'prettier/prettier': 'warn',
  },
  overrides: [
    {
      files: ['*.js'],
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
      },
    },
  ],
};
