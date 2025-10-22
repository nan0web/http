/**
 * Demo for HTTPIncomingMessage class
 * @param {import("@nan0web/log").default} console
 */
export async function runHTTPIncomingMessageDemo(console) {
	console.info("🧪 HTTPIncomingMessage Demo")
	console.info("===========================")
	
	// Demo 1: Create GET request
	console.info("\n📋 Creating GET request:")
	const { default: HTTPIncomingMessage } = await import("../src/messages/HTTPIncomingMessage.js")
	const getRequest = new HTTPIncomingMessage({
		method: "GET",
		url: "/api/users",
		headers: {
			"Accept": "application/json",
			"User-Agent": "nan0web-client/1.0"
		}
	})
	console.info(getRequest.toString())
	
	// Demo 2: Create POST request
	console.info("\n📋 Creating POST request:")
	const postRequest = new HTTPIncomingMessage({
		method: "POST",
		url: "/api/users",
		headers: [
			["Content-Type", "application/json"],
			["Authorization", "Bearer secret"]
		],
		body: JSON.stringify({ name: "Jane Smith", email: "jane@example.com" })
	})
	console.info(postRequest.toString())
	
	// Demo 3: Create request with default method
	console.info("\n📋 Creating request with default method (GET):")
	const defaultRequest = new HTTPIncomingMessage({
		url: "/api/status"
	})
	console.info(defaultRequest.toString())
	
	console.info("\n✅ HTTPIncomingMessage demo completed")
}