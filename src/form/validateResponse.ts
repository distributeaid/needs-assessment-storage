import { Static } from '@sinclair/typebox'
import { evaluateJSONataExpression } from './evaluateJSONataExpression.js'
import { Form, MultiSelectQuestionFormat, Question } from './form.js'
import { Response } from './submission.js'

export type Answer = string | string[] | [number, string]

export const validateQuestion = async (
	answer: Answer,
	question: Question,
	response: Static<typeof Response>,
): Promise<boolean> => {
	const required = await isRequired(question, response)
	const isBlank = answer === undefined || answer.length === 0
	if (isBlank && !required) return true
	switch (question.format.type) {
		case 'email':
			return /.+@.+\..+/.test(answer as string)
		case 'text':
			return (
				(answer ?? '').length >= 1 &&
				(answer ?? '').length <=
					(question.format.maxLength ?? Number.MAX_SAFE_INTEGER)
			)
		case 'single-select':
			return question.format.options
				.map(({ id }) => id)
				.includes(answer as string)
		case 'region':
			return question.format.regions
				.map(({ id }) => id)
				.includes(answer as string)
		case 'multi-select':
			return (
				((answer ?? []) as string[]).length > 0 &&
				((answer ?? []) as string[]).reduce((validSelection, a) => {
					if (validSelection === false) return false
					return (question.format as MultiSelectQuestionFormat).options
						.map(({ id }) => id)
						.includes(a)
				}, true as boolean)
			)
		case 'positive-integer':
			return (answer ?? [Number.MIN_SAFE_INTEGER, ''])[0] > 0
		case 'non-negative-integer':
			return (answer ?? [Number.MIN_SAFE_INTEGER, ''])[0] >= 0
		default:
			return false
	}
}

export const validateResponse = async ({
	response,
	form,
}: {
	response: Static<typeof Response>
	form: Form
}): Promise<{
	valid: boolean
	validation: Record<string, Record<string, boolean>>
	sectionValidation: Record<string, boolean>
}> => {
	let valid = true
	const sectionValidation: Record<string, boolean> = {}
	const validation: Record<string, Record<string, boolean>> = {}

	for (const section of form.sections) {
		if (await isHidden(section, response)) continue
		if (validation[section.id] === undefined) {
			validation[section.id] = {}
			sectionValidation[section.id] = true
		}
		for (const question of section.questions) {
			if (await isHidden(question, response)) continue
			const questionResponse = response[section.id]?.[question.id]
			validation[section.id][question.id] = await validateQuestion(
				questionResponse,
				question,
				response,
			)
			if (validation[section.id][question.id] === false) {
				sectionValidation[section.id] = false
				valid = false
			}
		}
	}

	return {
		valid,
		validation,
		sectionValidation,
	}
}

export const isHidden = async (
	{
		hidden,
	}: {
		hidden?: boolean | string
	},
	response: Static<typeof Response>,
): Promise<boolean> => {
	if (hidden === undefined) return false
	if (typeof hidden === 'boolean') {
		return hidden
	}
	return evaluateJSONataExpression({
		expression: hidden,
		response,
		error: console.error,
	})
}

export const isRequired = async (
	{
		required,
	}: {
		required?: boolean | string
	},
	response: Static<typeof Response>,
): Promise<boolean> => {
	if (required === undefined) return false
	if (typeof required === 'boolean') {
		return required
	}
	return evaluateJSONataExpression({
		expression: required,
		response,
		error: console.error,
	})
}
