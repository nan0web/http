import HTTPHeaders from './HTTPHeaders.js'

/**
 * @typedef {Object} HTTPMessageOptions
 * @property {string} [url=""] - Request URL
 * @property {Record<string, string> | Array<[string, string]>} [headers=[]] - Request headers
 * @property {string | undefined} [body] - Request body (optional)
 */

/**
 * Base HTTP Message class
 */
class HTTPMessage {
	/** @type {string} */
	url

	/** @type {HTTPHeaders} */
	headers

	/** @type {string|undefined} */
	body

	/**
	 * Creates a new HTTPMessage instance
	 * @param {HTTPMessageOptions} [input={}] - HTTP message options
	 */
	constructor(input = {}) {
		const {
			url = "",
			headers = [],
			body,
		} = input

		this.url = String(url)
		this.headers = HTTPHeaders.from(headers)
		this.body = body
	}

	/**
	 * Returns string representation of the HTTP message
	 * @returns {string}
	 */
	toString() {
		return [
			"<" + this.url + ">\n" + this.headers,
			this.body || ""
		].join("\n\n")
	}

	/**
	 * Creates HTTPMessage from input
	 * @param {HTTPMessageOptions} input - Input data
	 * @returns {HTTPMessage}
	 */
	static from(input) {
		if (input instanceof HTTPMessage) return input
		return new HTTPMessage(input)
	}
}

export default HTTPMessage
