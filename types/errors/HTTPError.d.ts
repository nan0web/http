export default HTTPError;
/**
 * HTTP Error class
 * @extends {Error}
 */
declare class HTTPError extends Error {
    /**
     * Creates a new HTTPError instance
     * @param {string} message - Error message
     * @param {number} [status=400] - HTTP status code
     */
    constructor(message: string, status?: number | undefined);
    /** @type {number} */
    status: number;
}
