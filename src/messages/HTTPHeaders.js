/**
 * @typedef {Map<string, string> | Array<[string, string]> | object | string} HTTPHeadersInput
 */

/**
 * @param {string} key
 * @returns {string}
 */
const capitalizedKey = (key) => key.toLowerCase().split('-').map(word =>
	word.charAt(0).toUpperCase() + word.slice(1)
).join('-')

/**
 * @param {string} row
 * @returns {Array<string, string>}
 */
const mapIntoRecord = row => {
	const [name, ...value] = row.split(": ")
	return [name, value.join(": ")]
}

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
		let entries = []
		if ("string" === typeof input) {
			entries = input.split("\n").map(mapIntoRecord)
		}
		else if (input && typeof input === 'object' && !Array.isArray(input)) {
			// Convert object to array of entries
			entries = Object.entries(input)
		}
		else {
			entries = Array.from(input)
		}
		this.#map = new Map(entries.map(([name, value]) => ([name.toLowerCase(), value])))
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

	/**
	 * Returns headers as a mapped array.
	 * @returns {string[]}
	 */
	toArray() {
		const entries = Array.from(this.#map.entries())
		return entries.map(
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

	/**
	 * Returns a record with headers.
	 * @returns {Record<string, string>}
	 */
	toObject() {
		const entries = this.toArray().map(mapIntoRecord)
		return Object.fromEntries(entries)
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
