import { createServer as httpCreateServer } from 'node:http'
import { createServer as httpsCreateServer } from 'node:https'
import Router from './Router.js'
import ServerResponse from './ServerResponse.js'

/**
 * Creates a new HTTP server instance
 * @class
 * @param {Object} options - Server options
 * @param {number} options.port - Port to listen on
 * @param {string} options.host - Host to listen on
 * @param {Object} options.ssl - SSL options for HTTPS
 * @param {Object} options.logger - Custom logger (defaults to console)
 * @param {Array} options.cors - CORS headers
 * @param {Array} options.middlewares - Middleware functions
 */
class Server {
	constructor(options = {}) {
		this.port = options.port ?? 3000
		this.host = options.host ?? 'localhost'
		this.ssl = options.ssl
		this.logger = options.logger || console
		this.router = options.router || new Router()
		this.server = null
		this.middlewares = options.middlewares || []
		this.cors = options.cors || []
		this.config = options.config
	}

	/**
	 * Adds middleware or router to the server
	 * @param {Function|Router} fn - Middleware function or Router instance
	 */
	use(fn) {
		if (fn instanceof Router) {
			this.router.use((req, res, next) => fn.handle(req, res, next))
		} else {
			this.router.use(fn)
		}
		return this
	}

	// Delegate HTTP methods to router
	get(path, ...handlers) {
		this.router.get(path, ...handlers)
		return this
	}
	post(path, ...handlers) {
		this.router.post(path, ...handlers)
		return this
	}
	put(path, ...handlers) {
		this.router.put(path, ...handlers)
		return this
	}
	delete(path, ...handlers) {
		this.router.delete(path, ...handlers)
		return this
	}
	patch(path, ...handlers) {
		this.router.patch(path, ...handlers)
		return this
	}
	head(path, ...handlers) {
		this.router.head(path, ...handlers)
		return this
	}
	options(path, ...handlers) {
		this.router.options(path, ...handlers)
		return this
	}

	get url() {
		return `http${this.ssl ? 's' : ''}://${this.host}:${this.port}`
	}

	/**
	 * Starts the server
	 * @returns {Promise} Resolves when server is listening
	 */
	async listen() {
		const server = this.ssl
			? httpsCreateServer(this.ssl, this.handleRequest.bind(this))
			: httpCreateServer(this.handleRequest.bind(this))

		this.server = server
		await new Promise(resolve => server.listen(this.port, this.host, resolve))
		return this
	}

	/**
	 * Runs middleware stack
	 * @param {IncomingMessage} req - Request object
	 * @param {ServerResponse} res - Response object
	 */
	async runMiddlewares(req, res) {
		if (!(res instanceof ServerResponse)) {
			res = new ServerResponse(res, this)
		}
		let index = 0
		const self = this
		req.config = this.config
		req.context = {}
		async function next(err) {
			if (err) {
				return res.status(500).end(`Error: ${err.message}`)
			}
			const middleware = self.middlewares[index++]
			if (middleware) {
				await middleware(req, res, next)
			}
		}
		await next()
	}

	/**
	 * Handles incoming requests
	 * @param {IncomingMessage} req - Request object
	 * @param {ServerResponse} res - Response object
	 */
	async handleRequest(req, res) {
		if (!(res instanceof ServerResponse)) {
			res = new ServerResponse(res, this)
		}
		try {
			await this.runMiddlewares(req, res)
			await this.router.handle(req, res, (req, res) => {
				res.status(404).set('Content-Type', 'text/plain').send('Not Found')
			})
		} catch (error) {
			this.logger.error('Request error:', error)
			res.status(500).set('Content-Type', 'text/plain').send('Internal Server Error')
		}
	}

	/**
	 * Closes the server
	 * @returns {Promise} Resolves when server is closed
	 */
	async close() {
		if (this.server) {
			await new Promise(resolve => this.server.close(resolve))
			this.logger.info('Server closed')
		}
	}
}

/**
 * Creates a new Server instance
 * @param {Object} options - Server options
 * @returns {Server} New server instance
 */
export function createServer(options = {}) {
	return new Server(options)
}

export { Router, Server }
export default createServer