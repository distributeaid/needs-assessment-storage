import { validateWithFormSchema } from './validateWithJSONSchema.js'

describe('validateWithFormSchema', () => {
	it('should validate a form', () =>
		expect(
			validateWithFormSchema({
				baseURL: new URL('https://example.com/schema/'),
				version: '0.0.0-development',
			})({ foo: 'bar' }),
		).toMatchObject({
			errors: [
				{
					instancePath: '',
					keyword: 'required',
					message: "must have required property '$schema'",
					params: {
						missingProperty: '$schema',
					},
					schemaPath: '#/required',
				},
			],
		}))
})
