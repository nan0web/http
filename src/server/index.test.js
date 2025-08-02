import createServer from './index.js'
import { createServer as createHttpServer } from "node:http"
import { suite, describe, it } from 'node:test'
import assert from 'node:assert'

const getAvailablePort = async () => {
	const server = createHttpServer()
	server.listen(0)
	const addr = server.address()
	server.close()
	return Number(addr?.port || 0)
}

class NoConsole {
	static #logs = []
	static clear() {
		this.#logs = []
	}
	static debug() {
		this.#logs.push(["debug", ...args])
	}
	static info(...args) {
		this.#logs.push(["info", ...args])
	}
	static warn(...args) {
		this.#logs.push(["warn", ...args])
	}
	static error(...args) {
		this.#logs.push(["error", ...args])
	}
	static log(...args) {
		this.#logs.push(["log", ...args])
	}
	static output() {
		return this.#logs
	}
}

const testCases = [
	{
		method: "GET",
		path: "/index.json",
		expected: { key: "value" },
		description: "should return JSON data for GET request"
	},
	{
		method: "POST",
		path: "/index.json",
		expected: { ok: "saved" },
		description: "should handle POST request and return success"
	},
	{
		method: "DELETE",
		path: "/index.json",
		expected: { ok: "deleted" },
		description: "should handle DELETE request and return success"
	},
	{
		method: "PUT",
		path: "/index.json",
		expected: { ok: "updated" },
		description: "should handle PUT request and return success"
	},
	{
		method: "PATCH",
		path: "/index.json",
		expected: { ok: "patched" },
		description: "should handle PATCH request and return success"
	}
]

suite("Server scenarios", () => {
	describe("Basic HTTP methods", () => {
		testCases.forEach(({ method, path, expected, description }) => {
			it(description, async () => {
				const port = await getAvailablePort()
				const server = createServer({ port })

				server[method.toLowerCase()](path, (req, res) => {
					res.json(expected)
				})

				await server.listen()

				const response = await fetch(`http://localhost:${port}${path}`, {
					method
				})

				assert.deepEqual(await response.json(), expected)
				await server.close()
			})
		})
	})

	describe("Route handling", () => {
		it("should handle routes with parameters", async () => {
			const port = await getAvailablePort()
			const server = createServer({ port })
			const testId = "12345"

			server.get('/users/:id', (req, res) => {
				res.end(`User ${req.params.id}`)
			})

			await server.listen()

			const response = await fetch(`http://localhost:${port}/users/${testId}`)
			assert.equal(await response.text(), `User ${testId}`)

			await server.close()
		})

		it("should handle wildcard routes", async () => {
			const port = await getAvailablePort()
			const server = createServer({ port })
			const testPath = "/files/docs/readme.txt"

			server.get('/files/*', (req, res) => {
				res.end(`Path: ${req.url}`)
			})

			await server.listen()

			const response = await fetch(`http://localhost:${port}${testPath}`)
			assert.equal(await response.text(), `Path: ${testPath}`)

			await server.close()
		})
	})

	describe("Body parsing", () => {
		it("should parse JSON request body", async () => {
			const port = await getAvailablePort()
			const server = createServer({ port })
			const testBody = { test: "value" }

			server.post('/echo', (req, res) => {
				res.json(req.body)
			})

			await server.listen()

			const response = await fetch(`http://localhost:${port}/echo`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(testBody)
			})

			assert.deepEqual(await response.json(), testBody)
			await server.close()
		})

		it("should parse form-urlencoded request body", async () => {
			const port = await getAvailablePort()
			const server = createServer({ port })
			const testBody = { key: "value", test: "123" }
			const formBody = new URLSearchParams(testBody).toString()

			server.post('/echo', (req, res) => {
				res.json(req.body)
			})

			await server.listen()

			const response = await fetch(`http://localhost:${port}/echo`, {
				method: "POST",
				headers: { "Content-Type": "application/x-www-form-urlencoded" },
				body: formBody
			})

			assert.deepEqual(await response.json(), testBody)
			await server.close()
		})
	})

	describe("Error handling", () => {
		it("should return 404 for unknown routes", async () => {
			const port = await getAvailablePort()
			const server = createServer({ port })

			await server.listen()

			const response = await fetch(`http://localhost:${port}/unknown`)
			assert.equal(response.status, 404)

			await server.close()
		})

		it("should return 500 for route errors", async () => {
			const port = await getAvailablePort()
			const server = createServer({ port, logger: NoConsole })

			server.get('/error', () => {
				throw new Error("Test error")
			})

			await server.listen()

			const response = await fetch(`http://localhost:${port}/error`)
			const text = await response.text()
			assert.equal(response.status, 500)
			assert.equal(text, "Internal Server Error: Test error")
			const output = NoConsole.output()
			assert.equal(output[0][0], "error")
			assert.equal(output[0][1], "Request error:")
			assert.equal(output[0][2].message, "Test error")

			await server.close()
		})
	})
})
