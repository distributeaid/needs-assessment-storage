import { Static } from '@sinclair/typebox'
import { getCountryByCountryCode } from '../country/getCountryByCountryCode.js'
import { escapeCellForTSV } from './escapeCellForTSV.js'
import { Form, MultiSelectQuestionFormat } from './form.js'
import { Response } from './submission.js'
import { isHidden } from './validateResponse.js'

export const responseToTSV = async (
	response: Static<typeof Response>,
	form: Form,
): Promise<string> => {
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
	for (const section of form.sections) {
		if (await isHidden(section, response)) continue
		for (const question of section.questions) {
			if (await isHidden(question, response)) continue
			const id = `${section.id}.${question.id}`
			const questionText = question.title
			const v = response[section.id]?.[question.id]
			switch (question.format.type) {
				case 'text':
				case 'email':
					pushLine([id, questionText, (v ?? '') as string])
					continue
				case 'single-select':
					pushLine([
						id,
						questionText,
						(v ?? '') as string,
						question.format.options.find(({ id }) => id === v)?.title ?? '',
					])
					continue
				case 'region':
					pushLine([
						id,
						questionText,
						(v ?? '') as string,
						(() => {
							const { locality, countryCode } =
								question.format.regions.find(({ id }) => id === v) ?? {}
							let region = 'unknown region'
							if (locality !== undefined) region = locality
							let country = 'unknown country'
							if (countryCode !== undefined) {
								try {
									country = getCountryByCountryCode(countryCode).shortName
								} catch {
									// pass
								}
							}
							return `${region} (${country})`
						})(),
					])
					continue
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
					continue
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
					continue
				default:
					pushLine([id, questionText, JSON.stringify(v)])
					continue
			}
		}
	}

	return tsv.map((line) => line.join('\t')).join('\n')
}
