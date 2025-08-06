export default AbortError;
/**
 * Abort Error class
 * @extends {Error}
 */
declare class AbortError extends Error {
    /**
     * Creates a new AbortError instance
     * @param {string} [message="Request aborted"] - Error message
     */
    constructor(message?: string | undefined);
}
