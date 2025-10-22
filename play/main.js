#!/usr/bin/env node

import process from "node:process"

import Logger from "@nan0web/log"
import { select } from "@nan0web/ui-cli"

import { runHTTPHeadersDemo } from "./headers-demo.js"
import { runHTTPMessageDemo } from "./message-demo.js"
import { runHTTPIncomingMessageDemo } from "./incoming-message-demo.js"
import { runHTTPResponseMessageDemo } from "./response-message-demo.js"
import { runHTTPStatusCodeDemo } from "./status-code-demo.js"
import { runHTTPErrorsDemo } from "./errors-demo.js"

const console = new Logger({ level: "info" })

// Clear screen and show only logo initially
console.clear()
console.info(Logger.style(Logger.LOGO, { color: "magenta" }))

async function chooseDemo() {
	const demos = [
		{ name: "HTTP Headers", value: "headers" },
		{ name: "HTTP Message", value: "message" },
		{ name: "HTTP Incoming Message", value: "incoming" },
		{ name: "HTTP Response Message", value: "response" },
		{ name: "HTTP Status Codes", value: "status" },
		{ name: "HTTP Errors", value: "errors" },
		{ name: "← Exit", value: "exit" }
	]

	const choice = await select({
		title: "Select HTTP demo to run:",
		prompt: "[me]: ",
		invalidPrompt: Logger.style("[me invalid]", { color: "red" }) + ": ",
		options: demos.map(d => d.name),
		console
	})

	return demos[choice.index].value
}

async function showMenu() {
	console.info("\n" + "=".repeat(50))
	console.info("Demo completed. Returning to menu...")
	console.info("=".repeat(50) + "\n")
}

async function main() {
	while (true) {
		try {
			const demoType = await chooseDemo()

			switch (demoType) {
				case "headers":
					await runHTTPHeadersDemo(console)
					break
				case "message":
					await runHTTPMessageDemo(console)
					break
				case "incoming":
					await runHTTPIncomingMessageDemo(console)
					break
				case "response":
					await runHTTPResponseMessageDemo(console)
					break
				case "status":
					await runHTTPStatusCodeDemo(console)
					break
				case "errors":
					await runHTTPErrorsDemo(console)
					break
				case "exit":
					process.exit(0)
					break
				default:
					console.warn("Unknown demo type selected")
			}

			await showMenu()
		} catch (error) {
			if (error.message && error.message.includes("cancel")) {
				console.warn("\nDemo selection cancelled. Returning to menu...")
				await showMenu()
			} else {
				throw error
			}
		}
	}
}

main().then(() => {
	process.exit(0)
}).catch(err => {
	console.error(err)
	process.exit(1)
})