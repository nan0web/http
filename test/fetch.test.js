import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { createServer } from 'node:http'
import fetch, { httpMethods, NodeResponse, APIRequest } from '../lib/fetch.js'
const { get, post, put, delete: del, patch, head, options } = httpMethods
import { Buffer } from 'node:buffer'

let server
let baseUrl

beforeAll(() => {
	server = createServer((req, res) => {
		const { method, url } = req

		if (method === 'GET' && url === '/json') {
			Object.entries(req.headers).forEach(([key, value]) => res.setHeader(key, value))
			res.writeHead(200, { 'Content-Type': 'application/json' })
			res.end(JSON.stringify({ message: 'Hello, World!' }))
		} else if (method === 'POST' && url === '/echo') {
			let body = ''
			req.on('data', chunk => body += chunk)
			req.on('end', () => {
				res.writeHead(201, { 'Content-Type': 'application/json' })
				res.end(body)
			})
		} else if (method === 'PUT' && url === '/update') {
			res.writeHead(200, { 'Content-Type': 'application/json' })
			res.end(JSON.stringify({ status: 'updated' }))
		} else if (method === 'DELETE' && url === '/delete') {
			res.writeHead(204)
			res.end()
		} else if (method === 'PATCH' && url === '/patch') {
			res.writeHead(200, { 'Content-Type': 'application/json' })
			res.end(JSON.stringify({ patched: true }))
		} else if (method === 'HEAD' && url === '/head') {
			res.writeHead(200, { 'Content-Length': '123' })
			res.end()
		} else if (method === 'OPTIONS' && url === '/options') {
			res.writeHead(200, {
				'Allow': 'GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS'
			})
			res.end()
		} else if (url === '/binary') {
			res.writeHead(200, { 'Content-Type': 'application/octet-stream' })
			res.end(Buffer.from([0x00, 0xff, 0x12]))
		} else if (url === '/stream') {
			res.writeHead(200, { 'Content-Type': 'text/plain' })
			res.write('chunk1')
			setTimeout(() => res.write('chunk2'), 50)
			setTimeout(() => res.end('chunk3'), 100)
		} else if (method === 'GET' && url === '/api/test') {
			res.writeHead(200, { 'Content-Type': 'application/json' })
			res.end(JSON.stringify({ endpoint: 'test' }))
		} else if (method === 'POST' && url === '/api/submit') {
			let body = ''
			req.on('data', chunk => body += chunk)
			req.on('end', () => {
				res.writeHead(201, { 'Content-Type': 'application/json' })
				res.end(body)
			})
		} else if (method === 'GET' && url === '/slow') {
			setTimeout(() => {
				res.writeHead(200, { 'Content-Type': 'application/json' })
				res.end(JSON.stringify({ message: 'Slow response' }))
			}, 500)
		} else {
			res.writeHead(404)
			res.end('Not Found')
		}
	})

	return new Promise(resolve => {
		server.listen(0, 'localhost', () => {
			const { port } = server.address()
			baseUrl = `http://localhost:${port}`
			resolve()
		})
	})
})

afterAll(() => {
	server.close()
})

describe('fetch and HTTP Methods', () => {
	describe('NodeResponse', () => {
		it('handles JSON body correctly', async () => {
			const body = Buffer.from(JSON.stringify({ key: 'value' }))
			const res = new NodeResponse(body, { status: 200, type: 'json' })
			expect(await res.json()).toEqual({ key: 'value' })
			expect(await res.text()).toBe('{"key":"value"}')
		})

		it('handles binary body correctly', async () => {
			const body = Buffer.from([0x00, 0xff])
			const res = new NodeResponse(body, { status: 200, type: 'binary' })
			const buffer = await res.arrayBuffer()
			expect(buffer).toEqual(body)
			expect(buffer.length).toBe(2)
		})

		it('handles text body correctly', async () => {
			const body = Buffer.from('Hello')
			const res = new NodeResponse(body, { status: 200 })
			expect(await res.text()).toBe('Hello')
		})

		it('throws error for non-stream body with stream()', () => {
			const res = new NodeResponse(Buffer.from('test'))
			expect(() => res.stream()).toThrow('Response body is not a stream')
		})
	})

	describe('fetch', () => {
		it('fetches JSON with GET', async () => {
			const res = await fetch(`${baseUrl}/json`, { type: 'json' })
			expect(res.ok).toBe(true)
			expect(res.status).toBe(200)
			expect(res.statusText).toBe('OK')
			expect(await res.json()).toEqual({ message: 'Hello, World!' })
		})

		it('handles POST with JSON body', async () => {
			const body = { data: 'test' }
			const res = await fetch(`${baseUrl}/echo`, {
				method: 'POST',
				body,
				type: 'json'
			})
			expect(res.status).toBe(201)
			expect(res.statusText).toBe('Created')
			expect(await res.json()).toEqual(body)
		})

		it('fetches binary data', async () => {
			const res = await fetch(`${baseUrl}/binary`, { type: 'binary' })
			const buffer = await res.arrayBuffer()
			expect(buffer).toEqual(Buffer.from([0x00, 0xff, 0x12]))
			expect(res.status).toBe(200)
		})

		it('streams data with sockets type', async () => {
			const res = await fetch(`${baseUrl}/stream`, { type: 'sockets' })
			const stream = res.stream()
			let data = ''
			await new Promise(resolve => {
				stream.on('data', chunk => data += chunk.toString())
				stream.on('end', resolve)
			})
			expect(data).toBe('chunk1chunk2chunk3')
			expect(res.status).toBe(200)
		})

		it('handles 404 errors', async () => {
			const res = await fetch(`${baseUrl}/not-found`)
			expect(res.ok).toBe(false)
			expect(res.status).toBe(404)
			expect(res.statusText).toBe('Not Found')
		})
	})

	describe('HTTP Method Wrappers', () => {
		it('get fetches JSON', async () => {
			const res = await get(`${baseUrl}/json`, { type: 'json' })
			expect(res.status).toBe(200)
			expect(await res.json()).toEqual({ message: 'Hello, World!' })
		})

		it('post sends and receives JSON', async () => {
			const body = { key: 'value' }
			const res = await post(`${baseUrl}/echo`, body, { type: 'json' })
			expect(res.status).toBe(201)
			expect(await res.json()).toEqual(body)
		})

		it('put updates data', async () => {
			const res = await put(`${baseUrl}/update`, { key: 'updated' }, { type: 'json' })
			expect(res.status).toBe(200)
			expect(await res.json()).toEqual({ status: 'updated' })
		})

		it('delete removes resource', async () => {
			const res = await del(`${baseUrl}/delete`)
			expect(res.status).toBe(204)
			expect(res.statusText).toBe('No Content')
			expect(await res.text()).toBe('')
		})

		it('patch modifies resource', async () => {
			const res = await patch(`${baseUrl}/patch`, { patch: true }, { type: 'json' })
			expect(res.status).toBe(200)
			expect(await res.json()).toEqual({ patched: true })
		})

		it('head retrieves headers', async () => {
			const res = await head(`${baseUrl}/head`)
			expect(res.status).toBe(200)
			expect(res.headers.get('Content-Length')).toBe('123')
			expect(await res.text()).toBe('')
		})

		it('options retrieves allowed methods', async () => {
			const res = await options(`${baseUrl}/options`)
			expect(res.status).toBe(200)
			expect(res.headers.get('Allow')).toContain('GET')
			expect(res.headers.get('Allow')).toContain('POST')
		})
	})

	describe.skip('External API (httpbin.org)', () => {
		it('fetches JSON via GET', async () => {
			const res = await get('https://httpbin.org/get', { type: 'json' })
			expect(res.ok).toBe(true)
			expect(res.status).toBe(200)
			const json = await res.json()
			expect(json.url).toBe('https://httpbin.org/get')
		})

		it('posts JSON to httpbin', async () => {
			const body = { test: 'data' }
			const res = await post('https://httpbin.org/post', body, { type: 'json' })
			expect(res.status).toBe(200)
			const json = await res.json()
			expect(json.json).toEqual(body)
		})

		it('fetches with HTTP/2', async () => {
			const res = await get('https://httpbin.org/get', { protocol: 'http2', type: 'json' })
			expect(res.status).toBe(200)
			const json = await res.json()
			expect(json.url).toBe('https://httpbin.org/get')
		})
	})

	describe('Error Handling', () => {
		it('rejects on network error', async () => {
			await expect(fetch('http://localhost:9999')).rejects.toThrow()
		})
	})

	describe('APIRequest', () => {
		it('constructs with base URL and default headers', async () => {
			const api = new APIRequest(baseUrl, { 'X-Test-Header': 'test' })
			const res = await api.get('/json')
			expect(res.status).toBe(200)
			expect(res.headers.get('X-Test-Header')).toBe('test')
			expect(await res.json()).toEqual({ message: 'Hello, World!' })
		})

		it('handles GET requests with path', async () => {
			const api = new APIRequest(`${baseUrl}/api/`)
			const res = await api.get('test')
			expect(res.status).toBe(200)
			expect(await res.json()).toEqual({ endpoint: 'test' })
		})

		it('handles POST requests with body', async () => {
			const api = new APIRequest(`${baseUrl}/api/`)
			const body = { data: 'submitted' }
			const res = await api.post('submit', body)
			expect(res.status).toBe(201)
			expect(await res.json()).toEqual(body)
		})

		it('handles PUT requests with body', async () => {
			const api = new APIRequest(baseUrl)
			const res = await api.put('/update', { key: 'updated' })
			expect(res.status).toBe(200)
			expect(await res.json()).toEqual({ status: 'updated' })
		})

		it('handles PATCH requests with body', async () => {
			const api = new APIRequest(baseUrl)
			const res = await api.patch('/patch', { patch: true })
			expect(res.status).toBe(200)
			expect(await res.json()).toEqual({ patched: true })
		})

		it('handles DELETE requests', async () => {
			const api = new APIRequest(baseUrl)
			const res = await api.delete('/delete')
			expect(res.status).toBe(204)
			expect(await res.text()).toBe('')
		})

		it('merges default and additional headers', async () => {
			const api = new APIRequest(baseUrl, { 'X-Default': 'default' })
			const res = await api.get('/json', { 'X-Additional': 'additional' })
			expect(res.status).toBe(200)
			expect(res.headers.get('X-Default')).toBe('default')
			expect(res.headers.get('X-Additional')).toBe('additional')
		})

		it.skip('works with external API (httpbin.org)', async () => {
			const api = new APIRequest('https://httpbin.org', { 'User-Agent': 'APIRequest-Test' })
			const res = await api.post('/post', { test: 'external' })
			expect(res.status).toBe(200)
			const json = await res.json()
			expect(json.json).toEqual({ test: 'external' })
			expect(json.headers['User-Agent']).toBe('APIRequest-Test')
		})
	})

	describe('Timeout Handling', () => {
		it('succeeds when timeout is sufficient', async () => {
			const res = await fetch(`${baseUrl}/json`, {
				type: 'json',
				timeout: 1000  // 1 second, more than enough
			})
			expect(res.ok).toBe(true)
			expect(res.status).toBe(200)
			expect(await res.json()).toEqual({ message: 'Hello, World!' })
		})

		it('fails when timeout is too short for slow response', async () => {
			await expect(
				fetch(`${baseUrl}/slow`, {
					type: 'json',
					timeout: 100  // 100ms, less than the 500ms delay
				})
			).rejects.toThrow('The operation was aborted')
		})

		it('APIRequest succeeds with sufficient timeout', async () => {
			const api = new APIRequest(baseUrl, {}, { timeout: 1000 })
			const res = await api.get('/json')
			expect(res.ok).toBe(true)
			expect(res.status).toBe(200)
			expect(await res.json()).toEqual({ message: 'Hello, World!' })
		})

		it('APIRequest fails with insufficient timeout for slow response', async () => {
			const api = new APIRequest(baseUrl, {}, { timeout: 100 })
			await expect(
				api.get('/slow')
			).rejects.toThrow('The operation was aborted')
		})

		it('does not timeout when timeout is 0', async () => {
			const res = await fetch(`${baseUrl}/slow`, {
				type: 'json',
				timeout: 0
			})
			expect(res.ok).toBe(true)
			expect(res.status).toBe(200)
			expect(await res.json()).toEqual({ message: 'Slow response' })
		})
	})
})