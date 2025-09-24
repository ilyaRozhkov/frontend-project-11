// import globals from 'globals';

// import path from 'path';
// import { fileURLToPath } from 'url';
// import { FlatCompat } from '@eslint/eslintrc';
// import pluginJs from '@eslint/js';
// import importPlugin from 'eslint-plugin-import';

// // mimic CommonJS variables -- not needed if using CommonJS
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
// const compat = new FlatCompat({
//   baseDirectory: __dirname,
//   recommendedConfig: pluginJs.configs.recommended,
// });

// export default [
//   {
//     languageOptions: {
//       globals: {
//         ...globals.node,
//         ...globals.jest,
//         ...globals.browser,
//       },
//       parserOptions: {
//         // Eslint doesn't supply ecmaVersion in `parser.js` `context.parserOptions`
//         // This is required to avoid ecmaVersion < 2015 error or 'import' / 'export' error
//         ecmaVersion: 'latest',
//         sourceType: 'module',
//       },
//     },
//     plugins: { import: importPlugin },
//     rules: {
//       ...importPlugin.configs.recommended.rules,
//     },
//   },
//   ...compat.extends('airbnb-base'),
//   {
//     rules: {
//       // 'object-curly-newline': 'off',
//       'no-underscore-dangle': [
//         'error',
//         {
//           allow: ['__filename', '__dirname'],
//         },
//       ],
//       'import/extensions': [
//         'error',
//         {
//           js: 'always',
//         },
//       ],
//       'import/no-named-as-default': 'off',
//       'import/no-named-as-default-member': 'off',
//       'no-console': 'off',
//       'import/no-extraneous-dependencies': 'off',
//     },
//   },
// ];

import js from '@eslint/js';
import globals from 'globals';
import { defineConfig } from 'eslint/config';
// import stylistic from '@stylistic/eslint-plugin';

export default defineConfig([
  // 1. Стилистические правила
  // stylistic.configs.recommended,

  // 2. Базовые правила для JS файлов
  {
    files: ['**/*.{js,mjs,cjs}'], // Все JS файлы
    plugins: { js },
    extends: ['js/recommended'], // Рекомендуемые правила
  },

  // 3. Глобальные переменные
  {
    files: ['**/*.{js,mjs,cjs}'],
    languageOptions: {
      globals: {
        ...globals.browser, // window, document, etc.
        process: 'readonly', // Переменная process (для Node.js)
      },
    },
  },
]);
