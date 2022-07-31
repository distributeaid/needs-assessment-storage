import { formSchema } from '../schema/form'
import { validateWithJSONSchema } from '../schema/validateWithJSONSchema'
import { ulid } from '../ulid'
import { exampleForm } from './example.form'

describe('the example form should be valid', () => {
	test('validate the form', () => {
		const $schema = new URL(`https://example.com/form.schema.json`)
		const $id = new URL(`https://example.com/form/${ulid()}`)
		const schema = formSchema({
			$id,
		})
		const form = exampleForm({
			$schema,
			$id,
		})
		const validForm = validateWithJSONSchema({
			schema,
		})(form)

		expect('errors' in validForm).toBe(false)
	})
})
