import { evaluateJSONataExpression } from './evaluateJSONataExpression.js'

describe('evaluateJSONataExpression', () => {
	it('should evaluate a expression', async () =>
		expect(
			evaluateJSONataExpression({
				expression: `$not('food items' in whomYouServe.aidTypes)`,
				response: {
					whomYouServe: {
						aidTypes: ['food items'],
					},
				},
			}),
		).resolves.toEqual(false))
})
