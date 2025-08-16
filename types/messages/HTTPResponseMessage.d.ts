export default HTTPResponseMessage;
export type ResponseType = "basic" | "cors" | "default" | "error" | "opaque" | "opaqueredirect";
export type ResponseRedirectStatus = 301 | 302 | 303 | 307 | 308;
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
     * @param {number} [input.status=0]
     * @param {string} [input.statusText=""]
     * @param {string} [input.type="default"]
     * @param {boolean} [input.redirected=false]
     */
    constructor(input?: {
        url?: string | undefined;
        headers?: import("./HTTPHeaders.js").HTTPHeadersInput;
        body?: string | undefined;
        ok?: boolean | undefined;
        status?: number | undefined;
        statusText?: string | undefined;
        type?: string | undefined;
        redirected?: boolean | undefined;
    } | undefined);
    /** @type {boolean} */
    ok: boolean;
    /** @type {number} */
    status: number;
    /** @type {string} */
    statusText: string;
    /** @type {ResponseType} */
    type: ResponseType;
    /** @type {boolean} */
    redirected: boolean;
    clone(): HTTPResponseMessage;
    json(): Promise<string>;
    text(): Promise<string>;
}
import HTTPMessage from "./HTTPMessage.js";
/**
 * @typedef {"basic" | "cors" | "default" | "error" | "opaque" | "opaqueredirect"} ResponseType
 */
/**
 * @typedef {301 | 302 | 303 | 307 | 308} ResponseRedirectStatus
 */
/**
 * @param {string} input
 * @returns {ResponseType}
 */
declare function ResponseType(input: string): ResponseType;
