/**
 * Reads variables from a multipart/form-data body.
 * @param {string} body - The body of the request.
 * @param {string} boundary - The boundary string used in the multipart/form-data.
 * @returns {Object} An object containing the parsed variables.
 */
function readVars(body, boundary) {
	const parts = body.split(`--${boundary}`).filter(part => part.trim() !== '' && part.trim() !== '--')
	const fields = {}
	parts.forEach(part => {
		const nameMatch = part.match(/name="([^"]+)"/)
		const valueMatch = part.match(/\r\n\r\n([\s\S]+)/)
		if (nameMatch && valueMatch) {
			const name = nameMatch[1]
			const value = valueMatch[1].replace(/\r\n$/, '')
			const array = name.match(/\[(\w+)\]$/)
			if (name.endsWith('[]') || array) {
				if (!fields[name]) fields[name] = []
				if (array) {
					if (isNaN(array[1])) {
						if (Array.isArray(fields[name])) {
							fields[name] = {}
						}
						fields[name][array[1]] = value
					} else {
						fields[name][parseInt(array[1])] = value
					}
				} else {
					fields[name].push(value)
				}
			} else {
				fields[name] = value
			}
		}
	})
	return fields
}

/**
 * Decodes the body of a request.
 * @param {Buffer[]} body - The body of the request.
 * @returns {Object} An object containing the decoded data.
 */
const decodeBody = (body) => {
	let data = null
	if (body.length) {
		body = Buffer.concat(body).toString()
		const contentType = req.headers['content-type']
		const match = /boundary=(.+)/.exec(contentType)
		if (match) {
			data = readVars(body, match[1])
		} else {
			try {
				data = JSON.parse(body)
			} catch (error) {
				data = false
			}
		}
	}
	return data
}

export { readVars, decodeBody }
