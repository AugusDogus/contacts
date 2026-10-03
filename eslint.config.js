import stylex from '@stylexjs/eslint-plugin';
import tseslint from 'typescript-eslint';

export default [
  {
    files: ['src/**/*.stylex.ts'],
    languageOptions: { parser: tseslint.parser },
    plugins: { '@stylexjs': stylex },
    rules: {
      '@stylexjs/valid-styles': 'error',
      '@stylexjs/valid-shorthands': 'error',
      '@stylexjs/no-unused': 'error'
    }
  }
];
