import { Enum, to } from "@nan0web/types"
import HTTPMessage from "./HTTPMessage.js"

/**
 * @typedef {"basic" | "cors" | "default" | "error" | "opaque" | "opaqueredirect"} ResponseType
 */
/**
 * @typedef {301 | 302 | 303 | 307 | 308} ResponseRedirectStatus
 */

/**
 * @param {string} input
 * @returns {ResponseType}
 */
const ResponseType = input => (
	Enum("basic", "cors", "default", "error", "opaque", "opaqueredirect")(input)
)
/**
 * @param {number} input
 * @returns {ResponseRedirectStatus}
 */
const ResponseRedirectStatus = input => (
	Enum(301, 302, 303, 307, 308)(Number(input))
)
/**
 * HTTP Response Message class
 * @extends {HTTPMessage}
 */
class HTTPResponseMessage extends HTTPMessage {
	// Currently extends HTTPMessage without additional functionality
	// Future enhancements might include status code handling, etc.
	/** @type {boolean} */
	ok
	/** @type {number} */
	status
	/** @type {string} */
	statusText
	/** @type {ResponseType} */
	type
	/** @type {boolean} */
	redirected

	/**
	 * Creates a new HTTPResponseMessage instance
	 * @param {object} [input] - HTTP message options
	 * @param {string} [input.url=""]
	 * @param {import("./HTTPHeaders.js").HTTPHeadersInput} [input.headers=[]]
	 * @param {string} [input.body]
	 * @param {boolean} [input.ok=false]
	 * @param {number} [input.status=0]
	 * @param {string} [input.statusText=""]
	 * @param {string} [input.type="default"]
	 * @param {boolean} [input.redirected=false]
	 */
	constructor(input = {}) {
		super(input)
		const {
			ok = false,
			status = 0,
			statusText = "",
			type = "basic",
			redirected = false,
		} = input
		this.ok = Boolean(ok)
		this.status = Number(status)
		this.statusText = String(statusText)
		this.type = ResponseType(type)
		this.redirected = Boolean(redirected)
	}
	clone() {
		const data = to(Object)(this)
		return new HTTPResponseMessage(data)
	}
	async json() {
		return JSON.stringify(String(this.body))
	}
	async text() {
		return String(this.body)
	}
}

export default HTTPResponseMessage
