import { Readable } from 'node:stream'

/**
 * HTTP Response class compatible with fetch API Response
 * @extends {Readable}
 */
class HTTPResponse extends Readable {
	/**
	 * @param {Buffer|ReadableStream|Object|string|null} body
	 * @param {Object} [options]
	 * @param {number} [options.status=200]
	 * @param {string} [options.statusText='OK']
	 * @param {Object.<string, string>} [options.headers={}]
	 * @param {string} [options.url='']
	 * @param {string} [options.type='basic']
	 * @param {boolean} [options.redirected=false]
	 */
	constructor(body, options = {}) {
		super({ objectMode: true })

		const {
			status = 200,
			statusText = 'OK',
			headers = {},
			url = '',
			type = 'basic',
			redirected = false
		} = options

		this._bodyUsed = false
		this._body = body
		this.status = Number(status)
		this.statusText = String(statusText)
		this.ok = this.status >= 200 && this.status < 300
		this.redirected = Boolean(redirected)
		this.url = String(url)
		this.type = String(type)

		// Create headers map with proper capitalization
		this.headers = new Map()
		Object.entries(headers).forEach(([key, value]) => {
			const capitalizedKey = key.toLowerCase().split('-').map(word =>
				word.charAt(0).toUpperCase() + word.slice(1)
			).join('-')
			this.headers.set(
				capitalizedKey,
				Array.isArray(value) ? value.join(', ') : String(value)
			)
		})
	}

	/**
	 * @returns {boolean}
	 */
	get bodyUsed() {
		return this._bodyUsed
	}

	/**
	 * Returns the raw stream for sockets/streaming
	 * @returns {ReadableStream}
	 */
	stream() {
		if (this._bodyUsed) {
			throw new TypeError('Body has already been consumed')
		}

		if (this._body && typeof this._body.pipe === 'function') {
			this._bodyUsed = true
			return this._body
		}

		throw new TypeError('Response body is not a stream')
	}

	/**
	 * @returns {Promise<string>}
	 */
	async text() {
		if (this._bodyUsed) {
			throw new TypeError('Body has already been consumed')
		}

		this._bodyUsed = true

		if (Buffer.isBuffer(this._body)) {
			return this._body.toString()
		}

		if (this._body && typeof this._body.pipe === 'function') {
			return new Promise((resolve, reject) => {
				const chunks = []
				this._body.on('data', chunk => chunks.push(chunk))
				this._body.on('end', () => resolve(Buffer.concat(chunks).toString()))
				this._body.on('error', reject)
			})
		}

		if (typeof this._body === 'object' && this._body !== null) {
			return JSON.stringify(this._body)
		}

		return String(this._body || '')
	}

	/**
	 * @returns {Promise<any>}
	 */
	async json() {
		const text = await this.text()
		return JSON.parse(text)
	}

	/**
	 * @returns {Promise<Buffer>}
	 */
	async arrayBuffer() {
		if (this._bodyUsed) {
			throw new TypeError('Body has already been consumed')
		}

		this._bodyUsed = true

		if (Buffer.isBuffer(this._body)) {
			return this._body
		}

		if (this._body && typeof this._body.pipe === 'function') {
			return new Promise((resolve, reject) => {
				const chunks = []
				this._body.on('data', chunk => chunks.push(chunk))
				this._body.on('end', () => {
					const buffer = Buffer.concat(chunks)
					resolve(buffer)
				})
				this._body.on('error', reject)
			})
		}

		const str = String(this._body || '')
		return Buffer.from(str)
	}

	/**
	 * @returns {Promise<Blob>}
	 */
	async blob() {
		throw new Error('Blob not implemented in node.js environment')
	}

	/**
	 * @returns {Promise<FormData>}
	 */
	async formData() {
		throw new Error('FormData not implemented in node.js environment')
	}

	/**
	 * Implements Readable stream _read method
	 */
	_read() {
		if (!this._bodyUsed && this._body && typeof this._body.pipe === 'function') {
			this._body.on('data', chunk => this.push(chunk))
			this._body.on('end', () => this.push(null))
			this._body.on('error', err => this.emit('error', err))
			this._body.resume()
		} else {
			if (!this._bodyUsed) {
				this.push(this._body)
			}
			this.push(null)
		}
	}

	/**
	 * Clone response
	 * @returns {HTTPResponse}
	 */
	clone() {
		if (this._bodyUsed) {
			throw new TypeError('Body has already been consumed')
		}

		return new HTTPResponse(this._body, {
			status: this.status,
			statusText: this.statusText,
			headers: Object.fromEntries(this.headers.entries()),
			url: this.url,
			type: this.type,
			redirected: this.redirected
		})
	}
}

export default HTTPResponse
