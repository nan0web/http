import { IncomingMessageWithBody } from '../types/IncomingMessageWithBody.js'
import ServerResponseExtended from '../types/ServerResponseExtended.js'

/**
 * Body parser middleware.
 * @returns {(req: IncomingMessageWithBody, res: ServerResponseExtended, next: Function) => Promise<void>}
 */
function bodyParser() {
	/**
	 * Parses request body based on content-type
	 * @param {IncomingMessageWithBody} req
	 * @param {ServerResponseExtended} [res]
	 * @param {Function} [next]
	 * @returns {Promise<void>}
	 */
	return async (req, res = {}, next = () => 1) => {
		if (!req.method || !['POST', 'PUT', 'PATCH'].includes(req.method)) return

		return new Promise((resolve) => {
			let body = ''
			req.on('data', (chunk) => body += chunk)
			req.on('end', () => {
				try {
					const contentType = req.headers['content-type']

					if (contentType?.includes('application/json')) {
						req.body = JSON.parse(body || '{}')
					} else if (contentType?.includes('application/x-www-form-urlencoded')) {
						req.body = Object.fromEntries(new URLSearchParams(body))
					} else {
						req.body = body
					}
				} catch {
					req.body = body
				}
				next()
				resolve()
			})
		})
	}
}

export default bodyParser
