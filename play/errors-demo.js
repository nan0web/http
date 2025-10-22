/**
 * Demo for HTTP errors
 * @param {import("@nan0web/log").default} console
 */
export async function runHTTPErrorsDemo(console) {
	console.info("🧪 HTTP Errors Demo")
	console.info("===================")
	
	// Demo 1: HTTPError
	console.info("\n📋 Creating HTTPError:")
	const { default: HTTPError } = await import("../src/errors/HTTPError.js")
	try {
		throw new HTTPError("Bad Request", 400)
	} catch (error) {
		console.info(`Caught error: ${error.toString()}`)
	}
	
	// Demo 2: Custom HTTPError
	console.info("\n📋 Creating custom HTTPError:")
	try {
		throw new HTTPError("Resource not found", 404)
	} catch (error) {
		console.info(`Status: ${error.status}`)
		console.info(`Message: ${error.message}`)
	}
	
	// Demo 3: AbortError
	console.info("\n📋 Creating AbortError:")
	const { default: AbortError } = await import("../src/errors/AbortError.js")
	try {
		throw new AbortError("Request was cancelled by user")
	} catch (error) {
		console.info(`Error name: ${error.name}`)
		console.info(`Error message: ${error.message}`)
	}
	
	// Demo 4: Default AbortError message
	console.info("\n📋 Creating AbortError with default message:")
	try {
		throw new AbortError()
	} catch (error) {
		console.info(`Default message: ${error.message}`)
	}
	
	console.info("\n✅ HTTP Errors demo completed")
}