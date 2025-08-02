import { describe, test, expect } from 'vitest'
import { readVars } from '../lib/vars.js'

describe.skip('readVars', () => {
	test('should read variables from a multipart/form-data body', () => {
		const body = 'name="test"\r\n\r\nvalue'
		const boundary = 'boundary'
		const result = readVars(body, boundary)
		expect(result).toEqual({ name: 'test', value: 'value' })
	})

	test('should handle arrays', () => {
		const body = 'name[]="test"\r\n\r\nvalue'
		const boundary = 'boundary'
		const result = readVars(body, boundary)
		expect(result).toEqual({ name: ['test'], value: 'value' })
	})

	test('should handle nested arrays', () => {
		const body = 'name[0][key1]="value1"\r\n\r\nvalue2'
		const boundary = 'boundary'
		const result = readVars(body, boundary)
		expect(result).toEqual({ name: [{ key1: 'value1' }], value: 'value2' })
	})

	test('should handle nested objects', () => {
		const body = 'name[key1][key2]="value1"\r\n\r\nvalue2'
		const boundary = 'boundary'
		const result = readVars(body, boundary)
		expect(result).toEqual({ name: { key1: { key2: 'value1' } }, value: 'value2' })
	})

	test('should handle mixed arrays and objects', () => {
		const body = 'name[key1][key2][]="value1"\r\n\r\nvalue2'
		const boundary = 'boundary'
		const result = readVars(body, boundary)
		expect(result).toEqual({ name: { key1: { key2: ['value1'] } }, value: 'value2' })
	})
})