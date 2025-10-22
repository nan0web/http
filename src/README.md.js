import { describe, it, before, beforeEach } from "node:test"
import assert from "node:assert/strict"
import FS from "@nan0web/db-fs"
import { NoConsole } from "@nan0web/log"
import {
	DatasetParser,
	DocsParser,
	runSpawn,
} from "@nan0web/test"
import {
	HTTPStatusCode,
	AbortError,
	HTTPError,
	HTTPHeaders,
	HTTPMessage,
	HTTPMethods,
	HTTPMethodValidator,
	HTTPIncomingMessage,
	HTTPResponseMessage,
} from "./index.js"

const fs = new FS()
let pkg

// Load package.json once before tests
before(async () => {
	const doc = await fs.loadDocument("package.json", {})
	pkg = doc || {}
})

let console = new NoConsole()

beforeEach((info) => {
	console = new NoConsole()
})

/**
 * Core test suite that also serves as the source for README generation.
 *
 * The block comments inside each `it` block are extracted to build
 * the final `README.md`. Keeping the comments here ensures the
 * documentation stays close to the code.
 */
function testRender() {
	/**
	 * @docs
	 * # @nan0web/http
	 *
	 * <!-- %PACKAGE_STATUS% -->
	 *
	 * HTTP classes for nan0web
	 *
	 * ## Installation
	 */
	it("How to install with npm?", () => {
		/**
		 * ```bash
		 * npm install @nan0web/http
		 * ```
		 */
		assert.equal(pkg.name, "@nan0web/http")
	})
	/**
	 * @docs
	 */
	it("How to install with pnpm?", () => {
		/**
		 * ```bash
		 * pnpm add @nan0web/http
		 * ```
		 */
		assert.equal(pkg.name, "@nan0web/http")
	})
	/**
	 * @docs
	 */
	it("How to install with yarn?", () => {
		/**
		 * ```bash
		 * yarn add @nan0web/http
		 * ```
		 */
		assert.equal(pkg.name, "@nan0web/http")
	})

	/**
	 * @docs
	 * ## Usage
	 *
	 * ### HTTP Status Codes
	 *
	 * A dictionary of HTTP status codes and their descriptions.
	 */
	it("How to get HTTP status text by code?", () => {
		//import { HTTPStatusCode } from '@nan0web/http'
		console.info(HTTPStatusCode.get(200)) // OK
		console.info(HTTPStatusCode.get(404)) // Not Found
		console.info(HTTPStatusCode.get(418)) // I'm a teapot (RFC 2324)
		assert.equal(console.output()[0][1], "OK")
		assert.equal(console.output()[1][1], "Not Found")
		assert.equal(console.output()[2][1], "I'm a teapot")
	})

	/**
	 * @docs
	 * ### HTTP Errors
	 *
	 * Custom error classes for HTTP-related errors.
	 */
	it("How to create an HTTPError instance?", () => {
		//import { HTTPError } from '@nan0web/http'
		try {
			throw new HTTPError("Bad Request", 400)
		} catch (/** @type {any} */ error) {
			console.info(error.toString()) // HTTPError [400] Bad Request\n<stack trace>
		//}
			assert.ok(error instanceof HTTPError)
			assert.equal(error.status, 400)
			assert.equal(error.message, "Bad Request")
		}
	})

	/**
	 * @docs
	 */
	it("How to create an AbortError instance?", () => {
		//import { AbortError } from '@nan0web/http'
		try {
			throw new AbortError("Request was cancelled by user")
		} catch (/** @type {any} */ error) {
			console.info(error.name) // AbortError
			console.info(error.message) // Request was cancelled by user
		//}
			assert.ok(error instanceof AbortError)
			assert.equal(error.name, "AbortError")
			assert.equal(error.message, "Request was cancelled by user")
		}
	})

	/**
	 * @docs
	 * ### HTTP Headers
	 *
	 * A class for managing HTTP headers that supports multiple input formats.
	 */
	it("How to create HTTPHeaders from object?", () => {
		//import { HTTPHeaders } from '@nan0web/http'
		const headers = new HTTPHeaders({
			"Content-Type": "application/json",
			"Authorization": "Bearer secret-token",
			"User-Agent": "nan0web-http-client/1.0"
		})
		console.info(headers.toString())
		// Content-Type: application/json
		// Authorization: Bearer secret-token
		// User-Agent: nan0web-http-client/1.0
		assert.equal(headers.size, 3)
		assert.equal(headers.get("Content-Type"), "application/json")
	})

	/**
	 * @docs
	 */
	it("How to create HTTPHeaders from array?", () => {
		//import { HTTPHeaders } from '@nan0web/http'
		const headers = new HTTPHeaders([
			["accept", "application/json"],
			["x-api-key", "key123"]
		])
		console.info(headers.toString()) // Accept: application/json\nX-Api-Key: key123
		assert.equal(headers.size, 2)
		assert.equal(headers.get("accept"), "application/json")
	})

	/**
	 * @docs
	 */
	it("How to create HTTPHeaders from string?", () => {
		//import { HTTPHeaders } from '@nan0web/http'
		const headers = new HTTPHeaders(
			"Content-Type: text/html\nX-Request-ID: abc123"
		)
		console.info(headers.toString()) // Content-Type: text/html\nX-Request-ID: abc123
		assert.equal(headers.size, 2)
		assert.equal(headers.get("Content-Type"), "text/html")
	})

	/**
	 * @docs
	 */
	it("How to manipulate HTTPHeaders?", () => {
		//import { HTTPHeaders } from '@nan0web/http'
		const headers = new HTTPHeaders()
		headers.set("Cache-Control", "no-cache")
		headers.set("Accept-Language", "en-US,en;q=0.9")
		console.info(headers.size) // 2
		console.info(headers.has("Cache-Control")) // true
		console.info(headers.get("Cache-Control")) // no-cache
		console.info(JSON.stringify(headers.toObject(), null, 2))
		// {
		//   "Cache-Control": "no-cache",
		//   "Accept-Language": "en-US,en;q=0.9"
		// }
		assert.equal(headers.size, 2)
		assert.equal(headers.has("Cache-Control"), true)
		assert.equal(headers.get("Cache-Control"), "no-cache")
	})

	/**
	 * @docs
	 * ### HTTP Message
	 *
	 * Base class for HTTP messages with URL, headers, and optional body.
	 */
	it("How to create an HTTPMessage instance?", () => {
		//import { HTTPMessage } from '@nan0web/http'
		const message = new HTTPMessage({
			url: "/api/test",
			headers: {
				"Content-Type": "application/json"
			},
			body: '{"test": true}'
		})
		console.info(message.toString())
		// </api/test>
		// Content-Type: application/json
		//
		// {"test": true}
		assert.equal(message.url, "/api/test")
		assert.equal(message.headers.get("Content-Type"), "application/json")
		assert.equal(message.body, '{"test": true}')
	})

	/**
	 * @docs
	 * ### HTTP Incoming Message
	 *
	 * Extends HTTPMessage to represent client requests with methods.
	 */
	it("How to create an HTTPIncomingMessage instance?", () => {
		//import { HTTPIncomingMessage } from '@nan0web/http'
		const getRequest = new HTTPIncomingMessage({
			method: "GET",
			url: "/api/users",
			headers: {
				"Accept": "application/json",
				"User-Agent": "nan0web-client/1.0"
			}
		})
		console.info(getRequest.toString())
		// GET </api/users>
		// Accept: application/json
		// User-Agent: nan0web-client/1.0
		assert.equal(getRequest.method, "GET")
		assert.equal(getRequest.url, "/api/users")
	})

	/**
	 * @docs
	 */
	it("How to validate HTTP methods?", () => {
		//import { HTTPMethodValidator } from '@nan0web/http'
		console.info(HTTPMethodValidator("GET")) // GET
		//console.info(HTTPMethodValidator("INVALID")) // throws TypeError
		assert.equal(console.output()[0][1], "GET")
		assert.throws(() => HTTPMethodValidator("INVALID"), {
			message: /Enumeration must have one value of/
		})
	})

	/**
	 * @docs
	 * ### HTTP Response Message
	 *
	 * Extends HTTPMessage to represent server responses with status information.
	 */
	it("How to create an HTTPResponseMessage instance?", async () => {
		//import { HTTPResponseMessage } from '@nan0web/http'
		const successResponse = new HTTPResponseMessage({
			url: "/api/users",
			status: 200,
			statusText: "OK",
			ok: true,
			headers: {
				"Content-Type": "application/json",
				"X-Response-Time": "45ms"
			},
			body: JSON.stringify([{ id: 1, name: "John" }, { id: 2, name: "Jane" }])
		})
		console.info(successResponse.status) // 200
		console.info(successResponse.statusText) // OK
		console.info(successResponse.ok) // true
		console.info(await successResponse.text()) // [{"id":1,"name":"John"},{"id":2,"name":"Jane"}]
		assert.equal(successResponse.status, 200)
		assert.equal(successResponse.statusText, "OK")
		assert.equal(successResponse.ok, true)
	})

	/**
	 * @docs
	 */
	it("How to clone an HTTPResponseMessage instance?", async () => {
		//import { HTTPResponseMessage } from '@nan0web/http'
		const original = new HTTPResponseMessage({
			url: "/api/data",
			status: 200,
			body: "Hello world"
		})
		const cloned = original.clone()
		console.info(original.url) // /api/data
		console.info(cloned.url) // /api/data
		console.info(await original.text() === await cloned.text()) // true
		assert.equal(original.url, cloned.url)
		assert.equal(await original.text(), await cloned.text())
		assert.ok(cloned instanceof HTTPResponseMessage)
	})

	/**
	 * @docs
	 * ## API
	 *
	 * ### HTTPStatusCode
	 *
	 * * **Methods**
	 *   * `static get(code)` – Returns status text for a given code or "Unknown" if not found.
	 *
	 * ### AbortError
	 *
	 * Extends `Error`.
	 *
	 * * **Constructor**
	 *   * `new AbortError(message = "Request aborted")` – Creates an AbortError with optional custom message.
	 *
	 * ### HTTPError
	 *
	 * Extends `Error`.
	 *
	 * * **Properties**
	 *   * `status` – HTTP status code.
	 *
	 * * **Constructor**
	 *   * `new HTTPError(message, status = 400)` – Creates an HTTPError with message and status code.
	 *
	 * * **Methods**
	 *   * `toString()` – Returns formatted error string with status, message, and stack trace.
	 *
	 * ### HTTPHeaders
	 *
	 * * **Properties**
	 *   * `size` – Number of headers.
	 *
	 * * **Constructor**
	 *   * `new HTTPHeaders(input = {})` – Creates headers from object, array, or string.
	 *
	 * * **Methods**
	 *   * `has(name)` – Returns true if header exists.
	 *   * `get(name)` – Returns header value.
	 *   * `set(name, value)` – Sets a header.
	 *   * `delete(name)` – Deletes a header.
	 *   * `toArray()` – Returns array of formatted header strings.
	 *   * `toString()` – Returns string representation of all headers.
	 *   * `toObject()` – Returns object with header names and values.
	 *   * `static from(input)` – Returns existing instance or creates new one.
	 *
	 * ### HTTPMessage
	 *
	 * * **Properties**
	 *   * `url` – Request/Response URL.
	 *   * `headers` – HTTPHeaders instance.
	 *   * `body` – Optional message body.
	 *
	 * * **Constructor**
	 *   * `new HTTPMessage(input = {})` – Creates message with URL, headers, and optional body.
	 *
	 * * **Methods**
	 *   * `toString()` – Returns string representation of the message.
	 *   * `static from(input)` – Returns existing instance or creates new one.
	 *
	 * ### HTTPIncomingMessage
	 *
	 * Extends `HTTPMessage`.
	 *
	 * * **Properties**
	 *   * `method` – HTTP method (GET, POST, etc.).
	 *
	 * * **Constructor**
	 *   * `new HTTPIncomingMessage(input = {})` – Creates incoming message with method.
	 *
	 * * **Methods**
	 *   * `toString()` – Returns string representation including method.
	 *   * `static from(input)` – Returns existing instance or creates new one.
	 *
	 * ### HTTPMethods
	 *
	 * Static constants for HTTP methods:
	 * * `HTTPMethods.GET`
	 * * `HTTPMethods.POST`
	 * * `HTTPMethods.PATCH`
	 * * `HTTPMethods.PUT`
	 * * `HTTPMethods.DELETE`
	 * * `HTTPMethods.HEAD`
	 * * `HTTPMethods.OPTIONS`
	 *
	 * ### HTTPMethodValidator
	 *
	 * Function that validates HTTP method strings against allowed methods.
	 *
	 * ### HTTPResponseMessage
	 *
	 * Extends `HTTPMessage`.
	 *
	 * * **Properties**
	 *   * `ok` – Boolean indicating if status is successful (2xx).
	 *   * `status` – HTTP status code.
	 *   * `statusText` – Status text description.
	 *   * `type` – Response type (basic, cors, etc.).
	 *   * `redirected` – Boolean indicating if response was redirected.
	 *
	 * * **Constructor**
	 *   * `new HTTPResponseMessage(input = {})` – Creates response message with status info.
	 *
	 * * **Methods**
	 *   * `clone()` – Returns a cloned response message.
	 *   * `json()` – Returns JSON-parsed body.
	 *   * `text()` – Returns body as string.
	 */
	it("All exported classes should pass basic test to ensure API examples work", () => {
		assert.ok(HTTPStatusCode)
		assert.ok(AbortError)
		assert.ok(HTTPError)
		assert.ok(HTTPHeaders)
		assert.ok(HTTPMessage)
		assert.ok(HTTPMethods)
		assert.ok(HTTPMethodValidator)
		assert.ok(HTTPIncomingMessage)
		assert.ok(HTTPResponseMessage)
	})

	/**
	 * @docs
	 * ## Java•Script
	 */
	it("Uses `d.ts` files for autocompletion", () => {
		assert.equal(pkg.types, "types/index.d.ts")
	})

	/**
	 * @docs
	 * ## CLI Playground
	 */
	it("How to run playground script?", async () => {
		/**
		 * ```bash
		 * # Clone the repository and run the CLI playground
		 * git clone https://github.com/nan0web/http.git
		 * cd http
		 * npm install
		 * npm run play
		 * ```
		 */
		assert.ok(String(pkg.scripts?.play))
		const response = await runSpawn("git", ["remote", "get-url", "origin"])
		assert.ok(response.code === 0, "git command fails (e.g., not in a git repo)")
		assert.ok(response.text.trim().endsWith(":nan0web/http.git"))
	})

	/**
	 * @docs
	 * ## Contributing
	 */
	it("How to contribute? - [check here](./CONTRIBUTING.md)", async () => {
		assert.equal(pkg.scripts?.precommit, "npm test")
		assert.equal(pkg.scripts?.prepush, "npm test")
		assert.equal(pkg.scripts?.prepare, "husky")
		const text = await fs.loadDocument("CONTRIBUTING.md")
		const str = String(text)
		assert.ok(str.includes("# Contributing"))
	})

	/**
	 * @docs
	 * ## License
	 */
	it("How to license ISC? - [check here](./LICENSE)", async () => {
		/** @docs */
		const text = await fs.loadDocument("LICENSE")
		assert.ok(String(text).includes("ISC"))
	})
}

describe("README.md testing", testRender)

describe("Rendering README.md", async () => {
	let text = ""
	const format = new Intl.NumberFormat("en-US").format
	const parser = new DocsParser()
	text = String(parser.decode(testRender))
	await fs.saveDocument("README.md", text)
	const dataset = DatasetParser.parse(text, pkg.name)
	await fs.saveDocument(".datasets/README.dataset.jsonl", dataset)

	it(`document is rendered in README.md [${format(Buffer.byteLength(text))}b]`, async () => {
		const text = await fs.loadDocument("README.md")
		assert.ok(text.includes("## License"))
	})
})
