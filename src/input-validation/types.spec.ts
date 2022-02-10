import { Type } from '@sinclair/typebox'
import { NonEmptyShortString, URI } from '../input-validation/types.js'
import { validateWithTypebox } from './validateWithTypebox.js'

describe('input validation types', () => {
	describe('URI input', () => {
		it.each([
			['http://distributeaid.org', true],
			['https://distributeaid.org', true],
			['https://distributeaid.org/some/resource.html', true],
			['distributeaid.org', false],
		])('should validate %s as %s', (uri, isValid) => {
			const res = validateWithTypebox(
				Type.Object({
					uri: URI,
				}),
			)({ uri })
			expect('errors' in res).toEqual(!isValid)
		})
	})

	describe('a short string input that should not be empty', () => {
		it.each([
			['some string', true],
			['a'.repeat(255), true],
			['a'.repeat(256), false],
			['', false],
			[undefined, false],
			[null, false],
		])('should validate %s as %s', (shortString, isValid) => {
			const res = validateWithTypebox(
				Type.Object({
					shortString: NonEmptyShortString,
				}),
			)({ shortString })
			expect('errors' in res).toEqual(!isValid)
		})
	})
})
