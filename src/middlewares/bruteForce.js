import { IncomingMessageWithBody } from '../types/IncomingMessageWithBody.js'
import ServerResponseExtended from '../types/ServerResponseExtended.js'

/**
 * Brute force protection middleware.
 * @param {Object} [options]
 * @param {number} [options.windowMs=60_000] - Time window in milliseconds.
 * @param {number} [options.max=100] - Max requests per window per pathname.
 * @param {(req: IncomingMessageWithBody, res: ServerResponseExtended, next: Function) => void} [options.handler] - Custom handler when limit is exceeded.
 * @returns {(req: IncomingMessageWithBody, res: ServerResponseExtended, next: Function) => void}
 */
function bruteForce(options = {}) {
	const {
		windowMs = 60_000,
		max = 100,
		handler = (req, res) => {
			res.status(429).send('Too Many Requests')
		}
	} = options

	const hits = new Map()

	const cleanUp = () => {
		const now = Date.now()
		for (const [key, { timestamp }] of hits.entries()) {
			if (now - timestamp > windowMs) {
				hits.delete(key)
			}
		}
	}

	return (req, res, next) => {
		const ip = req.socket.remoteAddress || req.ip
		// @todo split to pathname, because this way it is possible to change params or hash and brute force
		const key = `${ip}:${req.url}`

		cleanUp()

		if (!hits.has(key)) {
			hits.set(key, {
				count: 1,
				timestamp: Date.now()
			})
			return next()
		}

		const entry = hits.get(key)
		entry.count++

		if (entry.count > max) {
			return handler(req, res, next)
		}

		next()
	}
}

export default bruteForce
