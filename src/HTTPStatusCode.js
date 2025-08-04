class HTTPStatusCode {
	// Informational Responses (100-199)
	static CODE_100 = 'Continue'
	static CODE_101 = 'Switching Protocols'
	static CODE_102 = 'Processing'
	static CODE_103 = 'Early Hints'

	// Successful Responses (200-299)
	static CODE_200 = 'OK'
	static CODE_201 = 'Created'
	static CODE_202 = 'Accepted'
	static CODE_203 = 'Non-Authoritative Information'
	static CODE_204 = 'No Content'
	static CODE_205 = 'Reset Content'
	static CODE_206 = 'Partial Content'
	static CODE_207 = 'Multi-Status'
	static CODE_208 = 'Already Reported'
	static CODE_226 = 'IM Used'

	// Redirection Messages (300-399)
	static CODE_300 = 'Multiple Choices'
	static CODE_301 = 'Moved Permanently'
	static CODE_302 = 'Found'
	static CODE_303 = 'See Other'
	static CODE_304 = 'Not Modified'
	static CODE_305 = 'Use Proxy', // Deprecate
	static CODE_306 = 'Switch Proxy', // Unused (historical
	static CODE_307 = 'Temporary Redirect'
	static CODE_308 = 'Permanent Redirect'

	// Client Error Responses (400-499)
	static CODE_400 = 'Bad Request'
	static CODE_401 = 'Unauthorized'
	static CODE_402 = 'Payment Required'
	static CODE_403 = 'Forbidden'
	static CODE_404 = 'Not Found'
	static CODE_405 = 'Method Not Allowed'
	static CODE_406 = 'Not Acceptable'
	static CODE_407 = 'Proxy Authentication Required'
	static CODE_408 = 'Request Timeout'
	static CODE_409 = 'Conflict'
	static CODE_410 = 'Gone'
	static CODE_411 = 'Length Required'
	static CODE_412 = 'Precondition Failed'
	static CODE_413 = 'Payload Too Large'
	static CODE_414 = 'URI Too Long'
	static CODE_415 = 'Unsupported Media Type'
	static CODE_416 = 'Range Not Satisfiable'
	static CODE_417 = 'Expectation Failed'
	// April Fools' joke (RFC 2324)
	static CODE_418 = "I'm a teapot"
	static CODE_421 = 'Misdirected Request'
	static CODE_422 = 'Unprocessable Content'
	static CODE_423 = 'Locked'
	static CODE_424 = 'Failed Dependency'
	static CODE_425 = 'Too Early'
	static CODE_426 = 'Upgrade Required'
	static CODE_428 = 'Precondition Required'
	static CODE_429 = 'Too Many Requests'
	static CODE_431 = 'Request Header Fields Too Large'
	static CODE_451 = 'Unavailable For Legal Reasons'

	// Server Error Responses (500-599)
	static CODE_500 = 'Internal Server Error'
	static CODE_501 = 'Not Implemented'
	static CODE_502 = 'Bad Gateway'
	static CODE_503 = 'Service Unavailable'
	static CODE_504 = 'Gateway Timeout'
	static CODE_505 = 'HTTP Version Not Supported'
	static CODE_506 = 'Variant Also Negotiates'
	static CODE_507 = 'Insufficient Storage'
	static CODE_508 = 'Loop Detected'
	static CODE_510 = 'Not Extended'
	static CODE_511 = 'Network Authentication Required'

	static get(code) {
		return HTTPStatusCode["CODE_" + Number(code)] ?? "Unknown"
	}
}

export default HTTPStatusCode
