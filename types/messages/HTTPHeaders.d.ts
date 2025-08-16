export default HTTPHeaders;
export type HTTPHeadersInput = Map<string, string> | Array<[string, string]> | object | string;
/**
 * HTTP Headers class for managing request/response headers
 */
declare class HTTPHeaders {
    /**
     * Creates HTTPHeaders from input
     * @param {HTTPHeadersInput} input - Input data
     * @returns {HTTPHeaders}
     */
    static from(input: HTTPHeadersInput): HTTPHeaders;
    /**
     * Creates a new HTTPHeaders instance
     * @param {HTTPHeadersInput} [input={}] - Headers input data
     */
    constructor(input?: HTTPHeadersInput);
    /**
     * Gets the number of headers
     * @returns {number}
     */
    get size(): number;
    /**
     * Checks if a header exists
     * @param {string} name - Header name
     * @returns {boolean}
     */
    has(name: string): boolean;
    /**
     * Gets a header value
     * @param {string} name - Header name
     * @returns {string|undefined}
     */
    get(name: string): string | undefined;
    /**
     * Sets a header value
     * @param {string} name - Header name
     * @param {string} value - Header value
     * @returns {this}
     */
    set(name: string, value: string): this;
    /**
     * Deletes a header
     * @param {string} name - Header name
     * @returns {boolean}
     */
    delete(name: string): boolean;
    /**
     * Returns headers as a mapped array.
     * @returns {string[]}
     */
    toArray(): string[];
    /**
     * Returns string representation of headers
     * @returns {string}
     */
    toString(): string;
    /**
     * Returns a record with headers.
     * @returns {Record<string, string>}
     */
    toObject(): Record<string, string>;
    #private;
}
