import HTTPHeaders from './HTTPHeaders.js'

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
	 * @param {object} [input] - HTTP message options
	 * @param {string} [input.url=""]
	 * @param {import("./HTTPHeaders.js").HTTPHeadersInput} [input.headers=[]]
	 * @param {string} [input.body]
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
	 * @param {object} input - Input data
	 * @returns {HTTPMessage}
	 */
	static from(input) {
		if (input instanceof HTTPMessage) return input
		return new HTTPMessage(input)
	}
}

export default HTTPMessage
