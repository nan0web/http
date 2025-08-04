import { test } from 'node:test'
import { strict as assert } from 'node:assert'
import HTTPHeaders from './HTTPHeaders.js'

test('HTTPHeaders constructor with object', () => {
	const headers = new HTTPHeaders({
		'Content-Type': 'application/json',
		'Authorization': 'Bearer token'
	})

	assert.equal(headers.size, 2)
	assert.equal(headers.get('Content-Type'), 'application/json')
	assert.equal(headers.get('Authorization'), 'Bearer token')
})

test('HTTPHeaders constructor with array', () => {
	const headers = new HTTPHeaders([
		['Content-Type', 'application/json'],
		['Authorization', 'Bearer token']
	])

	assert.equal(headers.size, 2)
	assert.equal(headers.get('Content-Type'), 'application/json')
	assert.equal(headers.get('Authorization'), 'Bearer token')
})

test('HTTPHeaders constructor with string', () => {
	const headers = new HTTPHeaders('Content-Type: application/json\nAuthorization: Bearer token')

	assert.equal(headers.size, 2)
	assert.equal(headers.get('Content-Type'), 'application/json')
	assert.equal(headers.get('Authorization'), 'Bearer token')
})

test('HTTPHeaders methods', () => {
	const headers = new HTTPHeaders()

	// has method
	assert.equal(headers.has('Content-Type'), false)

	// set method
	headers.set('Content-Type', 'text/plain')
	assert.equal(headers.has('Content-Type'), true)
	assert.equal(headers.get('Content-Type'), 'text/plain')

	// delete method
	assert.equal(headers.delete('Content-Type'), true)
	assert.equal(headers.has('Content-Type'), false)

	// toString method
	headers.set('accept', 'application/json')
	headers.set('user-agent', 'nanoweb-http')
	const str = headers.toString()
	assert.match(str, /Accept: application\/json/)
	assert.match(str, /User-Agent: nanoweb-http/)
})

test('HTTPHeaders static from method', () => {
	const headers1 = HTTPHeaders.from({
		'Content-Type': 'application/json'
	})

	const headers2 = HTTPHeaders.from(headers1)
	assert.equal(headers1, headers2)

	const headers3 = HTTPHeaders.from([
		['Authorization', 'Bearer token']
	])
	assert.equal(headers3.get('Authorization'), 'Bearer token')
})
