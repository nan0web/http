/**
 * @typedef {Record<string, string> | Array<[string, string]> | string} HTTPHeadersInput
 */

const capitalizedKey = (key) => key.toLowerCase().split('-').map(word =>
	word.charAt(0).toUpperCase() + word.slice(1)
).join('-')

/**
 * HTTP Headers class for managing request/response headers
 */
class HTTPHeaders {
	/** @type {Map<string, string>} */
	#map = new Map()

	/**
	 * Creates a new HTTPHeaders instance
	 * @param {HTTPHeadersInput} [input={}] - Headers input data
	 */
	constructor(input = {}) {
		if ("string" === typeof input) {
			input = input.split("\n").map(row => {
				const [name, ...value] = row.split(": ")
				return [name, value.join(": ")]
			})
		} else if (input && typeof input === 'object' && !Array.isArray(input)) {
			// Convert object to array of entries
			input = Object.entries(input)
		}
		this.#map = new Map(input.map(([name, value]) => ([name.toLowerCase(), value])))
	}

	/**
	 * Gets the number of headers
	 * @returns {number}
	 */
	get size() {
		return this.#map.size
	}

	/**
	 * Checks if a header exists
	 * @param {string} name - Header name
	 * @returns {boolean}
	 */
	has(name) {
		return this.#map.has(name.toLowerCase())
	}

	/**
	 * Gets a header value
	 * @param {string} name - Header name
	 * @returns {string|undefined}
	 */
	get(name) {
		return this.#map.get(name.toLowerCase())
	}

	/**
	 * Sets a header value
	 * @param {string} name - Header name
	 * @param {string} value - Header value
	 * @returns {this}
	 */
	set(name, value) {
		this.#map.set(name.toLowerCase(), value)
		return this
	}

	/**
	 * Deletes a header
	 * @param {string} name - Header name
	 * @returns {boolean}
	 */
	delete(name) {
		return this.#map.delete(name.toLowerCase())
	}

	toArray() {
		return Array.from(this.#map.entries()).map(
			([name, value]) => `${capitalizedKey(name)}: ${value}`
		)
	}

	/**
	 * Returns string representation of headers
	 * @returns {string}
	 */
	toString() {
		return this.toArray().join("\n")
	}

	toObject() {
		return Object.fromEntries(this.toArray())
	}

	/**
	 * Creates HTTPHeaders from input
	 * @param {HTTPHeadersInput} input - Input data
	 * @returns {HTTPHeaders}
	 */
	static from(input) {
		if (input instanceof HTTPHeaders) return input
		return new HTTPHeaders(input)
	}
}

export default HTTPHeaders
