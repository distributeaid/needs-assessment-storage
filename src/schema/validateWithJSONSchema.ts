import Ajv, { ErrorObject } from 'ajv'
import addFormats from 'ajv-formats'
import addKeywords from 'ajv-keywords'
import { URL } from 'url'
import { form } from '../schema/form'
import { question } from '../schema/question'
import { section } from '../schema/section'

export const validateWithFormSchema = ({
	baseURL,
	version,
}: {
	baseURL: URL
	version: string
}): ((value: Record<string, any>) =>
	| {
			isValid: false
			errors: ErrorObject[]
	  }
	| {
			isValid: true
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
			return { isValid: false, errors: validate?.errors ?? [] }
		}

		return { isValid: true }
	}
}
