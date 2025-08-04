import { test } from 'node:test'
import { strict as assert } from 'node:assert'
import HTTPError from './HTTPError.js'

test('HTTPError', () => {
  const error = new HTTPError('Bad Request')
  assert.equal(error.name, 'HTTPError')
  assert.equal(error.message, 'Bad Request')
  assert.equal(error.status, 400)
  
  const customError = new HTTPError('Not Found', 404)
  assert.equal(customError.name, 'HTTPError')
  assert.equal(customError.message, 'Not Found')
  assert.equal(customError.status, 404)
  
  assert.match(error.toString(), /^HTTPError \[400\] Bad Request/)
  assert.match(customError.toString(), /^HTTPError \[404\] Not Found/)
})