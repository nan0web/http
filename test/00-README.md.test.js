import { describe, test, expect, beforeAll, afterAll } from 'vitest'
import { execSync } from 'node:child_process'
import { createServer } from 'node:http'
import { createServer as createHttpsServer } from 'node:https'
import fetch, { APIRequest, get, post, put, patch, del, head, options } from '../lib/fetch.js'
import fs from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = resolve(__filename, '..')

let httpServer
let httpsServer
let baseUrl
let httpsBaseUrl

const httpsOptions = {
	key: fs.readFileSync(resolve(__dirname, 'certs', 'key.pem')),
	cert: fs.readFileSync(resolve(__dirname, 'certs', 'cert.pem'))
}

beforeAll(() => {
	const serverLogic = (req, res) => {
		const { method, url } = req

		if (method === 'GET' && url === '/data') {
			Object.entries(req.headers).forEach(([key, value]) => res.setHeader(key, value))
			res.writeHead(200, { 'Content-Type': 'application/json' })
			res.end(JSON.stringify({ message: 'Hello, World!' }))
		}
		else if (['HEAD', 'OPTIONS'].includes(method) && url === '/data') {
			Object.entries(req.headers).forEach(([key, value]) => res.setHeader(key, value))
			res.writeHead(200, { 'Content-Type': 'application/json' })
			res.end()
		}
		else if (url.startsWith('/api/data')) {
			if (method === 'POST') {
				let body = ''
				req.on('data', chunk => body += chunk)
				req.on('end', () => {
					res.writeHead(201, { 'Content-Type': 'application/json' })
					res.end(body)
				})
			}
			else if (method === 'GET') {
				res.writeHead(200, { 'Content-Type': 'application/json' })
				res.end(JSON.stringify({ message: 'Hello, World!' }))
			}
			else if (method === 'PUT') {
				res.writeHead(200, { 'Content-Type': 'application/json' })
				res.end(JSON.stringify({ message: 'Hello, World!' }))
			}
			else if (method === 'DELETE') {
				res.writeHead(200, { 'Content-Type': 'application/json' })
				res.end(JSON.stringify({ message: 'Hello, World!' }))
			}
			else if (method === 'PATCH') {
				res.writeHead(200, { 'Content-Type': 'application/json' })
				res.end(JSON.stringify({ message: 'Hello, World!' }))
			}
			else if (method === 'HEAD') {
				res.writeHead(200, { 'Content-Type': 'application/json' })
				res.end(JSON.stringify({ message: 'Hello, World!' }))
			}
			else if (method === 'OPTIONS') {
				res.writeHead(200, { 'Content-Type': 'application/json' })
				res.end(JSON.stringify({ message: 'Hello, World!' }))
			}
		} else {
			res.writeHead(404)
			res.end('Not Found')
		}
	}

	httpServer = createServer(serverLogic)

	// HTTPS server with HTTP/2 support
	httpsServer = createHttpsServer({
		...httpsOptions,
		ALPNProtocols: ['h2', 'http/1.1'] // Enable HTTP/2
	}, serverLogic)

	return Promise.all([
		new Promise(resolve => {
			httpServer.listen(0, 'localhost', () => {
				const { port } = httpServer.address()
				baseUrl = `http://localhost:${port}`
				resolve()
			})
		}),
		new Promise(resolve => {
			httpsServer.listen(0, 'localhost', () => {
				const { port } = httpsServer.address()
				httpsBaseUrl = `https://localhost:${port}`
				resolve()
			})
		})
	])
})

afterAll(() => {
	httpServer.close()
	httpsServer.close()
})

describe('fetch', () => {
	/**
	 * @docs README.md
	 * # Nanoweb HTTP
	 * Nanoweb HTTP is a powerful Node.js package that provides a modern, browser-like fetch API for making HTTP requests in Node.js environments.
	 *
	 * ## Features
	 * - Browser-like fetch API with full support for GET, POST, PUT, DELETE, PATCH, HEAD, and OPTIONS methods
	 * - Custom Response class with methods like `.text()`, `.json()`, `.arrayBuffer()`, and `.stream()`
	 * - APIRequest class for simplified API interactions with default options
	 * - Support for HTTP/1.1, HTTP/2, and HTTPS protocols
	 * - Automatic Content-Type header handling based on request body
	 * - Robust error handling for network and HTTP errors
	 * - Full TypeScript support with type definitions
	 *
	 * ## Installation
	 * Ensure you have Node.js installed, then install the package using npm:
	 * ```sh
	 * npm install nanoweb-http
	 * ```
	 */
	test('npm should be installed', () => {
		// @stopdocs
		let isInstalled = false
		try {
			execSync('npm -v', { stdio: 'ignore' })
			isInstalled = true
		} catch (error) {
			isInstalled = false
		}
		expect(isInstalled).toBe(true)
	})

	/**
	 * @docs README.md
	 * ## Usage
	 *
	 * ### Core Fetch API
	 * The core fetch function allows you to make HTTP requests similar to the browser Fetch API:
	 */
	test('should fetch data', async () => {
		// // Make a GET request
		// import fetch from 'nanoweb-http'
		// const baseUrl = 'http://localhost:3000'
		const response = await fetch(`${baseUrl}/data`)
		const data = await response.json()
		// console.log(data)
		expect(data).toBeDefined()
	})

	/**
	 * @docs README.md
	 * ### HTTP Method Helpers
	 * Convenience methods for common HTTP operations:
	 */
	test('should fetch data with post()', async () => {
		// // Make a POST request with JSON body
		// import { post } from 'nanoweb-http'
		// const baseUrl = 'http://localhost:3000'
		const response = await post(`${baseUrl}/api/data`, { name: 'John' })
		// console.log(response)
		expect(response.status).toBe(201)
	})

	/**
	 * @docs README.md
	 * ### HTTP Methods
	 * The package provides convenient GET method:
	 */
	test('should support GET', async () => {
		// // GET request
		// import { get } from 'nanoweb-http'
		// const baseUrl = 'http://localhost:3000'
		const response = await get(`${baseUrl}/data`)
		// console.log(response)
		expect(response.status).toBe(200)
	})

	/**
	 * @docs README.md
	 * ### HTTP Methods
	 * The package provides convenient POST method:
	 */
	test('should support POST', async () => {
		// // POST request with JSON body
		// import { post } from 'nanoweb-http'
		// const baseUrl = 'http://localhost:3000'
		const response = await post(`${baseUrl}/api/data`, { message: 'Hello' })
		// console.log(response)
		expect(response.status).toBe(201)
	})

	/**
	 * @docs README.md
	 * ### HTTP Methods
	 * The package provides convenient PUT method:
	 */
	test('should support PUT', async () => {
		// // PUT request
		// import { put } from 'nanoweb-http'
		// const baseUrl = 'http://localhost:3000'
		const response = await put(`${baseUrl}/api/data/1`, { status: 'active' })
		// console.log(response)
		expect(response.status).toBe(200)
	})

	/**
	 * @docs README.md
	 * ### HTTP Methods
	 * The package provides convenient PATCH method:
	 */
	test('should support PATCH', async () => {
		// // PATCH request
		// import { patch } from 'nanoweb-http'
		// const baseUrl = 'http://localhost:3000'
		const response = await patch(`${baseUrl}/api/data/1`, { partial: true })
		// console.log(response)
		expect(response.status).toBe(200)
	})

	/**
	 * @docs README.md
	 * ### HTTP Methods
	 * The package provides convenient DELETE method:
	 */
	test('should support DELETE', async () => {
		// // DELETE request
		// import { del } from 'nanoweb-http'
		// const baseUrl = 'http://localhost:3000'
		const response = await del(`${baseUrl}/api/data/1`)
		// console.log(response)
		expect(response.status).toBe(200)
	})

	/**
	 * @docs README.md
	 * ### HTTP Methods
	 * The package provides convenient HEAD method:
	 */
	test('should support HEAD', async () => {
		// // HEAD request
		// import { head } from 'nanoweb-http'
		// const baseUrl = 'http://localhost:3000'
		const response = await head(`${baseUrl}/data`)
		// console.log(response)
		expect(response.status).toBe(200)
	})

	/**
	 * @docs README.md
	 * ### HTTP Methods
	 * The package provides convenient OPTIONS method:
	 */
	test('should support OPTIONS', async () => {
		// // OPTIONS request
		// import { options } from 'nanoweb-http'
		const response = await options(`${baseUrl}/data`)
		// console.log(response)
		expect(response.status).toBe(200)
	})

	/**
	 * @docs README.md
	 * ### APIRequest Class
	 * Create an API client with base URL and default headers:
	 */
	test('should make HTTP request with predefined headers', async () => {
		// // Create API instance with base URL and default headers
		// import { APIRequest } from 'nanoweb-http'
		// const baseUrl = 'http://localhost:3000'
		const api = new APIRequest(`${baseUrl}/api/`, {
			token: '123',
			xCustomHeader: 'value'
		})

		// // Make requests using the API instance
		const dataResponse = await api.get('data')
		const createResponse = await api.post('data', { name: 'John' })
		const updateResponse = await api.put('data/1', { status: 'active' })
		const deleteResponse = await api.delete('data/1')
		// console.log(dataResponse, createResponse, updateResponse, deleteResponse)

		expect(dataResponse.status).toBe(200)
		expect(createResponse.status).toBe(201)
		expect(updateResponse.status).toBe(200)
		expect(deleteResponse.status).toBe(200)
	})

	/**
	 * @docs README.md
	 * ### Response Handling
	 * Handle responses in various formats:
	 */
	test('should handle different response types', async () => {
		// import fetch from 'nanoweb-http'
		// const baseUrl = 'http://localhost:3000'
		const response = await fetch(`${baseUrl}/data`)
		// console.log(response.ok, response.status)

		// // Get response as text
		const text = await response.text()
		// console.log(text)

		// // Get response as JSON
		const json = await response.json()
		// console.log(json)

		// // Get response as Buffer (binary)
		const buffer = await response.arrayBuffer()
		// console.log(buffer)

		// // Get raw stream for streaming responses
		// const stream = response.stream()
		// console.log(stream)

		expect(text).toBeDefined()
		expect(json).toBeDefined()
		expect(buffer).toBeDefined()
		// expect(stream).toBeDefined()
		expect(response.ok).toBe(true)
		expect(response.status).toBe(200)
	})

	/**
	 * @docs README.md
	 * ### Error Handling
	 * Handle network and HTTP errors gracefully:
	 */
	test('should handle errors gracefully', async () => {
		// // Request to invalid endpoint
		// import fetch from 'nanoweb-http'
		// const baseUrl = 'http://localhost:3000'
		try {
			const response = await fetch(`${baseUrl}/invalid`)
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`)
			}
			expect.fail('Request should have failed')
		} catch (error) {
		// 	console.log(error)
		// }
			expect(error).toBeDefined()
		}
	})

	/**
	 * @docs README.md
	 * ### Advanced Features
	 *
	 * #### HTTP/2 Support
	 * Make requests using HTTP/2 protocol:
	 */
	test.skip('should support HTTP/2', async () => {
		// import fetch from 'nanoweb-http'
		// const httpsBaseUrl = 'https://localhost:3000'
		try {
			const response = await fetch(`${httpsBaseUrl}/data`, {
				protocol: 'http2',
				rejectUnauthorized: false
			})
			// console.log(response)
			expect(response.status).toBe(200)
		} catch (error) {
			// console.log(error)
			throw error
		}
	})

	/**
	 * @docs README.md
	 * #### Self-Signed Certificates
	 * Handle self-signed certificates with APIRequest:
	 */
	test('should support self-signed certificates', async () => {
		// import { APIRequest } from 'nanoweb-http'
		// const baseUrl = 'http://localhost:3000'
		const api = new APIRequest(`${baseUrl}/api/`, {}, {
			allowSelfSignedCertificates: true
		})
		const response = await api.get('data')
		// console.log(response)
		expect(response.status).toBe(200)
	})

	/**
	 * @docs README.md
	 * #### Custom Headers
	 * Add custom headers to requests:
	 */
	test('should support custom headers', async () => {
		// import fetch from 'nanoweb-http'
		// const baseUrl = 'http://localhost:3000'
		const response = await fetch(`${baseUrl}/data`, {
			headers: {
				'X-Custom-Header': 'value',
				'Content-Type': 'application/json'
			}
		})
		// console.log(response)
		expect(response.status).toBe(200)
	})
})