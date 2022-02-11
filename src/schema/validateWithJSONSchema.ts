import Ajv, { ErrorObject } from 'ajv'
import addFormats from 'ajv-formats'
import addKeywords from 'ajv-keywords'
import { URL } from 'url'
import { form } from '../schema/form'
import { question } from '../schema/question'
import { section } from '../schema/section'

export const validateWithFormSchema = <T extends Record<string, any>>({
	baseURL,
	version,
}: {
	baseURL: URL
	version: string
}): ((value: Record<string, any>) =>
	| {
			errors: ErrorObject[]
	  }
	| {
			value: T
	  }) => {
	const formSchema = form({ baseURL, version })
	const ajv = new Ajv({
		schemas: [
			formSchema,
			section({ baseURL, version }),
			question({ baseURL, version }),
		],
	})
	addFormats(ajv)
	addKeywords(ajv)

	const validate = ajv.getSchema(formSchema.$id)

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
