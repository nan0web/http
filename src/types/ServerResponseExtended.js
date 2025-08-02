import { ServerResponse } from 'node:http'

/**
 * Extended ServerResponse with express-like methods
 * @extends {ServerResponse}
 */
class ServerResponseExtended extends ServerResponse {
	/**
	 * Set status code
	 * @param {number} code
	 * @returns {ServerResponseExtended}
	 */
	status(code) {
		this.statusCode = code
		return this
	}

	/**
	 * Set header
	 * @param {string} name
	 * @param {number | string | readonly string[]} value
	 * @returns {this}
	 */
	setHeader(name, value) {
		super.setHeader(name, value)
		return this
	}

	/**
	 * Send response
	 * @param {string|object} body
	 * @returns {void}
	 */
	send(body) {
		if (typeof body === 'object') {
			this.json(body)
		} else {
			if (!this.getHeader('Content-Type')) {
				this.setHeader('Content-Type', 'text/plain')
			}
			this.end(body)
		}
	}

	/**
	 * Send JSON response
	 * @param {object} data
	 * @returns {void}
	 */
	json(data) {
		this.setHeader('Content-Type', 'application/json')
		this.end(JSON.stringify(data))
	}
}

export default ServerResponseExtended