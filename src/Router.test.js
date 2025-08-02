import { test } from 'node:test'
import assert from 'node:assert'
import Router from './Router.js'
import { IncomingMessageWithBody } from './types/IncomingMessageWithBody.js'
import { ServerResponse } from 'http'
import { Socket } from 'net'

test('Router matches parameter routes', () => {
	const router = new Router()
	let capturedParams = null

	router.get('/users/:id', (req) => {
		capturedParams = req.params
	})

	const socket = new Socket()
	const mockReq = new IncomingMessageWithBody(socket)
	mockReq.method = 'GET'
	mockReq.url = '/users/123'

	const mockRes = new ServerResponse(mockReq)

	router.handle(mockReq, mockRes, () => { })
	assert.deepEqual(capturedParams, { id: '123' })
})

test('Router matches wildcard routes', () => {
	const router = new Router()
	let capturedUrl = null

	router.get('/files/*', (req) => {
		capturedUrl = req.url
	})

	const mockReq = { method: 'GET', url: '/files/docs/readme.txt' }
	const mockRes = { end: () => { } }

	router.handle(mockReq, mockRes, () => { })
	assert.equal(capturedUrl, '/files/docs/readme.txt')
})

test('Router calls notFoundHandler for unmatched routes', () => {
	const router = new Router()
	let notFoundCalled = false

	const mockReq = { method: 'GET', url: '/not-found' }
	const mockRes = { end: () => { } }

	router.handle(mockReq, mockRes, () => {
		notFoundCalled = true
	})

	assert(notFoundCalled)
})

test('Router executes middlewares in order', async () => {
	const router = new Router()
	const calls = []

	router.use(async (req, res, next) => {
		calls.push('middleware 1 start')
		await next()
		calls.push('middleware 1 end')
	})

	router.use(async (req, res, next) => {
		calls.push('middleware 2 start')
		await next()
		calls.push('middleware 2 end')
	})

	router.get('/test', () => calls.push('route handler'))

	const mockReq = { method: 'GET', url: '/test' }
	const mockRes = { end: () => {} }

	await router.handle(mockReq, mockRes, () => {})
	assert.deepEqual(calls, [
		'middleware 1 start',
		'middleware 2 start',
		'route handler',
		'middleware 2 end',
		'middleware 1 end'
	])
})

test('Router middleware can modify request', async () => {
	const router = new Router()
	let modifiedValue = null

	router.use((req, res, next) => {
		req.customValue = 'modified'
		next()
	})

	router.get('/test', (req) => {
		modifiedValue = req.customValue
	})

	const mockReq = { method: 'GET', url: '/test' }
	const mockRes = { end: () => {} }

	await router.handle(mockReq, mockRes, () => {})
	assert.equal(modifiedValue, 'modified')
})

test('Router middleware can short-circuit requests', async () => {
	const router = new Router()
	let handlerCalled = false

	router.use((req, res, next) => {
		res.end('stopped by middleware')
	})

	router.get('/test', () => {
		handlerCalled = true
	})

	const mockReq = { method: 'GET', url: '/test' }
	let responseEnded = false
	const mockRes = {
		end: (data) => {
			responseEnded = data
		}
	}

	await router.handle(mockReq, mockRes, () => {})
	assert.equal(responseEnded, 'stopped by middleware')
	assert.equal(handlerCalled, false)
})

test('Router applies middlewares to not found handler', async () => {
	const router = new Router()
	const calls = []

	router.use((req, res, next) => {
		calls.push('middleware')
		next()
	})

	let notFoundCalled = false
	const notFoundHandler = () => {
		notFoundCalled = true
	}

	const mockReq = { method: 'GET', url: '/not-found' }
	const mockRes = { end: () => {} }

	await router.handle(mockReq, mockRes, notFoundHandler)
	assert.equal(calls[0], 'middleware')
	assert.equal(notFoundCalled, true)
})
