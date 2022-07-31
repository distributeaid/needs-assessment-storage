import { Static } from '@sinclair/typebox'
import { correctResponse } from '../correction/correctResponse.js'
import { Correction } from '../form/correction.js'
import { Form } from '../form/form.js'
import { Response } from '../form/submission.js'

type Summary = {
	stats: {
		count: number
	}
	summary: {
		[key: string]: {
			[key: string]: Record<string, number>
		}
	}
}

/**
 * WARNING /!\
 *
 * Free text inputs must never be published, this especially includes
 * identifying information like email addresses and information about
 * individuals and groups.
 */
export const summarizeResponses = (
	form: Form,
	responses: {
		id: string
		response: Static<typeof Response>
		corrections: {
			id: string
			data: Static<typeof Correction>
		}[]
	}[],
): Summary => {
	const summary: Summary = {
		summary: {},
		stats: {
			count: 0,
		},
	}

	for (const { response, corrections } of responses) {
		const correctedResponse = correctResponse({
			response,
			corrections: corrections.map(({ data: { response } }) => response),
		})

		for (const section of form.sections) {
			for (const question of section.questions) {
				if (
					question.format.type !== 'non-negative-integer' &&
					question.format.type !== 'positive-integer'
				)
					continue
				let [value, unitId] = (correctedResponse[section.id]?.[question.id] ??
					[]) as [number, string]
				if (value === undefined || unitId === undefined) continue
				const unit = question.format.units.find(({ id }) => id === unitId)

				if (unit?.baseUnit !== undefined) {
					value = value * unit.baseUnit.conversionFactor
					unitId = unit.baseUnit.id
				}

				if (summary.summary[section.id] === undefined) {
					summary.summary[section.id] = {}
				}

				if (summary.summary[section.id][question.id] === undefined) {
					summary.summary[section.id][question.id] = {}
				}

				if (summary.summary[section.id][question.id][unitId] === undefined) {
					summary.summary[section.id][question.id][unitId] = value
				} else {
					summary.summary[section.id][question.id][unitId] += value
				}
			}
		}

		summary.stats.count++
	}

	return summary
}
