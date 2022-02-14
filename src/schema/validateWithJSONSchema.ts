import Ajv, { ErrorObject } from 'ajv'
import addFormats from 'ajv-formats'
import addKeywords from 'ajv-keywords'
import { JSONSchema } from './JSONSchema'

export const validateWithJSONSchema = <T extends Record<string, any>>({
	schema,
}: {
	schema: JSONSchema
}): ((value: Record<string, any>) =>
	| {
			errors: ErrorObject[]
	  }
	| {
			value: T
	  }) => {
	const ajv = new Ajv({
		schemas: [schema],
	})
	addFormats(ajv)
	addKeywords(ajv)

	const validate = ajv.getSchema(schema.$id)

	return (value) => {
		const valid = validate?.(value)

		if (valid !== true) {
			return { errors: validate?.errors ?? [] }
		}

		return {
			value: value as T,
		}
	}
}
