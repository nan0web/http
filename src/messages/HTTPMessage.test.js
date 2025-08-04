import { test } from 'node:test'
import { strict as assert } from 'node:assert'
import HTTPMessage from './HTTPMessage.js'

test('HTTPMessage constructor', () => {
	const message = new HTTPMessage({
		url: '/api/test',
		headers: {
			'Content-Type': 'application/json'
		},
		body: '{"test": true}'
	})

	assert.equal(message.url, '/api/test')
	assert.equal(message.headers.get('Content-Type'), 'application/json')
	assert.equal(message.body, '{"test": true}')
})

test('HTTPMessage toString method', () => {
	const message = new HTTPMessage({
		url: '/api/test',
		headers: {
			'Content-Type': 'application/json'
		},
		body: '{"test": true}'
	})

	const str = message.toString()
	assert.match(str, /<.*\/api\/test>/)
	assert.match(str, /Content-Type: application\/json/)
	assert.match(str, /{"test": true}/)
})

test('HTTPMessage static from method', () => {
	const message1 = new HTTPMessage({
		url: '/api/test'
	})

	const message2 = HTTPMessage.from(message1)
	assert.equal(message1, message2)

	const message3 = HTTPMessage.from({
		url: '/api/data'
	})
	assert.equal(message3.url, '/api/data')
})
