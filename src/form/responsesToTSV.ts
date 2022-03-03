import { Static, StaticArray, TString } from '@sinclair/typebox'
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
		],
		// Responses
		...responses.map(({ id, response }) => [
			id,
			...form.sections.reduce(
				(questionIds, section) =>
					[
						...questionIds,
						...section.questions.map((question) => {
							const answer:
								| string
								| StaticArray<TString>
								| [number, string]
								| undefined = response?.[section.id]?.[question.id]
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
		]),
	]
		.map((line) => line.join('\t'))
		.join('\n')
