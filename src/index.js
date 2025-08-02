import { createServer, Server } from './server/index.js'
import Router from './Router.js'
import middlewares from "./middlewares/index.js"
import fetch, {
	APIRequest, get, post, put, patch, head, options, del
} from "./client/fetch.js"
import HTTPResponse from './client/HTTPResponse.js'

import statusCodes from "./status-codes.js"
import IncomingMessageWithBody from './types/IncomingMessageWithBody.js'
import ServerResponseExtended from './types/ServerResponseExtended.js'
import HTTPError from './errors/HTTPError.js'

export {
	statusCodes,

	fetch,
	APIRequest, get, post, put, patch, head, options, del,

	HTTPResponse,
	HTTPError,

	middlewares,

	Router,
	createServer,
	Server,
	IncomingMessageWithBody,
	ServerResponseExtended,
}

export default fetch
