import { Static } from '@sinclair/typebox'
import { Response } from '../form/submission.js'

export const correctResponse = ({
	response,
	corrections,
}: {
	response: Static<typeof Response>
	corrections: Static<typeof Response>[]
}): Static<typeof Response> =>
	[response, ...corrections].reduce((correctedResponse, response) => {
		for (const [sectionId, questions] of Object.entries(response)) {
			for (const [questionId, response] of Object.entries(questions)) {
				correctedResponse[sectionId][questionId] = response
			}
		}
		return correctedResponse
	}, response)
