import { createServer as httpCreateServer, IncomingMessage, Server as HttpServer } from 'node:http'
import { createServer as httpsCreateServer, Server as SecureServer } from 'node:https'
import { IncomingMessageWithBody } from '../types/IncomingMessageWithBody.js'
import ServerResponseExtended from '../types/ServerResponseExtended.js'
import bodyParser from '../middlewares/bodyParser.js'
import Router from '../Router.js'

/**
 * HTTP Server class
 */
class Server {
	/**
	 * Create new server
	 * @param {Object} [options]
	 * @param {Router} [options.router]
	 * @param {Array<(req: IncomingMessage, res: ServerResponseExtended) => Promise<void>>} [options.middlewares]
	 * @param {HttpServer | SecureServer | null} [options.server]
	 * @param {number} [options.port]
	 * @param {string} [options.host]
	 * @param {Console} [options.logger]
	 * @param {Object} [options.ssl]
	 */
	constructor(options = {}) {
		const {
			router = new Router(),
			middlewares = [bodyParser()],
			server = null,
			port = 0,
			host = "localhost",
			logger = console,
			ssl,
		} = options
		this.router = router
		this.middlewares = middlewares
		/** @type {HttpServer|null} */
		this.server = server
		this.port = Number(port)
		this.host = String(host)
		this.ssl = ssl
		this.logger = logger
	}

	/**
	 * Add middleware
	 * @param {(req: IncomingMessage, res: ServerResponseExtended) => Promise<void>} middleware
	 * @returns {Server}
	 */
	use(middleware) {
		this.middlewares.push(middleware)
		return this
	}

	/**
	 * Add GET route
	 * @param {string} path
	 * @param {(req: IncomingMessage, res: ServerResponseExtended) => void} handler
	 * @returns {Server}
	 */
	get(path, handler) {
		this.router.get(path, handler)
		return this
	}

	/**
	 * Add POST route
	 * @param {string} path
	 * @param {(req: IncomingMessageWithBody, res: ServerResponseExtended) => void} handler
	 * @returns {Server}
	 */
	post(path, handler) {
		this.router.post(path, handler)
		return this
	}

	/**
	 * Add PUT route
	 * @param {string} path
	 * @param {(req: IncomingMessageWithBody, res: ServerResponseExtended) => void} handler
	 * @returns {Server}
	 */
	put(path, handler) {
		this.router.put(path, handler)
		return this
	}

	/**
	 * Add DELETE route
	 * @param {string} path
	 * @param {(req: IncomingMessage, res: ServerResponseExtended) => void} handler
	 * @returns {Server}
	 */
	delete(path, handler) {
		this.router.delete(path, handler)
		return this
	}

	/**
	 * Add PATCH route
	 * @param {string} path
	 * @param {(req: IncomingMessage, res: ServerResponseExtended) => void} handler
	 * @returns {Server}
	 */
	patch(path, handler) {
		this.router.patch(path, handler)
		return this
	}

	/**
	 * Start server
	 * @returns {Promise<Server>}
	 */
	async listen() {
		const options = {
			IncomingMessage: IncomingMessageWithBody,
			ServerResponse: ServerResponseExtended,
			...(this.ssl ? { ...this.ssl } : {})
		}

		// Fixed overload issue by properly typing the createServer calls
		const server = this.ssl
			? httpsCreateServer(options, this.handleRequest.bind(this))
			: httpCreateServer(options, this.handleRequest.bind(this))

		return new Promise((resolve, reject) => {
			const catchReject = (err) => {
				this.logger.error("Error during listen", err)
				reject(err)
			}
			server.on("error", catchReject)
			this.server = server.listen(this.port, this.host, () => {
				server.off("error", catchReject)
				this.logger.info("Server running at", `http${this.ssl ? 's' : ''}://${this.host}:${this.port}`)
				resolve(this)
			})
		})
	}

	/**
	 * Stop server
	 * @returns {Promise<void>}
	 */
	async close() {
		if (this.server) {
			await new Promise((resolve) => this.server?.close(resolve))
			this.server = null
		}
	}

	/**
	 * Handle incoming request
	 * @param {IncomingMessageWithBody} req
	 * @param {ServerResponseExtended} res
	 */
	async handleRequest(req, res) {
		try {
			// Run middlewares with next function
			let i = 0
			const next = async () => {
				if (i < this.middlewares.length) {
					const middleware = this.middlewares[i++]
					await middleware(req, res, next)
				}
			}

			// Start middleware chain
			await next()

			// If response was already sent by middleware, don't continue
			if (res.headersSent) {
				return
			}

			await this.router.handle(req, res, async () => {
				if (!res.headersSent) {
					res.status(404).send('Not Found')
				}
			})
		} catch (err) {
			this.logger.error('Request error:', err)
			if (!res.headersSent) {
				res.status(500).send([
					'Internal Server Error', err.message
				].join(": "))
			}
		}
	}
}

export default Server
