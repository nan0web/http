import HTTPHeaders from "./HTTPHeaders.js"
import HTTPMessage from "./HTTPMessage.js"
import HTTPIncomingMessage from "./HTTPIncomingMessage.js"
import HTTPResponseMessage from "./HTTPResponseMessage.js"

export {
	HTTPHeaders,
	HTTPMessage,
	HTTPIncomingMessage,
	HTTPResponseMessage,
}

class HTTPMessages {
	static Headers = HTTPHeaders
	static Message = HTTPMessage
	static IncomingMessage = HTTPIncomingMessage
	static ResponseMessage = HTTPResponseMessage
}

export default HTTPMessages
