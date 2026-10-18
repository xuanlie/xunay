export default [
  {
    files: ['**/*.js', '**/*.mjs', '**/*.xuy'],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      globals: {
        window: 'readonly', document: 'readonly', navigator: 'readonly',
        console: 'readonly', fetch: 'readonly', WebSocket: 'readonly',
        location: 'readonly', history: 'readonly', localStorage: 'readonly',
        setTimeout: 'readonly', clearTimeout: 'readonly',
        setInterval: 'readonly', clearInterval: 'readonly',
        requestAnimationFrame: 'readonly', performance: 'readonly',
        URL: 'readonly', URLSearchParams: 'readonly', Blob: 'readonly',
        TextDecoder: 'readonly', TextEncoder: 'readonly'
      }
    },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'no-undef': 'error',
      'no-empty': ['error', { allowEmptyCatch: true }]
    }
  },
  { ignores: ['dist/**', 'node_modules/**'] }
]
