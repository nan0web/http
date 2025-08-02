import Server from "./Server.js"

/**
 * Create new server
 * @param {Object} [options]
 * @param {number} [options.port]
 * @param {string} [options.host]
 * @param {Object} [options.ssl]
 * @returns {Server}
 */
function createServer(options = {}) {
	return new Server(options)
}

export {
	Server,
	createServer
}

export default createServer
