import bruteForce from './bruteForce.js'
import { describe, suite, it } from 'node:test'
import assert from 'node:assert'
import { IncomingMessageWithBody } from '../types/IncomingMessageWithBody.js'
import { Socket } from 'node:net'

// @todo fix: test is freezing
suite("bruteForce middleware", () => {
	describe("allow", () => {
		it('bruteForce allows requests under limit', () => {
			const middleware = bruteForce({ windowMs: 1000, max: 2 })
			let nextCalled = false

			const socket = new Socket()
			const req = new IncomingMessageWithBody(socket)
			req.socket = { remoteAddress: '127.0.0.1' }
			req.url = '/test'

			middleware(req, {}, () => {
				nextCalled = true
			})

			assert(nextCalled)
		})
	})
	describe("block", () => {
		it('bruteForce blocks requests over limit', () => {
			const middleware = bruteForce({ windowMs: 1000, max: 1 })
			let nextCalled = false
			let statusCode

			const socket = new Socket()
			const req = new IncomingMessageWithBody(socket)
			req.socket = { remoteAddress: '127.0.0.1' }
			req.url = '/test'

			const res = {
				status: (code) => {
					statusCode = code
					return res
				},
				send: () => { }
			}

			// First request should pass
			middleware(req, res, () => {
				nextCalled = true
			})
			assert(nextCalled)

			// Second request should be blocked
			nextCalled = false
			middleware(req, res, () => {
				nextCalled = true
			})

			assert(!nextCalled)
			assert.equal(statusCode, 429)
		})

		it('bruteForce uses custom handler when provided', () => {
			let customHandlerCalled = false
			const middleware = bruteForce({
				windowMs: 1000,
				max: 1,
				handler: () => {
					customHandlerCalled = true
				}
			})

			const socket = new Socket()
			const req = new IncomingMessageWithBody(socket)
			req.socket = { remoteAddress: '127.0.0.1' }
			req.url = '/test'

			// First request
			middleware(req, {}, () => { })

			// Second request should trigger custom handler
			middleware(req, {}, () => { })
			assert(customHandlerCalled)
		})
	})
})

