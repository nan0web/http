import { describe, test, expect, beforeEach } from 'vitest'
import Router from '../lib/Router.js'
import ServerResponse from '../lib/ServerResponse.js'
import { ClientRequest, ServerResponse as NodeServerResponse } from 'node:http'

/**
 * # Router class for handling routes and middleware similar to express
 */
describe('Router', () => {
	let router

	beforeEach(() => {
		router = new Router()
	})

	/**
	 * ## Test middleware registration and execution
	 */
	describe('use', () => {
		test('should register middleware', () => {
			const middleware = (req, res, next) => next()
			router.use(middleware)
			expect(router.middlewares.length).toBe(1)
		})

		test.skip('should execute middleware in order', async () => {
			const middleware1 = (req, res, next) => {
				req.test = 1
				next()
			}
			const middleware2 = async (req, res, next) => {
				middlewareOrder.push('middleware2')
				await new Promise(resolve => setTimeout(resolve, 99))
				next()
			}

			router.use(middleware1)
			router.use(middleware2)

			const req = { test: 0, url: '/test', method: 'GET', headers: { host: 'localhost' } }
			const origReq = new ClientRequest(req)
			const origRes = new NodeServerResponse(origReq)
			const res = new ServerResponse(origRes)

			await router.handle(req, res, () => { })
			expect(req.test).toBe(2)
		})
	})

	/**
	 * Test route registration and matching
	 */
	describe('route', () => {
		test('should register routes', () => {
			router.route('GET', '/test', () => { })
			expect(router.routes.size).toBe(1)
		})

		test('should match exact routes', () => {
			router.route('GET', '/test', () => { })
			const match = router.match('GET', '/test')
			expect(match).toBeDefined()
		})

		test('should match parameterized routes', () => {
			router.route('GET', '/user/:id', () => { })
			const match = router.match('GET', '/user/123')
			expect(match).toBeDefined()
			expect(match.params.id).toBe('123')
		})

		test('should not match different methods', () => {
			router.route('GET', '/test', () => { })
			const match = router.match('POST', '/test')
			expect(match).toBeNull()
		})
	})

	/**
	 * Test convenience HTTP method functions
	 */
	describe('HTTP method helpers', () => {
		test('should register routes using GET helper', () => {
			router.get('/test', () => { })
			expect(router.routes.size).toBe(1)
		})

		test('should register routes using POST helper', () => {
			router.post('/test', () => { })
			expect(router.routes.size).toBe(1)
		})

		test('should register routes using PUT helper', () => {
			router.put('/test', () => { })
			expect(router.routes.size).toBe(1)
		})

		test('should register routes using DELETE helper', () => {
			router.delete('/test', () => { })
			expect(router.routes.size).toBe(1)
		})

		test('should register routes using PATCH helper', () => {
			router.patch('/test', () => { })
			expect(router.routes.size).toBe(1)
		})

		test('should register routes using HEAD helper', () => {
			router.head('/test', () => { })
			expect(router.routes.size).toBe(1)
		})

		test('should register routes using OPTIONS helper', () => {
			router.options('/test', () => { })
			expect(router.routes.size).toBe(1)
		})
	})

	/**
	 * Test request handling with middleware and routes
	 */
	describe('handle', () => {
		test('should execute middleware and route handlers', async () => {
			const middleware = (req, res, next) => {
				req.test = true
				next()
			}

			const handler = (req, res) => {
				res.send('handled')
			}

			router.use(middleware)
			router.get('/test', handler)

			const req = { url: '/test', method: 'GET', headers: { host: 'localhost' } }
			const origReq = new ClientRequest(req)
			const origRes = new NodeServerResponse(origReq)
			const res = new ServerResponse(origRes)

			await router.handle(req, res, () => { })
			expect(req.test).toBe(true)
			expect(res.statusCode).toBe(200)
		})

		test('should handle 404 when no route matches', async () => {
			const req = { url: '/nonexistent', method: 'GET', headers: { host: 'localhost' } }
			const origReq = new ClientRequest(req)
			const origRes = new NodeServerResponse(origReq)
			const res = new ServerResponse(origRes)

			await router.handle(req, res, (req, res) => {
				res.status(404).send('Not Found')
			})

			expect(res.statusCode).toBe(404)
		})

		test('should handle errors in middleware', async () => {
			const middleware = (req, res, next) => {
				throw new Error('Middleware error')
			}

			router.use(middleware)

			const req = { url: '/test', method: 'GET', headers: { host: 'localhost' } }
			const origReq = new ClientRequest(req)
			const origRes = new NodeServerResponse(origReq)
			const res = new ServerResponse(origRes)

			await router.handle(req, res, () => { })
			expect(res.statusCode).toBe(500)
		})

		test('should handle errors in route handlers', async () => {
			const handler = (req, res, next) => {
				throw new Error('Handler error')
			}

			router.get('/test', handler)

			const req = { url: '/test', method: 'GET', headers: { host: 'localhost' } }
			const origReq = new ClientRequest(req)
			const origRes = new NodeServerResponse(origReq)
			const res = new ServerResponse(origRes)

			await router.handle(req, res, () => { })
			expect(res.statusCode).toBe(500)
		})

		test.skip('should run all middlewares before routes and handle errors', async () => {
			// Track middleware execution order
			const middlewareOrder = []
			const middleware1 = (req, res, next) => {
				middlewareOrder.push('middleware1')
				next()
			}
			const middleware2 = async (req, res, next) => {
				middlewareOrder.push('middleware2')
				try {
					// await new Promise(resolve => setTimeout(resolve, 99))
					next()
				} catch (error) {
					next(error)
				}
			}
			const errorMiddleware = (req, res, next) => {
				middlewareOrder.push('errorMiddleware')
				throw new Error('Middleware error')
			}
			const handler = (req, res) => {
				middlewareOrder.push('handler')
				res.send('handled')
			}

			router.use(middleware1)
			router.use(middleware2)
			router.use(errorMiddleware)
			router.get('/test', handler)

			const req = { url: '/test', method: 'GET', headers: { host: 'localhost' } }
			const origReq = new ClientRequest(req)
			const origRes = new NodeServerResponse(origReq)
			const res = new ServerResponse(origRes)

			await router.handle(req, res, () => { })
			// expect(res.statusCode).toBe(500)
			expect(middlewareOrder).toEqual(['middleware1', 'middleware2', 'errorMiddleware', 'handler'])
			// Handler should not be called since error occurred in middleware
			expect(middlewareOrder.includes('handler')).toBe(false)
		})
	})

	/**
	 * Test route matching patterns
	 */
	describe('route matching', () => {
		test('should match exact paths', () => {
			router.route('GET', '/test', () => { })
			expect(router.match('GET', '/test')).toBeDefined()
			expect(router.match('GET', '/test/')).toBeDefined()
		})

		test('should match parameterized routes', () => {
			router.route('GET', '/user/:id', () => { })
			const match = router.match('GET', '/user/123')
			expect(match).toBeDefined()
			expect(match.params.id).toBe('123')
		})

		test('should match multiple parameters', () => {
			router.route('GET', '/user/:id/:action', () => { })
			const match = router.match('GET', '/user/123/profile')
			expect(match).toBeDefined()
			expect(match.params.id).toBe('123')
			expect(match.params.action).toBe('profile')
		})

		test('should match optional parameters', () => {
			router.route('GET', '/test/:id?', () => { })
			expect(router.match('GET', '/test')).toBeDefined()
			expect(router.match('GET', '/test/123')).toBeDefined()
		})

		test('should match wildcards', () => {
			router.route('GET', '/test/*', () => { })
			expect(router.match('GET', '/test')).toBeDefined()
			expect(router.match('GET', '/test/123')).toBeDefined()
			expect(router.match('GET', '/test/123/456')).toBeDefined()
		})
	})
})