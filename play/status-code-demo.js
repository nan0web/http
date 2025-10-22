/**
 * Demo for HTTPStatusCode class
 * @param {import("@nan0web/log").default} console
 */
export async function runHTTPStatusCodeDemo(console) {
	console.info("🧪 HTTPStatusCode Demo")
	console.info("======================")
	
	// Demo 1: Show all status codes
	console.info("\n📋 Common HTTP Status Codes:")
	const { default: HTTPStatusCode } = await import("../src/HTTPStatusCode.js")
	
	const commonCodes = [
		200, 201, 204,
		301, 302, 304,
		400, 401, 403, 404, 405, 429,
		500, 502, 503, 504
	]
	
	for (const code of commonCodes) {
		console.info(`${code}: ${HTTPStatusCode.get(code)}`)
	}
	
	// Demo 2: April Fools' RFC 2324
	console.info("\n🍵 RFC 2324 - Hyper Text Coffee Pot Control Protocol:")
	console.info(`418: ${HTTPStatusCode.get(418)}`)
	
	// Demo 3: Error handling for unknown codes
	console.info("\n❓ Unknown status code:")
	console.info(`999: ${HTTPStatusCode.get(999)}`)
	
	console.info("\n✅ HTTPStatusCode demo completed")
}