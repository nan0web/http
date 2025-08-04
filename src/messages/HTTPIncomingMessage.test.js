import { test } from 'node:test'
import assert from 'node:assert/strict'
import HTTPIncomingMessage, { HTTPMethodValidator } from './HTTPIncomingMessage.js'

test('HTTPIncomingMessage constructor', () => {
	const message = new HTTPIncomingMessage({
		method: 'POST',
		url: '/api/data',
		headers: {
			'Content-Type': 'application/json'
		},
		body: '{"name": "test"}'
	})

	assert.equal(message.method, 'POST')
	assert.equal(message.url, '/api/data')
	assert.equal(message.headers.get('Content-Type'), 'application/json')
	assert.equal(message.body, '{"name": "test"}')
})

test('HTTPIncomingMessage with default method', () => {
	const message = new HTTPIncomingMessage({
		url: '/api/test'
	})

	assert.equal(message.method, 'GET')
})

test('HTTPIncomingMessage toString method', () => {
	const message = new HTTPIncomingMessage({
		method: 'PUT',
		url: '/api/update',
		headers: {
			'Authorization': 'Bearer token123'
		},
		body: '{"id": 1, "value": "updated"}'
	})

	const str = message.toString()
	assert.match(str, /^PUT/)
	assert.match(str, /<.*\/api\/update>/)
	assert.match(str, /Authorization: Bearer token123/)
	assert.match(str, /{"id": 1, "value": "updated"}/)
})

test('HTTPIncomingMessage static from method', () => {
	const message1 = new HTTPIncomingMessage({
		method: 'PATCH',
		url: '/api/patch'
	})

	const message2 = HTTPIncomingMessage.from(message1)
	assert.equal(message1, message2)

	const message3 = HTTPIncomingMessage.from({
		method: 'DELETE',
		url: '/api/delete'
	})
	assert.equal(message3.method, 'DELETE')
	assert.equal(message3.url, '/api/delete')
})

test('HTTPMethodValidator', () => {
	assert.equal(HTTPMethodValidator('GET'), 'GET')
	assert.equal(HTTPMethodValidator('POST'), 'POST')
	assert.throws(() => HTTPMethodValidator('INVALID'), {
		message: /Enumeration must have one value of/
	})
})
