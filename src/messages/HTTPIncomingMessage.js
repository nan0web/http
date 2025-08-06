import { Enum } from "@nan0web/types"
import HTTPMessage from "./HTTPMessage.js"

/**
 * @typedef {"GET" | "POST" | "PATCH" | "PUT" | "DELETE" | "HEAD" | "OPTIONS"} HTTPMethod
 */

/**
 * @typedef {Object} HTTPIncomingMessageOptions
 * @property {HTTPMethod} [method="GET"] - HTTP method (GET, POST, etc.)
 * @property {string} [url=""] - Request URL
 * @property {Record<string, string> | Array<[string, string]>} [headers=[]] - Request headers
 * @property {string} [body] - Request body (optional)
 */

export const HTTPMethods = {
	GET: "GET",
	POST: "POST",
	PATCH: "PATCH",
	PUT: "PUT",
	DELETE: "DELETE",
	HEAD: "HEAD",
	OPTIONS: "OPTIONS",
}
export const HTTPMethodValidator = Enum(...Object.keys(HTTPMethods))

/**
 * HTTP Incoming Message class for both browser and Node.js environments
 */
class HTTPIncomingMessage extends HTTPMessage {
	static Methods = HTTPMethods
	/** @type {HTTPMethod} */
	method

	/**
	 * Creates a new HTTPIncomingMessage instance
	 * @param {HTTPIncomingMessageOptions} [input={}] - HTTP incoming message options
	 */
	constructor(input = {}) {
		super(input)
		const {
			method = "GET",
		} = input
		this.method = HTTPMethodValidator(method)
	}

	/**
	 * Returns string representation of the HTTP incoming message
	 * @returns {string}
	 */
	toString() {
		return this.method + " " + super.toString()
	}

	/**
	 * Creates HTTPIncomingMessage from input
	 * @param {HTTPIncomingMessageOptions} input - Input data
	 * @returns {HTTPIncomingMessage}
	 */
	static from(input) {
		if (input instanceof HTTPIncomingMessage) return input
		return new HTTPIncomingMessage(input)
	}
}

export default HTTPIncomingMessage
