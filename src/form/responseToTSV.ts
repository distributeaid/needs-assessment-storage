import { Static } from '@sinclair/typebox'
import { escapeCellForTSV } from './escapeCellForTSV.js'
import { Form, MultiSelectQuestionFormat } from './form.js'
import { Response } from './submission.js'
import { isHidden } from './validateResponse.js'

export const responseToTSV = (
	response: Static<typeof Response>,
	form: Form,
): string => {
	const tsv: string[][] = []
	const pushLine = (line: string[]) => tsv.push(line.map(escapeCellForTSV))
	pushLine([
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
					pushLine([id, questionText, (v ?? '') as string])
					return
				case 'single-select':
					pushLine([
						id,
						questionText,
						(v ?? '') as string,
						question.format.options.find(({ id }) => id === v)?.title ?? '',
					])
					return
				case 'positive-integer':
				case 'non-negative-integer':
					pushLine([
						id,
						questionText,
						((v ?? []) as string[])[0],
						'',
						v?.[1],
						question.format.units.find(({ id }) => id === v?.[1])?.title ?? '',
					])
					return
				case 'multi-select':
					pushLine([
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
					pushLine([id, questionText, JSON.stringify(v)])
					return
			}
		})
	})

	return tsv.map((line) => line.join('\t')).join('\n')
}
