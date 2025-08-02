# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.1.0] - 2025-05-23
### Added
- **HTTP Method Exports**: Added exports for HTTP method helpers (`get`, `post`, `put`, `patch`, `del`, `head`, `options`) in `lib/index.js` to allow direct access to these functions from the main module.

### Changed
- **Dependency Updates**: Updated development dependencies in `package.json`:
  - `@eslint/js`: Updated from `^9.24.0` to `^9.27.0`.
  - `eslint`: Updated from `^9.24.0` to `^9.27.0`.
  - `globals`: Updated from `^16.0.0` to `^16.1.0`.
  - `nanoweb-mono`: Updated from `^1.8.0` to `^1.8.2`.

---

## [1.0.2] - 2025-04-09
### Added
- **Timeout Support**: Added `timeout` option to `fetch` function and `APIRequest` class in `lib/fetch.js`:
  - Uses `AbortController` to abort requests after the specified timeout duration (in milliseconds).
  - Default timeout is `0` (no timeout).
- **Logging**: Introduced a `logger` option to `fetch` and `APIRequest` in `lib/fetch.js`:
  - Replaces `console` calls with a configurable logger (defaults to `console`).
  - Supports `debug` and `error` log levels for request lifecycle events.
- **Testing**: Added `Timeout Handling` test suite to `test/fetch.test.js`:
  - Tests successful requests with sufficient timeout.
  - Tests request abortion with insufficient timeout against a slow endpoint (`/slow`, 500ms delay).
  - Verifies `APIRequest` timeout behavior.
  - Confirms no timeout when `timeout` is `0`.

### Changed
- **Fetch Options**: Updated `fetch` function in `lib/fetch.js`:
  - Renamed `allowSelfSignedCertificates` to `rejectUnauthorized` for clarity (inverted logic: `true` rejects self-signed certs).
  - Added `timeout` and `logger` to the options destructuring.
- **APIRequest Options**: Updated `APIRequest` class in `lib/fetch.js`:
  - Changed `allowSelfSignedCertificates` to `rejectUnauthorized` with default `true`.
  - Added `timeout` and `logger` properties to the options object.
  - Spread `this.options` in all HTTP method calls to pass timeout and logger settings.
- **Error Handling**: Added `clearTimeout(timeoutId)` in error and response handlers in `fetch` to prevent memory leaks.

### Fixed
- **Consistency**: Standardized JSDoc comments in `fetch` and `APIRequest` to reflect new options (`timeout`, `rejectUnauthorized`, `logger`).

---

## [1.0.1] - 2025-04-08

### Added
- **Server-Side Framework**: Introduced a new server-side framework with `Server`, `Router`, and `ServerResponse` classes in `lib/server.js`, `lib/Router.js`, and `lib/ServerResponse.js` respectively:
  - `Server` class supports HTTP/HTTPS server creation with middleware, routing, and CORS options.
  - `Router` class provides Express-like route handling with support for middleware, parameterized routes, and HTTP method convenience functions (`get`, `post`, `put`, etc.).
  - `ServerResponse` class enhances response handling with methods like `json()`, `html()`, `sendFile()`, `redirect()`, `cookie()`, and more.
- **Testing**: Added comprehensive test suites:
  - `test/Router.test.js`: Tests for `Router` class functionality, including middleware execution, route matching, and error handling.
  - `test/ServerResponse.test.js`: Tests for `ServerResponse` class, covering status codes, headers, content

---

## [1.0.0] - 2025-04-08

### Added
- **Testing**: Added comprehensive test suites:
  - `test/00-README.md.test.js`: Aligned test cases with updated README examples, adding `baseUrl` and improving error handling tests.
  - `test/fetch.test.js`: Skipped external API tests (httpbin.org) to focus on local testing, pending further configuration.
- **Exports**: Updated `lib/index.js` to export `ServerResponse`, `createServer`, `Router`, and `Server` for use in applications.
- **Fetch Enhancements**: Extended `lib/fetch.js` with a `NodeServerResponse` class to improve server-side response handling compatibility.
- **Documentation**: Updated `README.md` with improved descriptions, examples, and clarifications:
  - Enhanced "Features" section with specific HTTP methods and Response class methods.
  - Added "HTTP Method Helpers" section with `post` example.
  - Improved code examples with consistent `baseUrl` usage.
