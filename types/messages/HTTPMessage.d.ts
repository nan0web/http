export default HTTPMessage;
/**
 * Base HTTP Message class
 */
declare class HTTPMessage {
    /**
     * Creates HTTPMessage from input
     * @param {object} input - Input data
     * @returns {HTTPMessage}
     */
    static from(input: object): HTTPMessage;
    /**
     * Creates a new HTTPMessage instance
     * @param {object} [input] - HTTP message options
     * @param {string} [input.url=""]
     * @param {import("./HTTPHeaders.js").HTTPHeadersInput} [input.headers=[]]
     * @param {string} [input.body]
     */
    constructor(input?: {
        url?: string | undefined;
        headers?: import("./HTTPHeaders.js").HTTPHeadersInput | undefined;
        body?: string | undefined;
    } | undefined);
    /** @type {string} */
    url: string;
    /** @type {HTTPHeaders} */
    headers: HTTPHeaders;
    /** @type {string|undefined} */
    body: string | undefined;
    /**
     * Returns string representation of the HTTP message
     * @returns {string}
     */
    toString(): string;
}
import HTTPHeaders from './HTTPHeaders.js';
