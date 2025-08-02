import fetch, { NodeResponse, httpMethods, APIRequest, get, post, put, patch, del, head, options } from "./fetch.js"
import statusCodes from "./status-codes.js"
import { readVars, decodeBody } from "./vars.js"
import ServerResponse from "./ServerResponse.js"
import createServer, { Router, Server } from "./server.js"

export {
	fetch, NodeResponse, ServerResponse, httpMethods, APIRequest, statusCodes,
	readVars, decodeBody,
	createServer, Router, Server,
	get, post, put, patch, del, head, options
}

export default fetch
