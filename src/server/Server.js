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
			middlewares = [bodyParser],
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
		this.router.put(path, (req, res) => handler(req, res))
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
		// @todo fix: No overload matches this call.
		// Overload 1 of 4, '(options: ServerOptions<typeof IncomingMessageWithBody, { new (req: IncomingMessageWithBody): ServerResponse<IncomingMessageWithBody>; ... 30 more ...; EventEmitterAsyncResource: typeof EventEmitterAsyncResource; }>, requestListener?: RequestListener<...> | undefined): Server<...>', gave the following error.
		//   Argument of type '{ IncomingMessage: typeof IncomingMessageWithBody; ServerResponse: typeof ServerResponseExtended; ssl: Object | undefined; }' is not assignable to parameter of type 'ServerOptions<typeof IncomingMessageWithBody, { new (req: IncomingMessageWithBody): ServerResponse<IncomingMessageWithBody>; ... 30 more ...; EventEmitterAsyncResource: typeof EventEmitterAsyncResource; }>'.
		//     Type '{ IncomingMessage: typeof IncomingMessageWithBody; ServerResponse: typeof ServerResponseExtended; ssl: Object | undefined; }' is not assignable to type 'ServerOptions<typeof IncomingMessageWithBody, { new (req: IncomingMessageWithBody): ServerResponse<IncomingMessageWithBody>; ... 30 more ...; EventEmitterAsyncResource: typeof EventEmitterAsyncResource; }>'.
		//       Types of property 'ServerResponse' are incompatible.
		//         Types of construct signatures are incompatible.
		//           Type 'new (req: IncomingMessage) => ServerResponseExtended' is not assignable to type 'new (req: IncomingMessageWithBody) => ServerResponse<IncomingMessageWithBody>'.
		//             Construct signature return types 'ServerResponseExtended' and 'ServerResponse<IncomingMessageWithBody>' are incompatible.
		//               The types of 'req' are incompatible between these types.
		//                 Type 'IncomingMessage' is missing the following properties from type 'IncomingMessageWithBody': body, params
		// Overload 2 of 4, '(options: ServerOptions<typeof IncomingMessageWithBody, typeof ServerResponse>, requestListener?: RequestListener<typeof IncomingMessageWithBody, typeof ServerResponse> | undefined): Server<...>', gave the following error.
		//   Argument of type '{ IncomingMessage: typeof IncomingMessageWithBody; ServerResponse: typeof ServerResponseExtended; ssl: Object | undefined; }' is not assignable to parameter of type 'ServerOptions<typeof IncomingMessageWithBody, typeof ServerResponse>'.
		//     Type '{ IncomingMessage: typeof IncomingMessageWithBody; ServerResponse: typeof ServerResponseExtended; ssl: Object | undefined; }' is not assignable to type 'ServerOptions<typeof IncomingMessageWithBody, typeof ServerResponse>'.
		//       Types of property 'ServerResponse' are incompatible.
		//         Types of construct signatures are incompatible.
		//           Type 'new (req: IncomingMessage) => ServerResponseExtended' is not assignable to type 'new <Request extends IncomingMessage = IncomingMessage>(req: Request) => ServerResponse<Request>'.
		//             Construct signature return types 'ServerResponseExtended' and 'ServerResponse<Request>' are incompatible.
		//               The types of 'req' are incompatible between these types.
		//                 Type 'IncomingMessage' is not assignable to type 'Request'.
		//                   'IncomingMessage' is assignable to the constraint of type 'Request', but 'Request' could be instantiated with a different subtype of constraint 'IncomingMessage'.ts(2769)
		const server = this.ssl
			? httpsCreateServer(options, this.handleRequest.bind(this))
			: httpCreateServer(options, this.handleRequest.bind(this))

		return new Promise((resolve) => {
			this.server = server.listen(this.port, this.host, () => {
				console.log(`Server running at http${this.ssl ? 's' : ''}://${this.host}:${this.port}`)
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
			// Run middlewares
			for (const middleware of this.middlewares) {
				await middleware(req, res)
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
