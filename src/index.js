import { createServer, Server } from './server/index.js'
import Router from './Router.js'
import middlewares from "./middlewares/index.js"

export {
	Router,
	createServer,
	Server,
	middlewares,
}

export default createServer
