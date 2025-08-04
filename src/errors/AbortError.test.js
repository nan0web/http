import { test } from 'node:test'
import { strict as assert } from 'node:assert'
import AbortError from './AbortError.js'

test('AbortError', () => {
	const error = new AbortError()
	assert.equal(error.name, 'AbortError')
	assert.equal(error.message, 'Request aborted')

	const customError = new AbortError('Custom abort message')
	assert.equal(customError.name, 'AbortError')
	assert.equal(customError.message, 'Custom abort message')
})
