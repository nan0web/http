# Nanoweb HTTP
Nanoweb HTTP is a powerful Node.js package that provides a modern, browser-like fetch API for making HTTP requests in Node.js environments.  

## Features
- Browser-like fetch API with full support for GET, POST, PUT, DELETE, PATCH, HEAD, and OPTIONS methods
- Custom Response class with methods like `.text()`, `.json()`, `.arrayBuffer()`, and `.stream()`
- APIRequest class for simplified API interactions with default options
- Support for HTTP/1.1, HTTP/2, and HTTPS protocols
- Automatic Content-Type header handling based on request body
- Robust error handling for network and HTTP errors
- Full TypeScript support with type definitions

## Installation
Ensure you have Node.js installed, then install the package using npm:  
```sh
npm install nanoweb-http
```

## Usage

### Core Fetch API
The core fetch function allows you to make HTTP requests similar to the browser Fetch API:  
```js
// Make a GET request
import fetch from 'nanoweb-http'
const baseUrl = 'http://localhost:3000'
const response = await fetch(`${baseUrl}/data`)
const data = await response.json()
console.log(data)
```
### HTTP Method Helpers
Convenience methods for common HTTP operations:  
```js
// Make a POST request with JSON body
import { post } from 'nanoweb-http'
const baseUrl = 'http://localhost:3000'
const response = await post(`${baseUrl}/api/data`, { name: 'John' })
console.log(response)
```
### HTTP Methods
The package provides convenient GET method:  
```js
// GET request
import { get } from 'nanoweb-http'
const baseUrl = 'http://localhost:3000'
const response = await get(`${baseUrl}/data`)
console.log(response)
```
The package provides convenient POST method:  
```js
// POST request with JSON body
import { post } from 'nanoweb-http'
const baseUrl = 'http://localhost:3000'
const response = await post(`${baseUrl}/api/data`, { message: 'Hello' })
console.log(response)
```
The package provides convenient PUT method:  
```js
// PUT request
import { put } from 'nanoweb-http'
const baseUrl = 'http://localhost:3000'
const response = await put(`${baseUrl}/api/data/1`, { status: 'active' })
console.log(response)
```
The package provides convenient PATCH method:  
```js
// PATCH request
import { patch } from 'nanoweb-http'
const baseUrl = 'http://localhost:3000'
const response = await patch(`${baseUrl}/api/data/1`, { partial: true })
console.log(response)
```
The package provides convenient DELETE method:  
```js
// DELETE request
import { del } from 'nanoweb-http'
const baseUrl = 'http://localhost:3000'
const response = await del(`${baseUrl}/api/data/1`)
console.log(response)
```
The package provides convenient HEAD method:  
```js
// HEAD request
import { head } from 'nanoweb-http'
const baseUrl = 'http://localhost:3000'
const response = await head(`${baseUrl}/data`)
console.log(response)
```
The package provides convenient OPTIONS method:  
```js
// OPTIONS request
import { options } from 'nanoweb-http'
const response = await options(`${baseUrl}/data`)
console.log(response)
```
### APIRequest Class
Create an API client with base URL and default headers:  
```js
// Create API instance with base URL and default headers
import { APIRequest } from 'nanoweb-http'
const baseUrl = 'http://localhost:3000'
const api = new APIRequest(`${baseUrl}/api/`, {
	token: '123',
	xCustomHeader: 'value'
})

// Make requests using the API instance
const dataResponse = await api.get('data')
const createResponse = await api.post('data', { name: 'John' })
const updateResponse = await api.put('data/1', { status: 'active' })
const deleteResponse = await api.delete('data/1')
console.log(dataResponse, createResponse, updateResponse, deleteResponse)
```
### Response Handling
Handle responses in various formats:  
```js
import fetch from 'nanoweb-http'
const baseUrl = 'http://localhost:3000'
const response = await fetch(`${baseUrl}/data`)
console.log(response.ok, response.status)

// Get response as text
const text = await response.text()
console.log(text)

// Get response as JSON
const json = await response.json()
console.log(json)

// Get response as Buffer (binary)
const buffer = await response.arrayBuffer()
console.log(buffer)

// Get raw stream for streaming responses
const stream = response.stream()
console.log(stream)
```
### Error Handling
Handle network and HTTP errors gracefully:  
```js
// Request to invalid endpoint
import fetch from 'nanoweb-http'
const baseUrl = 'http://localhost:3000'
try {
	const response = await fetch(`${baseUrl}/invalid`)
	if (!response.ok) {
		throw new Error(`HTTP error! status: ${response.status}`)
	}
	expect.fail('Request should have failed')
} catch (error) {
	console.log(error)
}
```
### Advanced Features

#### HTTP/2 Support
Make requests using HTTP/2 protocol:  
#### Self-Signed Certificates
Handle self-signed certificates with APIRequest:  
```js
import { APIRequest } from 'nanoweb-http'
const baseUrl = 'http://localhost:3000'
const api = new APIRequest(`${baseUrl}/api/`, {}, {
	allowSelfSignedCertificates: true
})
const response = await api.get('data')
console.log(response)
```
#### Custom Headers
Add custom headers to requests:  
```js
import fetch from 'nanoweb-http'
const baseUrl = 'http://localhost:3000'
const response = await fetch(`${baseUrl}/data`, {
	headers: {
		'X-Custom-Header': 'value',
		'Content-Type': 'application/json'
	}
})
console.log(response)
```