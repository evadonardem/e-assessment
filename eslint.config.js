import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import react from 'eslint-plugin-react'

export default [
  js.configs.recommended,
  {
    files: ['resources/js/**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      react,
      'react-hooks': reactHooks,
    },
    rules: {
      // ─── React ───────────────────────────────────────────
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      'react/self-closing-comp': 'warn',           // <Foo></Foo> → <Foo />
      'react/jsx-curly-brace-presence': ['warn', { // removes unnecessary {'string'}
        props: 'never',
        children: 'never',
      }],
      'react/jsx-boolean-value': ['warn', 'never'], // foo={true} → foo
      'react/jsx-no-useless-fragment': 'warn',      // removes empty fragments

      // ─── Variables ───────────────────────────────────────
      'no-var': 'error',                // var → let/const
      'prefer-const': 'warn',           // let → const when never reassigned
      'no-unused-vars': ['warn', {
        vars: 'all',
        args: 'after-used',
        ignoreRestSiblings: true,
      }],

      // ─── Code Style (auto-fixable) ───────────────────────
      'eqeqeq': ['warn', 'always'],     // == → ===
      'no-extra-semi': 'warn',          // removes extra semicolons
      'no-extra-boolean-cast': 'warn',  // !!bool → bool
      'no-useless-rename': 'warn',      // { a: a } → { a }
      'object-shorthand': 'warn',       // { a: a } → { a }
      'prefer-template': 'warn',        // 'hello ' + name → `hello ${name}`
      'prefer-arrow-callback': 'warn',  // function() → () =>
      'arrow-body-style': ['warn',      // () => { return x } → () => x
        'as-needed'],
      'no-lonely-if': 'warn',           // else { if } → else if
      'yoda': 'warn',                   // 'red' === color → color === 'red'

      // ─── Imports ─────────────────────────────────────────
      'no-duplicate-imports': 'warn',   // merges duplicate import statements
    },
    settings: {
      react: { version: 'detect' },
    },
  },
]
