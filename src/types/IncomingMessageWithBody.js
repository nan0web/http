import { IncomingMessage } from 'node:http'

/**
 * Extended IncomingMessage with body property
 * @extends {IncomingMessage}
 */
export class IncomingMessageWithBody extends IncomingMessage {
	/** @type {string | object} */
	body = {}
	/** @type {Record<string, string>} */
	params = {}
}

export default IncomingMessageWithBody
