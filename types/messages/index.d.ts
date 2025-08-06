export default HTTPMessages;
import HTTPHeaders from "./HTTPHeaders.js";
import HTTPMessage from "./HTTPMessage.js";
import HTTPIncomingMessage from "./HTTPIncomingMessage.js";
import HTTPResponseMessage from "./HTTPResponseMessage.js";
declare class HTTPMessages {
    static Headers: typeof HTTPHeaders;
    static Message: typeof HTTPMessage;
    static IncomingMessage: typeof HTTPIncomingMessage;
    static ResponseMessage: typeof HTTPResponseMessage;
}
export { HTTPHeaders, HTTPMessage, HTTPIncomingMessage, HTTPResponseMessage };
