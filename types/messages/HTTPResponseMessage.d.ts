export default HTTPResponseMessage;
/**
 * HTTP Response Message class
 * @extends {HTTPMessage}
 */
declare class HTTPResponseMessage extends HTTPMessage {
    /**
     * Creates a new HTTPResponseMessage instance
     * @param {object} [input] - HTTP message options
     * @param {string} [input.url=""]
     * @param {import("./HTTPHeaders.js").HTTPHeadersInput} [input.headers=[]]
     * @param {string} [input.body]
     * @param {boolean} [input.ok=false]
     */
    constructor(input?: {
        url?: string | undefined;
        headers?: import("./HTTPHeaders.js").HTTPHeadersInput | undefined;
        body?: string | undefined;
        ok?: boolean | undefined;
    } | undefined);
    /** @type {boolean} */
    ok: boolean;
    json(): Promise<string>;
    text(): Promise<string>;
}
import HTTPMessage from "./HTTPMessage.js";
