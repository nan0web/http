/**
 * Demo for HTTPHeaders class
 * @param {import("@nan0web/log").default} console
 */
export async function runHTTPHeadersDemo(console) {
	console.info("🧪 HTTPHeaders Demo")
	console.info("===================")
	
	// Demo 1: Create headers from object
	console.info("\n📋 Creating headers from object:")
	const headers1 = new (await import("../src/messages/HTTPHeaders.js")).default({
		"Content-Type": "application/json",
		"Authorization": "Bearer secret-token",
		"User-Agent": "nan0web-http-client/1.0"
	})
	console.info(headers1.toString())
	
	// Demo 2: Create headers from array
	console.info("\n📋 Creating headers from array:")
	const headers2 = new (await import("../src/messages/HTTPHeaders.js")).default([
		["accept", "application/json"],
		["x-api-key", "key123"]
	])
	console.info(headers2.toString())
	
	// Demo 3: Create headers from string
	console.info("\n📋 Creating headers from string:")
	const headers3 = new (await import("../src/messages/HTTPHeaders.js")).default(
		"Content-Type: text/html\nX-Request-ID: abc123"
	)
	console.info(headers3.toString())
	
	// Demo 4: Headers manipulation
	console.info("\n🛠️  Headers manipulation:")
	const headers4 = new (await import("../src/messages/HTTPHeaders.js")).default()
	headers4.set("Cache-Control", "no-cache")
	headers4.set("Accept-Language", "en-US,en;q=0.9")
	console.info(`Size: ${headers4.size}`)
	console.info(`Has Cache-Control: ${headers4.has("Cache-Control")}`)
	console.info(`Cache-Control value: ${headers4.get("Cache-Control")}`)
	console.info("Headers as object:")
	console.info(JSON.stringify(headers4.toObject(), null, 2))
	
	console.info("\n✅ HTTPHeaders demo completed")
}