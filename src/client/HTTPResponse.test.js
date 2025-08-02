import { describe, it, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert'
import { Readable } from 'node:stream'
import HTTPResponse from './HTTPResponse.js'

/**
 * @param {string} text
 * @returns {Readable}
 */
function createStream(text) {
	const stream = new Readable({
		read() {
			this.push(text)
			this.push(null)
		}
	})
	return stream
}

describe('HTTPResponse', () => {
	let controller

	beforeEach(() => {
		controller = new AbortController()
	})

	afterEach(() => {
		controller.abort()
	})

	it('should handle Buffer body', async () => {
		const res = new HTTPResponse(Buffer.from('test'), {
			status: 200,
			signal: controller.signal
		})

		const text = await res.text()
		assert.strictEqual(text, 'test')

		assert.strictEqual(res.status, 200)
		assert.strictEqual(res.statusText, 'OK')
		assert.strictEqual(res.ok, true)
	})

	it('should handle Stream body', async () => {
		const res = new HTTPResponse(createStream('{"a":1}'), {
			status: 201,
			statusText: 'Created',
			signal: controller.signal
		})

		const text = await res.text()
		assert.strictEqual(text, '{"a":1}')

		const json = JSON.parse(text)
		assert.deepStrictEqual(json, { a: 1 })

		assert.strictEqual(res.status, 201)
		assert.strictEqual(res.statusText, 'Created')
		assert.strictEqual(res.ok, true)
	})

	it('should handle Object body', async () => {
		const res = new HTTPResponse({ a: 1 }, {
			headers: { 'content-type': 'application/json' },
			signal: controller.signal
		})

		const text = await res.text()
		assert.strictEqual(text, '{"a":1}')

		const jsonRes = new HTTPResponse({ a: 1 }, {
			headers: { 'content-type': 'application/json' },
			signal: controller.signal
		})
		const json = await jsonRes.json()
		assert.deepStrictEqual(json, { a: 1 })

		assert.strictEqual(res.status, 200)
		assert.strictEqual(res.statusText, 'OK')
		assert.strictEqual(res.ok, true)
	})

	it('should handle String body', async () => {
		const res = new HTTPResponse('test', {
			type: 'cors',
			url: 'https://example.com',
			signal: controller.signal
		})

		const text = await res.text()
		assert.strictEqual(text, 'test')

		assert.strictEqual(res.status, 200)
		assert.strictEqual(res.statusText, 'OK')
		assert.strictEqual(res.type, 'cors')
		assert.strictEqual(res.url, 'https://example.com')
		assert.strictEqual(res.ok, true)
	})

	it('should throw when streaming non-stream body', async () => {
		const res = new HTTPResponse('test', { signal: controller.signal })
		assert.throws(() => res.stream(), /Response body is not a stream/)
	})

	it('should properly capitalize headers', async () => {
		const res = new HTTPResponse(null, {
			headers: { 'content-type': 'text/plain', 'x-custom-header': 'value' },
			signal: controller.signal
		})
		assert.strictEqual(res.headers.get('Content-Type'), 'text/plain')
		assert.strictEqual(res.headers.get('X-Custom-Header'), 'value')
	})

	it('should throw when consuming body multiple times', async () => {
		const res = new HTTPResponse('test')

		// First consumption should work
		const text1 = await res.text()
		assert.strictEqual(text1, 'test')

		// Second consumption should throw
		await assert.rejects(async () => {
			await res.text()
		}, /Body has already been consumed/)
	})
})
