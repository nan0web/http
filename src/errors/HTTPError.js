/**
 * HTTP Error class
 * @extends {Error}
 */
class HTTPError extends Error {
	/** @type {number} */
	status

	/**
	 * Creates a new HTTPError instance
	 * @param {string} message - Error message
	 * @param {number} [status=400] - HTTP status code
	 */
	constructor(message, status = 400) {
		super(message)
		this.status = status
		this.name = 'HTTPError'
	}

	/**
	 * Returns a string representation of the error
	 * @returns {string}
	 */
	toString() {
		return `${this.name} [${this.status}] ${this.message}\n${this.stack}`
	}
}

export default HTTPError
