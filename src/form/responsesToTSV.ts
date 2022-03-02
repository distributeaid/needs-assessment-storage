import { Static } from '@sinclair/typebox'
import { Form } from './form'
import { Response } from './submission'

export const responsesToTSV = (
	form: Form,
	responses: { id: string; response: Static<typeof Response> }[],
): string =>
	[
		// Header
		[
			`#`,
			...form.sections.reduce(
				(questionIds, section) =>
					[
						...questionIds,
						...section.questions.map((question) => [
							`${section.id}.${question.id}`,
							`${section.id}.${question.id}:unit`,
						]),
					].flat(),
				[] as string[],
			),
		],
		[
			`Assessment ID`,
			...form.sections.reduce(
				(questionTitles, section) =>
					[
						...questionTitles,
						...section.questions.map(({ title }) => [title, `${title} (unit)`]),
					].flat(),
				[] as string[],
			),
		],
		// Responses
		...responses.map(({ id, response }) => [
			id,
			...form.sections.reduce(
				(questionIds, section) =>
					[
						...questionIds,
						...section.questions.map((question) => {
							const answer = response[section.id][question.id]
							if (Array.isArray(answer))
								return [answer[0].toString(), answer[1]]
							return [answer, '']
						}),
					].flat(),
				[] as string[],
			),
		]),
	]
		.map((line) => line.join('\t'))
		.join('\n')
