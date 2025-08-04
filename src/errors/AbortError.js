/**
 * Abort Error class
 * @extends {Error}
 */
class AbortError extends Error {
	/**
	 * Creates a new AbortError instance
	 * @param {string} [message="Request aborted"] - Error message
	 */
	constructor(message = "Request aborted") {
		super(message)
		this.name = "AbortError"
	}
}

export default AbortError
