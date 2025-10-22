/**
 * Demo for HTTPResponseMessage class
 * @param {import("@nan0web/log").default} console
 */
export async function runHTTPResponseMessageDemo(console) {
	console.info("🧪 HTTPResponseMessage Demo")
	console.info("===========================")
	
	// Demo 1: Create successful response
	console.info("\n📋 Creating successful response:")
	const { default: HTTPResponseMessage } = await import("../src/messages/HTTPResponseMessage.js")
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
	console.info(`Status: ${successResponse.status} (${successResponse.statusText})`)
	console.info(`OK: ${successResponse.ok}`)
	console.info(`Headers:\n${successResponse.headers.toString()}`)
	console.info("Body (text):")
	console.info(await successResponse.text())
	console.info("Body (json):")
	console.info(await successResponse.json())
	
	// Demo 2: Create error response
	console.info("\n📋 Creating error response:")
	const errorResponse = new HTTPResponseMessage({
		url: "/api/users/999",
		status: 404,
		statusText: "Not Found",
		ok: false,
		headers: [
			["Content-Type", "application/json"],
			["X-Error-Code", "USER_NOT_FOUND"]
		],
		body: JSON.stringify({ error: "User not found", code: 404 })
	})
	console.info(`Status: ${errorResponse.status} (${errorResponse.statusText})`)
	console.info(`OK: ${errorResponse.ok}`)
	console.info("Response headers:")
	console.info(errorResponse.headers.toString())
	
	// Demo 3: Clone response
	console.info("\n📋 Cloning response:")
	const clonedResponse = successResponse.clone()
	console.info(`Original URL: ${successResponse.url}`)
	console.info(`Cloned URL: ${clonedResponse.url}`)
	console.info(`Same body: ${await successResponse.text() === await clonedResponse.text()}`)
	
	console.info("\n✅ HTTPResponseMessage demo completed")
}