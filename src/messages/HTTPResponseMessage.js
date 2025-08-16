import HTTPMessage from "./HTTPMessage.js"

/**
 * HTTP Response Message class
 * @extends {HTTPMessage}
 */
class HTTPResponseMessage extends HTTPMessage {
	// Currently extends HTTPMessage without additional functionality
	// Future enhancements might include status code handling, etc.
	/** @type {boolean} */
	ok
	/**
	 * Creates a new HTTPResponseMessage instance
	 * @param {object} [input] - HTTP message options
	 * @param {string} [input.url=""]
	 * @param {import("./HTTPHeaders.js").HTTPHeadersInput} [input.headers=[]]
	 * @param {string} [input.body]
	 * @param {boolean} [input.ok=false]
	 */
	constructor(input = {}) {
		super(input)
		const {
			ok = false,
		} = input
		this.ok = Boolean(ok)
	}
	async json() {
		return JSON.stringify(String(this.body))
	}
	async text() {
		return String(this.body)
	}
}

export default HTTPResponseMessage
