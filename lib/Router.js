import { URL } from 'node:url'
import ServerResponse from './ServerResponse.js'

/**
 * Router class to manage routes and middleware
 * @class
 */
class Router {
	constructor() {
		this.routes = new Map()
		this.middlewares = []
	}

	/**
	 * Adds middleware to the router
	 * @param {Function} middleware - Middleware function
	 */
	use(middleware) {
		this.middlewares.push(middleware)
		return this
	}

	/**
	 * Registers a route handler for a specific method and path
	 * @param {string} method - HTTP method (GET, POST, etc.)
	 * @param {string} path - Route path (supports :param syntax)
	 * @param {...Function} handlers - Middleware and route handler functions
	 */
	route(method, path, ...handlers) {
		const key = `${method.toUpperCase()} ${path}`
		this.routes.set(key, { path, handlers })
		return this
	}

	// Convenience methods for common HTTP methods
	get(path, ...handlers) { return this.route('GET', path, ...handlers) }
	post(path, ...handlers) { return this.route('POST', path, ...handlers) }
	put(path, ...handlers) { return this.route('PUT', path, ...handlers) }
	delete(path, ...handlers) { return this.route('DELETE', path, ...handlers) }
	patch(path, ...handlers) { return this.route('PATCH', path, ...handlers) }
	head(path, ...handlers) { return this.route('HEAD', path, ...handlers) }
	options(path, ...handlers) { return this.route('OPTIONS', path, ...handlers) }

	/**
	 * Matches a request to a route and extracts parameters
	 * @param {string} method - HTTP method
	 * @param {string} url - Request URL
	 * @returns {Object|null} Route match with handler and params, or null if no match
	 */
	match(method, url) {
		const key = `${method.toUpperCase()} ${url}`
		if (this.routes.has(key)) {
			return { ...this.routes.get(key), params: {} }
		}

		// Check for parameterized routes
		for (const [routeKey, route] of this.routes) {
			const [routeMethod, routePath] = routeKey.split(' ')
			if (routeMethod !== method.toUpperCase()) continue

			const pathParts = routePath.split('/')
			const urlParts = url.split('/')
			if (pathParts.length !== urlParts.length) continue

			const params = {}
			let match = true
			for (let i = 0; i < pathParts.length; i++) {
				if (pathParts[i].startsWith(':')) {
					params[pathParts[i].slice(1)] = urlParts[i]
				} else if (pathParts[i] !== urlParts[i]) {
					match = false
					break
				}
			}
			if (match) {
				return { ...route, params }
			}
		}
		return null
	}

	/**
	 * Executes middleware and handlers for a matched route
	 * @param {IncomingMessage} req - Request object
	 * @param {ServerResponse} res - Response object
	 * @param {Function} finalHandler - Final handler for no route match
	 */
	async handle(req, res, finalHandler) {
		const parsedUrl = new URL(req.url, `http://${req.headers.host}`)
		const match = this.match(req.method, parsedUrl.pathname)
		const logger = res.logger || console

		let index = 0
		const next = async (err) => {
			if (err) {
				try {
					logger.error(err.stack)
					res.status(500).set('Content-Type', 'text/plain').send(`Error: ${err.message}`)
				} catch (error) {
					logger.error('Error handling failed:', error)
					res.status(500).end('Internal Server Error')
				}
				return
			}

			if (index < this.middlewares.length) {
				const mw = this.middlewares[index++]
				try {
					await mw(req, res, next)
				} catch (error) {
					await next(error)
				}
			} else if (match) {
				req.params = match.params
				let handlerIndex = 0
				const handlerNext = async (handlerErr) => {
					if (handlerErr) {
						await next(handlerErr)
						return
					}
					if (handlerIndex < match.handlers.length) {
						const handler = match.handlers[handlerIndex++]
						try {
							await handler(req, res, handlerNext)
						} catch (error) {
							await handlerNext(error)
						}
					} else {
						await next()
					}
				}
				await handlerNext()
			} else {
				await finalHandler(req, res)
			}
		}
		await next()
	}
}

export default Router
