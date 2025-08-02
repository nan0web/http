import { IncomingMessageWithBody } from '../types/IncomingMessageWithBody.js'
import ServerResponseExtended from '../types/ServerResponseExtended.js'

/**
 * Parses request body based on content-type
 * @param {IncomingMessageWithBody} req
 * @param {ServerResponseExtended} res
 * @returns {Promise<void>}
 */
async function bodyParser(req, res) {
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
			resolve()
		})
	})
}

export default bodyParser
