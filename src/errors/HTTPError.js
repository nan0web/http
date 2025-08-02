/**
 * HTTP Error class
 * @extends {Error}
 */
class HTTPError extends Error {
	/** @type {number} */
	status

	/**
	 * @param {string} message
	 * @param {number} [status=400]
	 */
	constructor(message, status = 400) {
		super(message)
		this.status = status
		this.name = 'HTTPError'
	}
}

export default HTTPError
