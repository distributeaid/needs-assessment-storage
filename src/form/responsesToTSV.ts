import { Static } from '@sinclair/typebox'
import { correctResponse } from '../correction/correctResponse.js'
import { Correction } from './correction.js'
import { escapeCellForTSV } from './escapeCellForTSV.js'
import { Form } from './form.js'
import { Response } from './submission.js'

export const responsesToTSV = (
	form: Form,
	responses: {
		id: string
		response: Static<typeof Response>
		corrections: {
			id: string
			data: Static<typeof Correction>
		}[]
	}[],
): string =>
	[
		// Header
		[
			`#`,
			...form.sections.reduce(
				(questionIds, section) =>
					[
						...questionIds,
						...section.questions.map((question) => {
							switch (question.format.type) {
								case 'non-negative-integer':
								case 'positive-integer':
									return [
										`${section.id}.${question.id}`,
										`${section.id}.${question.id}:unit`,
									]
								case 'single-select':
									return [
										`${section.id}.${question.id}`,
										`${section.id}.${question.id}:id`,
									]
								case 'multi-select':
									return [
										`${section.id}.${question.id}`,
										`${section.id}.${question.id}:ids`,
									]
								default:
									return `${section.id}.${question.id}`
							}
						}),
					].flat(),
				[] as string[],
			),
			'$meta.version',
			'$meta.corrections',
		],
		[
			`Assessment ID`,
			...form.sections.reduce(
				(questionTitles, section) =>
					[
						...questionTitles,
						...section.questions.map(({ title, format }) => {
							switch (format.type) {
								case 'non-negative-integer':
								case 'positive-integer':
									return [
										`${section.title}: ${title}`,
										`${section.title}: ${title} (unit)`,
									]
								case 'single-select':
									return [
										`${section.title}: ${title}`,
										`${section.title}: ${title} (id)`,
									]
								case 'multi-select':
									return [
										`${section.title}: ${title}`,
										`${section.title}: ${title} (ids)`,
									]
								default:
									return `${section.title}: ${title}`
							}
						}),
					].flat(),
				[] as string[],
			),
			'Version',
			'Corrections',
		],
		// Responses
		...responses.map(({ id, response, corrections }) => {
			const correctedResponse = correctResponse({
				response,
				corrections: corrections.map(({ data: { response } }) => response),
			})
			return [
				id,
				...form.sections.reduce(
					(questionIds, section) =>
						[
							...questionIds,
							...section.questions.map((question) => {
								const answer: string | [number, string] | string[] | undefined =
									correctedResponse?.[section.id]?.[question.id]
								switch (question.format.type) {
									case 'non-negative-integer':
									case 'positive-integer':
										return [answer?.[0]?.toString() ?? '', answer?.[1]]
									case 'single-select':
										return [
											question.format.options.find(({ id }) => id === answer)
												?.title ?? '',
											answer as string,
										]
									case 'multi-select':
										return [
											question.format.options
												.filter(({ id }) => (answer ?? []).includes(id))
												.map(({ title }) => title)
												.join(', '),
											((answer ?? []) as unknown as string[]).join(', '),
										]
									default:
										return [answer as string]
								}
							}),
						].flat(),
					[] as string[],
				),
				`${corrections.length + 1}`,
				corrections.map((c) => `${c.id} by ${c.data.author}`).join(', '),
			].map(escapeCellForTSV)
		}),
	]
		.map((line) => line.join('\t'))
		.join('\n')
