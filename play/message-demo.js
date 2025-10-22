/**
 * Demo for HTTPMessage class
 * @param {import("@nan0web/log").default} console
 */
export async function runHTTPMessageDemo(console) {
	console.info("🧪 HTTPMessage Demo")
	console.info("===================")
	
	// Demo 1: Create HTTPMessage
	console.info("\n📋 Creating HTTPMessage:")
	const { default: HTTPMessage } = await import("../src/messages/HTTPMessage.js")
	const message1 = new HTTPMessage({
		url: "/api/users/123",
		headers: {
			"Content-Type": "application/json",
			"X-Request-ID": "req-789"
		},
		body: JSON.stringify({ name: "John Doe", email: "john@example.com" })
	})
	console.info(message1.toString())
	
	// Demo 2: Create message with different headers format
	console.info("\n📋 Creating HTTPMessage with array headers:")
	const message2 = new HTTPMessage({
		url: "/api/posts",
		headers: [
			["Authorization", "Bearer token-xyz"],
			["Accept", "application/json"]
		],
		body: JSON.stringify({ title: "Hello World", content: "This is a test post" })
	})
	console.info(message2.toString())
	
	console.info("\n✅ HTTPMessage demo completed")
}