import { Static } from '@sinclair/typebox'
import { deepEqual } from 'fast-equals'
import { Form } from '../form/form'
import { Response } from '../form/submission'

type CorrectionDiff = Record<
	string,
	Record<
		string,
		| {
				old: string | string[] | [number, string]
				new: string | string[] | [number, string]
		  }
		| {
				unset: string | string[] | [number, string]
		  }
		| {
				set: string | string[] | [number, string]
		  }
	>
>

export const correctionDiff = (
	form: Form,
	submissionResponse: Static<typeof Response>,
	correctionResponse: Static<typeof Response>,
): CorrectionDiff => {
	const difference: CorrectionDiff = {}
	for (const section of form.sections) {
		for (const question of section.questions) {
			const sectionId = section.id
			const questionId = question.id
			const answer = submissionResponse[sectionId][questionId]
			const correction = correctionResponse[sectionId][questionId]
			if (!deepEqual(answer, correction)) {
				if (difference[sectionId] === undefined) {
					difference[sectionId] = {}
				}
				if (correction === undefined) {
					difference[sectionId][questionId] = {
						unset: answer,
					}
				} else if (answer === undefined) {
					difference[sectionId][questionId] = {
						set: correction,
					}
				} else {
					difference[sectionId][questionId] = {
						old: answer,
						new: correction,
					}
				}
			}
		}
	}
	return difference
}
