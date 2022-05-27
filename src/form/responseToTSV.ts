import { Static } from '@sinclair/typebox'
import { Form, MultiSelectQuestionFormat } from './form.js'
import { Response } from './submission.js'
import { isHidden } from './validateResponse.js'

const escapeTSVLine =
	(tsv: string[][]) =>
	(line: string[]): number =>
		tsv.push([
			...line.map((s) => {
				if (typeof s !== 'string') return s
				let escaped = s.replace(/"/g, '""') // quote quotes
				if (escaped.includes('\n')) escaped = `"${escaped}"`
				return escaped
			}),
		]) // Escape newlines

export const responseToTSV = (
	response: Static<typeof Response>,
	form: Form,
): string => {
	const tsv: string[][] = []
	const p = escapeTSVLine(tsv)
	p([
		'Question',
		'Question Title',
		'Answer',
		'Answer Title',
		'Unit',
		'Unit Title',
	])
	form.sections.forEach((section) => {
		if (isHidden(section, response)) return
		section.questions.forEach((question) => {
			if (isHidden(question, response)) return
			const id = `${section.id}.${question.id}`
			const questionText = question.title
			const v = response[section.id]?.[question.id]
			switch (question.format.type) {
				case 'text':
				case 'email':
					p([id, questionText, (v ?? '') as string])
					return
				case 'single-select':
					p([
						id,
						questionText,
						(v ?? '') as string,
						question.format.options.find(({ id }) => id === v)?.title ?? '',
					])
					return
				case 'positive-integer':
				case 'non-negative-integer':
					p([
						id,
						questionText,
						((v ?? []) as string[])[0],
						'',
						v?.[1],
						question.format.units.find(({ id }) => id === v?.[1])?.title ?? '',
					])
					return
				case 'multi-select':
					p([
						id,
						questionText,
						((v ?? []) as string[]).join(', '),
						((v ?? []) as string[])
							.map(
								(answer) =>
									(question.format as MultiSelectQuestionFormat).options.find(
										({ id }) => id === answer,
									)?.title ?? '',
							)
							.join(', '),
					])
					return
				default:
					p([id, questionText, JSON.stringify(v)])
					return
			}
		})
	})

	return tsv.map((line) => line.join('\t')).join('\n')
}
