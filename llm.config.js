export default {
	collection: "nanoweb-http",
	monorepo: "nanoweb",
	resolve: {
		target: [
			"lib",
			"test",
			"index.d.ts",
			"package.json",
			"vitest.config.js"
		],
		accept: [
			{ endsWith: ".js" },
			{ endsWith: ".jsx" },
			{ endsWith: ".ts" },
			{ endsWith: ".tsx" },
			{ endsWith: ".json" },
			{ endsWith: ".html" },
			{ endsWith: ".css" },
			{ endsWith: ".scss" },
			{ endsWith: ".md" },
			{ endsWith: ".yml" },
			{ endsWith: ".yaml" },
			{ endsWith: ".nano" },
		],
		skip: [
			"coverage", "dist", "llm", "node_modules",
			{ includes: ".min." },
		]
	},
	changelog: {
		messageSize: 120_000,
	},
}
