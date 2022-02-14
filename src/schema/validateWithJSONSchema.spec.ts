import { formSchema } from './form.js'
import { validateWithJSONSchema } from './validateWithJSONSchema.js'

describe('validateWithJSONSchema()', () => {
	it('should validate a form', () =>
		expect(
			validateWithJSONSchema({
				schema: formSchema({
					$id: new URL(`http://example.com/schema/0.0.0-development/form#`),
				}),
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
