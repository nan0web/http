import js from '@eslint/js'
import globals from 'globals'

export default [
	{ ignores: ['dist'] },
	{
		files: ['**/*.{js}'],
		languageOptions: {
			ecmaVersion: 'latest',
			globals: globals.browser,
			parserOptions: {
				ecmaVersion: 'latest',
				sourceType: 'module',
			},
		},
		rules: {
			...js.configs.recommended.rules,
		},
	},
]