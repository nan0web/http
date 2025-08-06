# @nan0web/http

A lightweight HTTP library for JavaScript applications that provides utilities for working with HTTP messages, headers, status codes, and errors.

## Features

- HTTP status code utilities with descriptive names
- HTTP headers management with flexible input formats
- HTTP message classes for requests and responses
- Custom error classes for HTTP and abort errors
- Works in both browser and Node.js environments
- Fully typed with JSDoc annotations
- Zero dependencies

## Installation

```bash
npm install @nan0web/http
```

## Usage

### HTTP Status Codes

Access standard HTTP status codes with descriptive names:

```js
import HTTPStatusCode from '@nan0web/http'

console.log(HTTPStatusCode.CODE_200) // "OK"
console.log(HTTPStatusCode.CODE_404) // "Not Found"
console.log(HTTPStatusCode.CODE_500) // "Internal Server Error"

// Get status text by code number
console.log(HTTPStatusCode.get(200)) // "OK"
console.log(HTTPStatusCode.get(418)) // "I'm a teapot"
```

### HTTP Headers

Manage HTTP headers with multiple input formats:

```js
import { HTTPHeaders } from '@nan0web/http'

// From object
const headers1 = new HTTPHeaders({
  'Content-Type': 'application/json',
  'Authorization': 'Bearer token'
})

// From array of tuples
const headers2 = new HTTPHeaders([
  ['Content-Type', 'text/html'],
  ['User-Agent', 'nanoweb-http/1.0']
])

// From string
const headers3 = new HTTPHeaders('Content-Type: text/plain\nAccept: */*')

// Methods
headers1.set('X-Custom', 'value')
console.log(headers1.get('Content-Type')) // "application/json"
console.log(headers1.has('Authorization')) // true
headers1.delete('Authorization')
console.log(headers1.toString()) // "Content-Type: application/json\nX-Custom: value"
```

### HTTP Messages

Work with HTTP request and response messages:

```js
import { HTTPIncomingMessage, HTTPResponseMessage } from '@nan0web/http'

// Incoming message (request)
const request = new HTTPIncomingMessage({
  method: 'POST',
  url: '/api/users',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ name: 'John' })
})

console.log(request.toString())
// POST </api/users>
// Content-Type: application/json
//
// {"name": "John"}

// Response message
const response = new HTTPResponseMessage({
  url: '/api/users',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ id: 1, name: 'John' })
})
```

### Error Handling

Custom error classes for handling HTTP and abort errors:

```js
import { AbortError, HTTPError } from '@nan0web/http'

// HTTP Error
try {
  throw new HTTPError('Bad Request', 400)
} catch (error) {
  console.log(error.name) // "HTTPError"
  console.log(error.status) // 400
  console.log(error.message) // "Bad Request"
}

// Abort Error
try {
  throw new AbortError('Request was aborted by user')
} catch (error) {
  console.log(error.name) // "AbortError"
  console.log(error.message) // "Request was aborted by user"
}
```

## API

### HTTPStatusCode

Static class containing HTTP status codes with their descriptive messages.

### HTTPHeaders

Class for managing HTTP headers with the following methods:
- `constructor(input)` - Create headers from object, array, or string
- `get(name)` - Get header value
- `set(name, value)` - Set header value
- `has(name)` - Check if header exists
- `delete(name)` - Delete header
- `toString()` - Convert headers to string format
- `static from(input)` - Create or return HTTPHeaders instance

### HTTPMessage

Base class for HTTP messages with:
- `constructor(options)` - Create message with url, headers, and body
- `toString()` - String representation of the message

### HTTPIncomingMessage

Extends HTTPMessage for incoming requests with HTTP method validation.

### Errors

- `AbortError` - Error thrown when requests are aborted
- `HTTPError` - Error with HTTP status code for HTTP-related errors

## License

[ISC](LICENSE)
