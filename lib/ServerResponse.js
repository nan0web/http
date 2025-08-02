import { createReadStream } from 'node:fs'
import { resolve } from 'node:path'

class ServerResponse {
	sent = false
	constructor(res, server = {}) {
		this.res = res
		this.sentHeaders = []
		this.logger = server.logger || console
	}

	status(code = 200) {
		this.res.statusCode = code
		return this
	}

	get statusCode() {
		return this.res.statusCode
	}

	setHeader(name, value) {
		// Store the header, value, and trace
		this.sentHeaders.push({
			name,
			value,
		})
		this.res.setHeader(name, value)
		return this
	}

	getHeader(name) {
		return this.res.getHeader(name)
	}

	getAllHeaders() {
		return this.sentHeaders // Return the tracked headers
	}

	send(body) {
		this.sent = true
		this.res.end(body)
		return this
	}

	json(data, contentType = 'application/json') {
		this.setHeader('Content-Type', contentType)
		const spacer = 'text/json' === contentType ? 2 : 0
		this.send(JSON.stringify(data, null, spacer))
		return this
	}

	html(data) {
		this.setHeader('Content-Type', 'text/html').send(data)
		return this
	}

	sendFile(filePath, options = {}, callback) {
		this.sent = true
		const absolutePath = resolve(filePath)
		const stream = createReadStream(absolutePath)

		stream.on('open', () => {
			this.setHeader('Content-Type', options.contentType || 'application/octet-stream')
			stream.pipe(this.res)
		})

		stream.on('error', (err) => {
			if (callback) callback(err)
			else this.status(404).send('File not found')
		})

		stream.on('end', () => {
			if (callback) callback(null)
		})
	}

	redirect(statusOrUrl, url) {
		let status, redirectUrl
		if (typeof statusOrUrl === 'number') {
			status = statusOrUrl
			redirectUrl = url
		} else {
			status = 302
			redirectUrl = statusOrUrl
		}
		this.status(status).setHeader('Location', redirectUrl).send(`Redirecting to ${redirectUrl}`)
	}

	set(name, value) {
		return this.setHeader(name, value)
	}

	end(data) {
		this.sent = true
		this.res.end(data)
		return this
	}

	type(type) {
		this.setHeader('Content-Type', type)
		return this
	}

	cookie(name, value, options = {}) {
		let cookieStr = `${name}=${encodeURIComponent(value)}`

		if (options.maxAge) cookieStr += `; Max-Age=${options.maxAge}`
		if (options.domain) cookieStr += `; Domain=${options.domain}`
		if (options.path) cookieStr += `; Path=${options.path || '/'}`
		if (options.expires) cookieStr += `; Expires=${options.expires.toUTCString()}`
		if (options.httpOnly) cookieStr += '; HttpOnly'
		if (options.secure) cookieStr += '; Secure'
		if (options.sameSite) cookieStr += `; SameSite=${options.sameSite}`

		this.setHeader('Set-Cookie', cookieStr)
		return this;
	}

	clearCookie(name, options = {}) {
		options.expires = new Date(1)
		this.cookie(name, '', options)
	}

	format(formats, req = undefined) {
		let accept = []
		if ('object' === typeof req && null !== req && req.headers) {
			accept = (req.headers['accept'] || '').split(',')
		} else {
			accept = (this.res.getHeader('accept') || '').split(',')
		}
		accept = accept.map(a => a.split(';')[0].trim().toLowerCase())
		// Check for /json in the accept header
		if (accept.some(item => item.endsWith('/json')) && formats.json) {
			formats.json()
		}
		// Check for /html in the accept header
		else if (accept.some(item => item.includes('/html')) && formats.html) {
			formats.html()
		}
		// Default format handling
		else if (formats.default) {
			formats.default()
		}
		// If no formats match, return 406
		else {
			this.status(406).send('Not Acceptable')
		}
	}

	append(name, value) {
		let current = this.getHeader(name)
		if (current) {
			current += `, ${value}`
		} else {
			current = value
		}
		this.setHeader(name, current)
		return this
	}

	attachment(filename) {
		this.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
		return this
	}
}

export default ServerResponse