import { Static } from '@sinclair/typebox'
import jsonata from 'jsonata'
import { Response } from './submission.js'

export const evaluateJSONataExpression = async ({
	expression,
	response,
	debug,
	error,
}: {
	expression: string
	response: Static<typeof Response>
	debug?: typeof console.debug
	error?: typeof console.error
}): Promise<boolean> => {
	let result: boolean
	try {
		const compileExpression = jsonata(expression)
		result = await compileExpression.evaluate(response)
	} catch (err) {
		error?.(`[jsonata]`, `failed to evaluate expression`, err)
		return false
	}
	debug?.(
		`[jsonata]`,
		'evaluating expression',
		JSON.stringify(expression),
		'against',
		response,
		'->',
		result,
	)
	if (result !== undefined && typeof result !== 'boolean') {
		error?.(
			`[jsonata]`,
			`expression ${expression} did not validate to a boolean value`,
			result,
		)
		return false
	}
	return result ?? false
}
