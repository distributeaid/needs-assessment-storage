import { correctResponse } from './correctResponse'

describe('correctedResponse()', () => {
	it('should merge corrections with a response', () =>
		expect(
			correctResponse({
				response: {
					section1: {
						question1: 'Answer',
					},
				},
				corrections: [
					{
						section1: {
							question1: 'Corrected answer',
						},
					},
					{
						section1: {
							question1: 'Corrected answer, again',
						},
					},
				],
			}),
		).toMatchObject({
			section1: {
				question1: 'Corrected answer, again',
			},
		}))
})
