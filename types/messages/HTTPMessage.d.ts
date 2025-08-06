export default HTTPMessage;
export type HTTPMessageOptions = {
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
 * @typedef {Object} HTTPMessageOptions
 * @property {string} [url=""] - Request URL
 * @property {Record<string, string> | Array<[string, string]>} [headers=[]] - Request headers
 * @property {string | undefined} [body] - Request body (optional)
 */
/**
 * Base HTTP Message class
 */
declare class HTTPMessage {
    /**
     * Creates HTTPMessage from input
     * @param {HTTPMessageOptions} input - Input data
     * @returns {HTTPMessage}
     */
    static from(input: HTTPMessageOptions): HTTPMessage;
    /**
     * Creates a new HTTPMessage instance
     * @param {HTTPMessageOptions} [input={}] - HTTP message options
     */
    constructor(input?: HTTPMessageOptions | undefined);
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
