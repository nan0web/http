import { request as httpRequest, ServerResponse } from 'node:http'
import { request as httpsRequest } from 'node:https'
import { connect as http2Connect } from 'node:http2'
import { URL } from 'node:url'
import { Buffer } from 'node:buffer'
import statusCodes from './status-codes.js'

class NodeServerResponse extends ServerResponse {
	constructor() {
		super()
		this._headers = new Map()
	}

	setHeader(name, value) {
		this._headers.set(name, value)
		return this
	}

	getHeader(name) {
		return this._headers.get(name)
	}

	removeHeader(name) {
		this._headers.delete(name)
		return this
	}

	get headers() {
		return this._headers
	}
}

/**
 * Custom Response class to mimic browser Response
 * @class
 * @param {Buffer|ReadableStream|Object} body - The response body
 * @param {Object} options - The response options
 * @param {number} options.status - The response status code
 * @param {string} options.statusText - The response status text
 * @param {Map} options.headers - The response headers
 * @param {string} options.url - The response URL
 * @param {string} options.type - The response type
 */
class NodeResponse {
	constructor(body, options = {}) {
		this.body = body
		this.status = options.status || 200
		this.statusText = options.statusText || 'OK'
		this.encoding = options.encoding || 'utf8'
		this.headers = new Map(
			Object.entries(options.headers || {}).map(([key, value]) => [NodeResponse.capitalizeHeader(key), value])
		)
		this.url = options.url || ''
		this.ok = this.status >= 200 && this.status < 300
		this.type = options.type || 'basic'
	}

	static capitalizeHeader(key) {
		return key.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('-')
	}

	/**
	 * Returns the response body as text
	 * @returns {Promise<string>} The response body as text
	 */
	async text() {
		if (this.body instanceof Buffer) return this.body.toString(this.encoding)
		if (this.body && typeof this.body.pipe === 'function') {
			return new Promise((resolve, reject) => {
				let data = ''
				this.body.on('data', chunk => data += chunk.toString(this.encoding))
				this.body.on('end', () => resolve(data))
				this.body.on('error', reject)
			})
		}
		return String(this.body)
	}

	/**
	 * Returns the response body as JSON
	 * @returns {Promise<Object>} The response body as JSON
	 */
	async json() {
		const text = await this.text()
		return JSON.parse(text)
	}

	/**
	 * Returns the response body as a Buffer (binary)
	 * @returns {Promise<Buffer>} The response body as a Buffer
	 */
	async arrayBuffer() {
		if (this.body instanceof Buffer) return this.body
		if (this.body && typeof this.body.pipe === 'function') {
			return new Promise((resolve, reject) => {
				const chunks = []
				this.body.on('data', chunk => chunks.push(chunk))
				this.body.on('end', () => resolve(Buffer.concat(chunks)))
				this.body.on('error', reject)
			})
		}
		return Buffer.from(this.body || '')
	}

	/**
	 * Returns the raw stream for sockets/streaming
	 * @returns {ReadableStream} The raw stream for sockets/streaming
	 */
	stream() {
		if (this.body && typeof this.body.pipe === 'function') return this.body
		throw new Error('Response body is not a stream')
	}
}

/**
 * Core fetch function
 * @param {string} url - The URL to fetch
 * @param {Object} options - The fetch options
 * @param {string} options.method - The HTTP method
 * @param {Object} options.headers - The request headers
 * @param {Buffer|ReadableStream|Object} options.body - The request body
 * @param {string} options.type - The response type
 * @param {string} options.protocol - The protocol to use (http, https, http2)
 * @param {number} options.timeout - The timeout in milliseconds
 * @param {boolean} options.rejectUnauthorized - Reject self-signed certificates
 * @param {Object} options.logger - The logger to use
 * @returns {Promise<NodeResponse>} The response
 */
async function fetch(url, options = {}) {
	const {
		method = 'GET', headers = {}, body, type = 'json', protocol = 'http',
		ALPNProtocols = ['h2', 'http/1.1'],
		rejectUnauthorized = true,
		timeout = 0,
		logger = console,
	} = options
	const parsedUrl = new URL(url)
	const isHttps = parsedUrl.protocol === 'https:'
	const useHttp2 = protocol === 'http2' && isHttps

	const requestHeaders = { ...headers }
	if (body && !requestHeaders['Content-Type']) {
		if (type === 'json') requestHeaders['Content-Type'] = 'application/json'
		else if (type === 'binary') requestHeaders['Content-Type'] = 'application/octet-stream'
	}

	const controller = new AbortController()
	const timeoutId = setTimeout(() => timeout > 0 && controller.abort(), timeout)

	return new Promise((resolve, reject) => {
		if (useHttp2) {
			logger.debug(`Attempting HTTP/2 connection to ${url}`)
			let client
			try {
				client = http2Connect(`${parsedUrl.protocol}//${parsedUrl.host}`, {
					rejectUnauthorized,
					ALPNProtocols,
				})
				logger.debug('HTTP/2 client connected')
			} catch (err) {
				logger.error('HTTP/2 connect error:', err)
				return reject(err)
			}

			client.on('error', (err) => {
				clearTimeout(timeoutId)
				logger.error('HTTP/2 client error:', err)
				reject(err)
			})

			client.on('connect', () => {
				logger.debug('HTTP/2 session established')
			})

			const req = client.request({
				':method': method.toUpperCase(),
				':path': parsedUrl.pathname + parsedUrl.search,
				...requestHeaders
			})

			req.on('error', (err) => {
				clearTimeout(timeoutId)
				logger.error('HTTP/2 request error:', err)
				reject(err)
			})

			if (body) {
				if (typeof body === 'string' || body instanceof Buffer) req.write(body)
					else if (typeof body.pipe === 'function') body.pipe(req)
					else req.write(JSON.stringify(body))
				req.end()
			} else {
				req.end()
			}

			req.on('response', (headers, flags) => {
				clearTimeout(timeoutId)
				logger.debug('HTTP/2 response received with status:', headers[':status'])
				const status = headers[':status'] || 200
				const responseHeaders = { ...headers }
				delete responseHeaders[':status']

				let responseBody
				if (type === 'sockets') {
					responseBody = req
				} else {
					const chunks = []
					req.on('data', chunk => {
						logger.debug('Received data chunk')
						chunks.push(chunk)
					})
					req.on('end', () => {
						logger.debug('Request ended')
						const buffer = Buffer.concat(chunks)
						resolve(
							new NodeResponse(buffer, {
								status,
								statusText: statusCodes.get(status),
								headers: responseHeaders,
								url,
								type
							})
						)
					})
				}

				if (type === 'sockets') {
					resolve(
						new NodeResponse(responseBody, {
							status,
							statusText: statusCodes.get(status),
							headers: responseHeaders,
							url,
							type
						})
					)
				}
			})

			req.on('end', () => {
				clearTimeout(timeoutId)
				logger.debug('HTTP/2 request completed')
				client.close()
			})
		} else {
			const requester = isHttps ? httpsRequest : httpRequest
			const req = requester(
				{
					hostname: parsedUrl.hostname,
					port: parsedUrl.port || (isHttps ? 443 : 80),
					path: parsedUrl.pathname + parsedUrl.search,
					method: method.toUpperCase(),
					headers: requestHeaders,
					rejectUnauthorized,
					signal: controller.signal
				},
				res => {
					clearTimeout(timeoutId)
					const status = res.statusCode || 200
					const responseHeaders = res.headers || {}

					let responseBody
					if (type === 'sockets') {
						responseBody = res
					} else {
						const chunks = []
						res.on('data', chunk => chunks.push(chunk))
						res.on('end', () => {
							const buffer = Buffer.concat(chunks)
							resolve(
								new NodeResponse(buffer, {
									status,
									statusText: res.statusMessage || 'OK',
									headers: responseHeaders,
									url,
									type
								})
							)
						})
					}

					if (type === 'sockets') {
						resolve(
							new NodeResponse(responseBody, {
								status,
								statusText: res.statusMessage || 'OK',
								headers: responseHeaders,
								url,
								type
							})
						)
					}
				}
			)

			req.on('error', (err) => {
				clearTimeout(timeoutId)
				reject(err)
			})

			if (body) {
				if (typeof body === 'string' || body instanceof Buffer) req.write(body)
				else if (typeof body.pipe === 'function') body.pipe(req)
				else req.write(JSON.stringify(body))
				req.end()
			} else {
				req.end()
			}
		}
	})
}

const httpMethods = {
	/**
	 * Sends a GET request
	 * @param {string} url - The URL to fetch
	 * @param {Object} options - The fetch options
	 * @returns {Promise<NodeResponse>} The response
	 */
	get: (url, options = {}) => fetch(url, { ...options, method: 'GET' }),

	/**
	 * Sends a POST request
	 * @param {string} url - The URL to fetch
	 * @param {Buffer|ReadableStream|Object} body - The request body
	 * @param {Object} options - The fetch options
	 * @returns {Promise<NodeResponse>} The response
	 */
	post: (url, body, options = {}) => fetch(url, { ...options, method: 'POST', body }),

	/**
	 * Sends a PUT request
	 * @param {string} url - The URL to fetch
	 * @param {Buffer|ReadableStream|Object} body - The request body
	 * @param {Object} options - The fetch options
	 * @returns {Promise<NodeResponse>} The response
	 */
	put: (url, body, options = {}) => fetch(url, { ...options, method: 'PUT', body }),

	/**
	 * Sends a DELETE request
	 * @param {string} url - The URL to fetch
	 * @param {Object} options - The fetch options
	 * @returns {Promise<NodeResponse>} The response
	 */
	delete: (url, options = {}) => fetch(url, { ...options, method: 'DELETE' }),

	/**
	 * Sends a PATCH request
	 * @param {string} url - The URL to fetch
	 * @param {Buffer|ReadableStream|Object} body - The request body
	 * @param {Object} options - The fetch options
	 * @returns {Promise<NodeResponse>} The response
	 */
	patch: (url, body, options = {}) => fetch(url, { ...options, method: 'PATCH', body }),

	/**
	 * Sends a HEAD request
	 * @param {string} url - The URL to fetch
	 * @param {Object} options - The fetch options
	 * @returns {Promise<NodeResponse>} The response
	 */
	head: (url, options = {}) => fetch(url, { ...options, method: 'HEAD' }),

	/**
	 * Sends an OPTIONS request
	 * @param {string} url - The URL to fetch
	 * @param {Object} options - The fetch options
	 * @returns {Promise<NodeResponse>} The response
	 */
	options: (url, options = {}) => fetch(url, { ...options, method: 'OPTIONS' })
}

/**
 * APIRequest class for handling API requests with default options
 * @class
 * @param {string} baseUrl - The base URL for API requests
 * @param {Object} defaultHeaders - Default headers for all requests
 * @param {Object} options - Additional options
 * @param {boolean} options.rejectUnauthorized - Reject self-signed certificates
 * @param {number} options.timeout - The timeout in milliseconds
 * @param {Object} options.logger - The logger to use
 */
class APIRequest {
	constructor(baseUrl, defaultHeaders = {}, options = {}) {
		this.baseUrl = baseUrl
		this.defaultHeaders = defaultHeaders
		this.options = {
			rejectUnauthorized: options.rejectUnauthorized ?? true,
			timeout: options.timeout || 0,
			ALPNProtocols: options.ALPNProtocols || ['h2', 'http/1.1']
		}
		this.logger = options.logger || console
	}

	/**
	 * Constructs full URL from base and path
	 * @param {string} path - The API endpoint path
	 * @returns {string} The full URL
	 */
	getFullUrl(path) {
		// Ensure baseUrl exists
		if (!this.baseUrl) {
			throw new Error('baseUrl is not defined')
		}

		// let baseUrl = ''
		// const root = String(new URL('/', this.baseUrl))
		// if (this.baseUrl.startsWith(root)) {
		// 	baseUrl = this.baseUrl.replace(root, '')
		// }
		// if (baseUrl.endsWith('/')) {
		// 	baseUrl = baseUrl.slice(0, -1)
		// }

		// // Normalize path (remove leading slash if baseUrl already ends with one)
		// const normPath = baseUrl + (path.startsWith('/') ? path : `/${path}`)

		try {
			// Combine baseUrl with path
			return new URL(path, this.baseUrl).toString()
		} catch (error) {
			throw new Error(`Invalid URL construction: ${error.message}`)
		}
	}

	/**
	 * Makes a GET request
	 * @param {string} path - The API endpoint path
	 * @param {Object} headers - Additional headers
	 * @returns {Promise<NodeResponse>} The response
	 */
	get(path, headers = {}) {
		const url = this.getFullUrl(path)
		return fetch(url, {
			...this.options,
			method: 'GET',
			headers: { ...this.defaultHeaders, ...headers },
			type: 'json',
			protocol: url.startsWith('https://') ? 'https' : 'http',
			logger: this.logger
		})
	}

	/**
	 * Makes a POST request
	 * @param {string} path - The API endpoint path
	 * @param {Object|Buffer|ReadableStream} body - The request body
	 * @param {Object} headers - Additional headers
	 * @returns {Promise<NodeResponse>} The response
	 */
	post(path, body, headers = {}) {
		const url = this.getFullUrl(path)
		return fetch(url, {
			...this.options,
			method: 'POST',
			headers: { ...this.defaultHeaders, ...headers },
			body,
			type: 'json',
			protocol: url.startsWith('https://') ? 'https' : 'http',
			logger: this.logger
		})
	}

	/**
	 * Makes a PUT request
	 * @param {string} path - The API endpoint path
	 * @param {Object|Buffer|ReadableStream} body - The request body
	 * @param {Object} headers - Additional headers
	 * @returns {Promise<NodeResponse>} The response
	 */
	put(path, body, headers = {}) {
		const url = this.getFullUrl(path)
		return fetch(url, {
			...this.options,
			method: 'PUT',
			headers: { ...this.defaultHeaders, ...headers },
			body,
			type: 'json',
			protocol: url.startsWith('https://') ? 'https' : 'http',
			logger: this.logger
		})
	}

	/**
	 * Makes a PATCH request
	 * @param {string} path - The API endpoint path
	 * @param {Object|Buffer|ReadableStream} body - The request body
	 * @param {Object} headers - Additional headers
	 * @returns {Promise<NodeResponse>} The response
	 */
	patch(path, body, headers = {}) {
		const url = this.getFullUrl(path)
		return fetch(url, {
			...this.options,
			method: 'PATCH',
			headers: { ...this.defaultHeaders, ...headers },
			body,
			type: 'json',
			protocol: url.startsWith('https://') ? 'https' : 'http',
			logger: this.logger
		})
	}

	/**
	 * Makes a DELETE request
	 * @param {string} path - The API endpoint path
	 * @param {Object} headers - Additional headers
	 * @returns {Promise<NodeResponse>} The response
	 */
	delete(path, headers = {}) {
		const url = this.getFullUrl(path)
		return fetch(url, {
			...this.options,
			method: 'DELETE',
			headers: { ...this.defaultHeaders, ...headers },
			type: 'json',
			protocol: url.startsWith('https://') ? 'https' : 'http',
			logger: this.logger
		})
	}
}

export default fetch
export { httpMethods, NodeResponse, APIRequest }

const get = httpMethods.get
const post = httpMethods.post
const put = httpMethods.put
const patch = httpMethods.patch
const del = httpMethods.delete
const head = httpMethods.head
const options = httpMethods.options

export { get, post, put, patch, del, head, options }
