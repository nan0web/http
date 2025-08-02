import ServerResponseExtended from './types/ServerResponseExtended.js'
import { IncomingMessageWithBody } from './types/IncomingMessageWithBody.js'

/**
 * HTTP Router class
 */
class Router {
	constructor() {
		/** @type {Array<Function>} */
		this.middlewares = []
		/** @type {Object.<string, Array<{pattern: {regex: RegExp, params: Object}, handler: Function}>>} */
		this.routes = {
			GET: [],
			POST: [],
			PUT: [],
			DELETE: [],
			PATCH: []
		}
	}

	/**
	 * Add GET route
	 * @param {string} path
	 * @param {(req: import('http').IncomingMessage, res: import('http').ServerResponse) => void} handler
	 * @returns {Router}
	 */
	get(path, handler) {
		this.addRoute('GET', path, handler)
		return this
	}

	/**
	 * Add POST route
	 * @param {string} path
	 * @param {(req: import('http').IncomingMessage, res: import('http').ServerResponse) => void} handler
	 * @returns {Router}
	 */
	post(path, handler) {
		this.addRoute('POST', path, handler)
		return this
	}

	/**
	 * Add PUT route
	 * @param {string} path
	 * @param {(req: import('http').IncomingMessage, res: import('http').ServerResponse) => void} handler
	 * @returns {Router}
	 */
	put(path, handler) {
		this.addRoute('PUT', path, handler)
		return this
	}

	/**
	 * Add DELETE route
	 * @param {string} path
	 * @param {(req: import('http').IncomingMessage, res: import('http').ServerResponse) => void} handler
	 * @returns {Router}
	 */
	delete(path, handler) {
		this.addRoute('DELETE', path, handler)
		return this
	}

	/**
	 * Add PATCH route
	 * @param {string} path
	 * @param {(req: import('http').IncomingMessage, res: import('http').ServerResponse) => void} handler
	 * @returns {Router}
	 */
	patch(path, handler) {
		this.addRoute('PATCH', path, handler)
		return this
	}

	/**
	 * Add route for any method
	 * @param {'GET'|'POST'|'PUT'|'DELETE'|'PATCH'} method
	 * @param {string} path
	 * @param {(req: import('http').IncomingMessage, res: import('http').ServerResponse) => void} handler
	 */
	addRoute(method, path, handler) {
		const pattern = this.pathToPattern(path)
		this.routes[method].push({ pattern, handler })
	}

	/**
	 * Add middleware function that runs before all routes
	 * @param {(req: IncomingMessageWithBody, res: ServerResponseExtended, next: Function) => Promise<void>|void} middleware
	 * @returns {Router}
	 */
	use(middleware) {
		this.middlewares.push(middleware)
		return this
	}

	/**
	 * Convert path to regex pattern
	 * @param {string} path
	 * @returns {{regex: RegExp, params: Object}}
	 */
	pathToPattern(path) {
		const segments = path.split('/').filter(Boolean)
		/** @type {Object.<string, boolean>} */
		const params = {}
		const regexParts = ['^']

		for (const segment of segments) {
			if (segment.startsWith(':')) {
				const paramName = segment.slice(1)
				params[paramName] = true
				regexParts.push('/([^/]+)')
			} else if (segment === '*') {
				regexParts.push('(/.*)?')
			} else {
				regexParts.push(`/${segment}`)
			}
		}

		regexParts.push('$')
		const regex = new RegExp(regexParts.join(''))

		return { regex, params }
	}

	/**
	 * Match route for method and URL
	 * @param {string} method
	 * @param {string} url
	 * @returns {{handler: Function, params: Object}|null}
	 */
	matchRoute(method, url) {
		const routes = this.routes[method] || []
		const path = new URL(url, 'http://localhost').pathname

		for (const route of routes) {
			const match = path.match(route.pattern.regex)
			if (match) {
				/** @type {Object.<string, string>} */
				const params = {}
				let paramIndex = 1

				for (const paramName in route.pattern.params) {
					params[paramName] = match[paramIndex++]
				}

				return { handler: route.handler, params }
			}
		}

		return null
	}

	/**
	 * Handle incoming request
	 * @param {IncomingMessageWithBody} req
	 * @param {ServerResponseExtended} res
	 * @param {(req: IncomingMessageWithBody, res: ServerResponseExtended) => Promise<void>} notFoundHandler
	 */
	async handle(req, res, notFoundHandler) {
		if (!req.method || !req.url) {
			return notFoundHandler(req, res)
		}

		const match = this.matchRoute(req.method, req.url)
		if (match) {
			req.params = match.params
			await match.handler(req, res)
		} else {
			await notFoundHandler(req, res)
		}
	}
}

export default Router
