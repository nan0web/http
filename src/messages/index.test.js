import { test } from 'node:test'
import { strict as assert } from 'node:assert'
import * as messages from './index.js'
import HTTPHeaders from './HTTPHeaders.js'
import HTTPMessage from './HTTPMessage.js'
import HTTPIncomingMessage from './HTTPIncomingMessage.js'
import HTTPResponseMessage from './HTTPResponseMessage.js'

test('Messages exports', () => {
	assert.equal(messages.HTTPHeaders, HTTPHeaders)
	assert.equal(messages.HTTPMessage, HTTPMessage)
	assert.equal(messages.HTTPIncomingMessage, HTTPIncomingMessage)
	assert.equal(messages.HTTPResponseMessage, HTTPResponseMessage)
})
