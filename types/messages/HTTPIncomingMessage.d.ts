export namespace HTTPMethods {
    let GET: string;
    let POST: string;
    let PATCH: string;
    let PUT: string;
    let DELETE: string;
    let HEAD: string;
    let OPTIONS: string;
}
export const HTTPMethodValidator: (value: any) => any;
export default HTTPIncomingMessage;
export type HTTPMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE" | "HEAD" | "OPTIONS";
export type HTTPIncomingMessageOptions = {
    /**
     * - HTTP method (GET, POST, etc.)
     */
    method?: HTTPMethod | undefined;
    /**
     * - Request URL
     */
    url?: string | undefined;
    /**
     * - Request headers
     */
    headers?: Record<string, string> | [string, string][] | undefined;
    /**
     * - Request body (optional)
     */
    body?: string | undefined;
};
/**
 * HTTP Incoming Message class for both browser and Node.js environments
 */
declare class HTTPIncomingMessage extends HTTPMessage {
    static Methods: {
        GET: string;
        POST: string;
        PATCH: string;
        PUT: string;
        DELETE: string;
        HEAD: string;
        OPTIONS: string;
    };
    /**
     * Creates HTTPIncomingMessage from input
     * @param {HTTPIncomingMessageOptions} input - Input data
     * @returns {HTTPIncomingMessage}
     */
    static from(input: HTTPIncomingMessageOptions): HTTPIncomingMessage;
    /**
     * Creates a new HTTPIncomingMessage instance
     * @param {HTTPIncomingMessageOptions} [input={}] - HTTP incoming message options
     */
    constructor(input?: HTTPIncomingMessageOptions | undefined);
    /** @type {HTTPMethod} */
    method: HTTPMethod;
}
import HTTPMessage from "./HTTPMessage.js";
