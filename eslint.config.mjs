import js from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier/flat';

export default [
  js.configs.recommended,
  eslintConfigPrettier, // обязательно последним элементом — отключает правила, конфликтующие с Prettier
];
