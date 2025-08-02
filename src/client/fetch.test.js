import { before, suite, describe, it, after } from 'node:test'
import assert from 'node:assert'
import { Buffer } from 'node:buffer'
import { createServer, Server } from 'node:http'
import fetch, { get, post, put, patch, del, head, options, APIRequest } from './fetch.js'

suite("Fetch", () => {
	/** @type {Server} */
	let server
	/** @type {string} */
	let baseUrl

	before(async () => {
		server = createServer((req, res) => {
			/** @type {Map<string, () => Promise<void>>} */
			const router = new Map([
				["GET /json", async () => {
					Object.entries(req.headers).forEach(([key, value]) => res.setHeader(key, value || ""))
					res.statusCode = 200
					res.setHeader("Content-Type", "application/json")
					res.end(JSON.stringify({ message: 'Hello, World!' }))
				}],
				["POST /echo", async () => { res.end(JSON.stringify({ body: "body" })) }],
				["PUT /update", async () => {
					res.writeHead(200, { 'Content-Type': 'application/json' })
					res.end(JSON.stringify({ status: 'updated' }))
				}],
				["DELETE /delete", async () => {
					res.writeHead(204)
					res.end()
				}],
				["PATCH /patch", async () => {
					res.writeHead(200, { 'Content-Type': 'application/json' })
					res.end(JSON.stringify({ patched: true }))
				}],
				["HEAD /head", async () => {
					res.writeHead(200, { 'Content-Length': '123' })
					res.end()
				}],
				["OPTIONS /options", async () => {
					res.writeHead(200, {
						'Allow': 'GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS'
					})
					res.end()
				}],
				["GET /binary", async () => {
					res.writeHead(200, { 'Content-Type': 'application/octet-stream' })
					res.end(Buffer.from([0x00, 0xff, 0x12]))
				}],
				["GET /stream", async () => {
					res.writeHead(200, { 'Content-Type': 'text/plain' })
					res.write('chunk1')
					setTimeout(() => res.write('chunk2'), 50)
					setTimeout(() => res.end('chunk3'), 100)
				}],
				["GET /api/test", async () => {
					res.writeHead(200, { 'Content-Type': 'application/json' })
					res.end(JSON.stringify({ endpoint: 'test' }))
				}],
				["POST /api/submit", async () => {
					let body = ''
					req.on('data', chunk => body += chunk)
					req.on('end', () => {
						res.writeHead(201, { 'Content-Type': 'application/json' })
						res.end(body)
					})
				}],
				["GET /slow", async () => {
					setTimeout(() => {
						res.writeHead(200, { 'Content-Type': 'application/json' })
						res.end(JSON.stringify({ message: 'Slow response' }))
					}, 500)
				}],
				["*", async () => {
					res.writeHead(404)
					res.end('Not Found')
				}]
			])
			const { method, url } = req
			const key = method + " " + url
			const handler = (router.has(key) ? router.get(key) : router.get("*")) || (() => 1)
			handler()
		})
		return new Promise(resolve => {
			server.listen(0, 'localhost', () => {
				const port = server.address()?.port || 0
				baseUrl = `http://localhost:${port}`
				resolve(port)
			})
		})
	})

	after(async () => {
		return new Promise((resolve, reject) => {
			server.close((err) => {
				if (err) reject(err)
					resolve(1)
			})
		})
	})

	describe("fetch", () => {
		it("GET fetches JSON", async () => {
			const res = await fetch(`${baseUrl}/json`, { type: 'json', timeout: 5000 })
			assert.strictEqual(res.ok, true)
			assert.strictEqual(res.status, 200)
			assert.strictEqual(res.statusText, 'OK')
			assert.deepStrictEqual(await res.json(), { message: 'Hello, World!' })
		})

		it("POST with JSON body", async () => {
			const body = { data: 'test' }
			const res = await fetch(`${baseUrl}/echo`, {
				method: 'POST',
				body,
				type: 'json',
				timeout: 5000,
			})
			assert.strictEqual(res.status, 200)
			assert.deepStrictEqual(await res.json(), { body: "body" })
		})

		it("binary response", async () => {
			const res = await fetch(`${baseUrl}/binary`, { type: 'binary', timeout: 5000 })
			const buffer = await res.arrayBuffer()
			assert.deepStrictEqual(buffer, Buffer.from([0x00, 0xff, 0x12]))
			assert.strictEqual(res.status, 200)
		})

		it("'sockets' type streaming", async () => {
			const res = await fetch(`${baseUrl}/stream`, { type: 'sockets', timeout: 5000 })
			assert.strictEqual(res.status, 200)
			const stream = res.stream()
			const data = []
			stream.on('data', c => data.push(c))
			await new Promise(resolve => stream.on('end', resolve))
			assert.deepStrictEqual(Buffer.concat(data).toString(), 'chunk1chunk2chunk3')
		})

		it("404 error", async () => {
			const res = await fetch(`${baseUrl}/not-found`, { timeout: 5000 })
			assert.strictEqual(res.ok, false)
			assert.strictEqual(res.status, 404)
			assert.strictEqual(res.statusText, 'Not Found')
			assert.strictEqual(await res.text(), 'Not Found')
		})
	})

	describe("HTTP methods", () => {
		it("GET method", async () => {
			const res = await get(`${baseUrl}/json`, { timeout: 5000 })
			assert.strictEqual(res.status, 200)
			assert.deepStrictEqual(await res.json(), { message: 'Hello, World!' })
		})

		it("POST method", async () => {
			const body = { test: 'data' }
			const res = await post(`${baseUrl}/echo`, body, { timeout: 5000 })
			assert.strictEqual(res.status, 200)
			assert.deepStrictEqual(await res.json(), { body: "body" })
		})

		it("PUT method", async () => {
			const body = { update: 'data' }
			const res = await put(`${baseUrl}/update`, body, { timeout: 5000 })
			assert.strictEqual(res.status, 200)
			assert.deepStrictEqual(await res.json(), { status: 'updated' })
		})

		it("PATCH method", async () => {
			const body = { patch: 'data' }
			const res = await patch(`${baseUrl}/patch`, body, { timeout: 5000 })
			assert.strictEqual(res.status, 200)
			assert.deepStrictEqual(await res.json(), { patched: true })
		})

		it("DELETE method", async () => {
			const res = await del(`${baseUrl}/delete`, { timeout: 5000 })
			assert.strictEqual(res.status, 204)
		})

		it("HEAD method", async () => {
			const res = await head(`${baseUrl}/head`, { timeout: 5000 })
			assert.strictEqual(res.status, 200)
			assert.strictEqual(res.headers.get("Content-Length"), '123')
		})

		it("OPTIONS method", async () => {
			const res = await options(`${baseUrl}/options`, { timeout: 5000 })
			assert.strictEqual(res.status, 200)
			assert.strictEqual(res.headers.get("Allow"), 'GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS')
		})
	})

	describe("APIRequest", () => {
		it("constructs URLs correctly", () => {
			const api = new APIRequest('https://api.example.com')
			assert.strictEqual(api.getFullUrl('/test'), 'https://api.example.com/test')
			assert.strictEqual(api.getFullUrl('test'), 'https://api.example.com/test')
		})

		it("throws error for invalid URL construction", () => {
			const api = new APIRequest('')
			assert.throws(() => api.getFullUrl('/test'), Error)
		})

		it("GET request", async () => {
			const api = new APIRequest(baseUrl)
			const res = await api.get('/json')
			assert.strictEqual(res.status, 200)
			assert.deepStrictEqual(await res.json(), { message: 'Hello, World!' })
		})

		it("POST request", async () => {
			const api = new APIRequest(baseUrl)
			const body = { submit: 'data' }
			const res = await api.post('/echo', body)
			assert.strictEqual(res.status, 200)
			assert.deepStrictEqual(await res.json(), { body: "body" })
		})

		it("PUT request", async () => {
			const api = new APIRequest(baseUrl)
			const body = { update: 'data' }
			const res = await api.put('/update', body)
			assert.strictEqual(res.status, 200)
			assert.deepStrictEqual(await res.json(), { status: 'updated' })
		})

		it("PATCH request", async () => {
			const api = new APIRequest(baseUrl)
			const body = { patch: 'data' }
			const res = await api.patch('/patch', body)
			assert.strictEqual(res.status, 200)
			assert.deepStrictEqual(await res.json(), { patched: true })
		})

		it("DELETE request", async () => {
			const api = new APIRequest(baseUrl)
			const res = await api.del('/delete')
			assert.strictEqual(res.status, 204)
		})
	})

	describe("Timeout functionality", () => {
		it("aborts request on timeout", async () => {
			const api = new APIRequest(baseUrl, {}, { timeout: 100 })
			await assert.rejects(
				api.get('/slow'),
				{ message: 'The operation was aborted' }
			)
		})

		it("completes request within timeout", async () => {
			const api = new APIRequest(baseUrl, {}, { timeout: 1000 })
			const res = await api.get('/slow')
			assert.strictEqual(res.status, 200)
			assert.deepStrictEqual(await res.json(), { message: 'Slow response' })
		})
	})
})
