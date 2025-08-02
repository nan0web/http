import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest'
import { createServer } from 'node:http'
import ServerResponse from '../lib/ServerResponse.js'
import { resolve } from 'node:path'
import { writeFileSync, unlinkSync } from 'node:fs'
import { Writable } from 'node:stream'

// Enhanced MockResponse to support streaming
class MockResponse extends Writable {
	constructor() {
		super()
		this.headers = new Map()
		this.statusCode = 200
		this._ended = false
		this._data = ''
	}

	setHeader(name, value) {
		this.headers.set(name, value)
		return this
	}

	getHeader(name) {
		return this.headers.get(name)
	}

	end(data) {
		if (data) this._data += data
		this._ended = true
		this.emit('end')
	}

	_write(chunk, encoding, callback) {
		this._data += chunk.toString()
		callback()
	}
}

let server
let baseUrl

beforeAll(() => {
	server = createServer((req, res) => {
		res.writeHead(200)
		res.end('OK')
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

describe('ServerResponse', () => {
	describe('Basic Methods', () => {
		it('sets status code', () => {
			const mockRes = new MockResponse()
			const res = new ServerResponse(mockRes)
			res.status(201)
			expect(mockRes.statusCode).toBe(201)
			expect(res.status(404).res.statusCode).toBe(404)
		})

		it('sets and gets headers', () => {
			const mockRes = new MockResponse()
			const res = new ServerResponse(mockRes)
			res.setHeader('X-Test', 'value')
			expect(res.getHeader('X-Test')).toBe('value')
			expect(res.getAllHeaders()).toContainEqual({ name: 'X-Test', value: 'value' })
		})

		it('sends body', () => {
			const mockRes = new MockResponse()
			const res = new ServerResponse(mockRes)
			res.send('Hello')
			expect(mockRes._ended).toBe(true)
			expect(mockRes._data).toBe('Hello')
		})

		it('ends response', () => {
			const mockRes = new MockResponse()
			const res = new ServerResponse(mockRes)
			res.end('Done')
			expect(mockRes._ended).toBe(true)
			expect(mockRes._data).toBe('Done')
		})
	})

	describe('Content Methods', () => {
		it('sends JSON', () => {
			const mockRes = new MockResponse()
			const res = new ServerResponse(mockRes)
			const data = { key: 'value' }
			res.json(data)
			expect(mockRes.headers.get('Content-Type')).toBe('application/json')
			expect(mockRes._data).toBe(JSON.stringify(data))
		})

		it('sends JSON with custom content type', () => {
			const mockRes = new MockResponse()
			const res = new ServerResponse(mockRes)
			const data = { key: 'value' }
			res.json(data, 'text/json')
			expect(mockRes.headers.get('Content-Type')).toBe('text/json')
			expect(mockRes._data).toBe(JSON.stringify(data, null, 2))
		})

		it('sends HTML', () => {
			const mockRes = new MockResponse()
			const res = new ServerResponse(mockRes)
			const html = '<h1>Hello</h1>'
			res.html(html)
			expect(mockRes.headers.get('Content-Type')).toBe('text/html')
			expect(mockRes._data).toBe(html)
		})

		it('sets content type', () => {
			const mockRes = new MockResponse()
			const res = new ServerResponse(mockRes)
			res.type('text/plain')
			expect(mockRes.headers.get('Content-Type')).toBe('text/plain')
		})
	})

	describe('File Handling', () => {
		const testFilePath = resolve(__dirname, 'test.txt')

		beforeAll(() => {
			writeFileSync(testFilePath, 'Test content')
		})

		afterAll(() => {
			unlinkSync(testFilePath)
		})

		it('sends file successfully', async () => {
			const mockRes = new MockResponse()
			const res = new ServerResponse(mockRes)
			const callback = vi.fn()

			res.sendFile(testFilePath, {}, callback)

			// Wait for the stream to complete
			await new Promise(resolve => {
				mockRes.on('end', resolve)
			})

			expect(callback).toHaveBeenCalledWith(null)
			expect(mockRes.headers.get('Content-Type')).toBe('application/octet-stream')
			expect(mockRes._data).toBe('Test content')
		})

		it('handles file not found', async () => {
			const mockRes = new MockResponse()
			const res = new ServerResponse(mockRes)

			res.sendFile('nonexistent.txt')

			// Wait for the error handling to complete
			await new Promise(resolve => setTimeout(resolve, 50))

			expect(mockRes.statusCode).toBe(404)
			expect(mockRes._data).toBe('File not found')
		})

		it('uses custom content type for file', async () => {
			const mockRes = new MockResponse()
			const res = new ServerResponse(mockRes)

			res.sendFile(testFilePath, { contentType: 'text/plain' })

			await new Promise(resolve => {
				mockRes.on('end', resolve)
			})

			expect(mockRes.headers.get('Content-Type')).toBe('text/plain')
			expect(mockRes._data).toBe('Test content')
		})
	})

	describe('Redirect', () => {
		it('redirects with default status', () => {
			const mockRes = new MockResponse()
			const res = new ServerResponse(mockRes)
			res.redirect('/new-url')
			expect(mockRes.statusCode).toBe(302)
			expect(mockRes.headers.get('Location')).toBe('/new-url')
			expect(mockRes._data).toBe('Redirecting to /new-url')
		})

		it('redirects with custom status', () => {
			const mockRes = new MockResponse()
			const res = new ServerResponse(mockRes)
			res.redirect(301, '/permanent')
			expect(mockRes.statusCode).toBe(301)
			expect(mockRes.headers.get('Location')).toBe('/permanent')
			expect(mockRes._data).toBe('Redirecting to /permanent')
		})
	})

	describe('Cookies', () => {
		it('sets basic cookie', () => {
			const mockRes = new MockResponse()
			const res = new ServerResponse(mockRes)
			res.cookie('session', '123')
			expect(mockRes.headers.get('Set-Cookie')).toBe('session=123')
		})

		it('sets cookie with options', () => {
			const mockRes = new MockResponse()
			const res = new ServerResponse(mockRes)
			const expires = new Date('2025-01-01')
			res.cookie('user', 'john', {
				maxAge: 3600,
				domain: 'example.com',
				path: '/api',
				expires,
				httpOnly: true,
				secure: true,
				sameSite: 'Strict'
			})
			const cookieStr = mockRes.headers.get('Set-Cookie')
			expect(cookieStr).toContain('user=john')
			expect(cookieStr).toContain('Max-Age=3600')
			expect(cookieStr).toContain('Domain=example.com')
			expect(cookieStr).toContain('Path=/api')
			expect(cookieStr).toContain(`Expires=${expires.toUTCString()}`)
			expect(cookieStr).toContain('HttpOnly')
			expect(cookieStr).toContain('Secure')
			expect(cookieStr).toContain('SameSite=Strict')
		})

		it('clears cookie', () => {
			const mockRes = new MockResponse()
			const res = new ServerResponse(mockRes)
			res.clearCookie('session')
			const cookieStr = mockRes.headers.get('Set-Cookie')
			expect(cookieStr).toContain('session=')
			expect(cookieStr).toContain('Expires=Thu, 01 Jan 1970')
		})
	})

	describe('Format', () => {
		it('handles JSON format', () => {
			const mockRes = new MockResponse()
			const res = new ServerResponse(mockRes)
			res.setHeader('accept', 'application/json')
			res.format({
				json: () => res.json({ data: 'json' })
			})
			expect(mockRes.headers.get('Content-Type')).toBe('application/json')
			expect(mockRes._data).toBe('{"data":"json"}')
		})

		it('handles HTML format', () => {
			const mockRes = new MockResponse()
			const res = new ServerResponse(mockRes)
			res.setHeader('accept', 'text/html')
			res.format({
				html: () => res.html('<p>html</p>')
			})
			expect(mockRes.headers.get('Content-Type')).toBe('text/html')
			expect(mockRes._data).toBe('<p>html</p>')
		})

		it('falls back to default format', () => {
			const mockRes = new MockResponse()
			const res = new ServerResponse(mockRes)
			res.setHeader('accept', 'text/plain')
			res.format({
				default: () => res.send('plain')
			})
			expect(mockRes._data).toBe('plain')
		})

		it('returns 406 when no format matches', () => {
			const mockRes = new MockResponse()
			const res = new ServerResponse(mockRes)
			res.setHeader('accept', 'application/xml')
			res.format({})
			expect(mockRes.statusCode).toBe(406)
			expect(mockRes._data).toBe('Not Acceptable')
		})
	})

	describe('Header Manipulation', () => {
		it('appends to existing header', () => {
			const mockRes = new MockResponse()
			const res = new ServerResponse(mockRes)
			res.setHeader('X-Values', 'one')
			res.append('X-Values', 'two')
			expect(mockRes.headers.get('X-Values')).toBe('one, two')
		})

		it('sets new header with append', () => {
			const mockRes = new MockResponse()
			const res = new ServerResponse(mockRes)
			res.append('X-New', 'value')
			expect(mockRes.headers.get('X-New')).toBe('value')
		})

		it('sets attachment disposition', () => {
			const mockRes = new MockResponse()
			const res = new ServerResponse(mockRes)
			res.attachment('file.txt')
			expect(mockRes.headers.get('Content-Disposition')).toBe('attachment; filename="file.txt"')
		})
	})

	describe('Set Alias', () => {
		it('sets header using set alias', () => {
			const mockRes = new MockResponse()
			const res = new ServerResponse(mockRes)
			res.set('X-Custom', 'custom')
			expect(mockRes.headers.get('X-Custom')).toBe('custom')
			expect(res.getAllHeaders()).toContainEqual({ name: 'X-Custom', value: 'custom' })
		})
	})
})