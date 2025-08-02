import bodyParser from './bodyParser.js'
import { test } from 'node:test'
import assert from 'node:assert'
import { IncomingMessageWithBody } from '../types/IncomingMessageWithBody.js'
import { Socket } from 'net'

test('bodyParser handles JSON', async () => {
	const socket = new Socket()
	const req = new IncomingMessageWithBody(socket)
	req.method = 'POST'
	req.headers = { 'content-type': 'application/json' }

	const body = JSON.stringify({ test: 'value' })
	req.push(body)
	req.push(null)

	await bodyParser(req, {})
	assert.deepEqual(req.body, { test: 'value' })
})

// @todo add more tests
