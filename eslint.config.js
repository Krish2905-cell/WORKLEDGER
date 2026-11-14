import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },
  // Supabase Edge Functions run in Deno — declare Deno as a known global
  // so ESLint doesn't flag Deno.serve, Deno.env, etc. as undefined.
  {
    files: ['supabase/functions/**/*.js'],
    languageOptions: {
      globals: {
        Deno: 'readonly',
      },
    },
  },
])

