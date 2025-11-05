module.exports = {
  root: true,
  extends: ['@nuxtjs/eslint-config-typescript'],
  rules: {
    // Disable unused vars check entirely for Vue SFC (handled by Vetur/Volar)
    '@typescript-eslint/no-unused-vars': 'off',
    'no-unused-vars': 'off',
    // Allow console for development
    'no-console': 'off',
    // Disable camelcase for database field names (snake_case)
    'camelcase': 'off'
  }
}
