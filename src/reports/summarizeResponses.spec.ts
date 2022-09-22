import { formSchema } from '../schema/form'
import { validateWithJSONSchema } from '../schema/validateWithJSONSchema'
import { ulid } from '../ulid'
import { summarizeResponses } from './summarizeResponses'
import { formWithUnitConversions } from './test-data/formWithUnitConversions'

describe('reports', () => {
	test('a form with unit conversion can be defined', () => {
		const validForm = validateWithJSONSchema({
			schema: formSchema({
				$id: new URL(formWithUnitConversions.$id),
			}),
		})(formWithUnitConversions)
		expect('errors' in validForm).toBe(false)
	})

	test('responses can be summarized', () =>
		expect(
			summarizeResponses(formWithUnitConversions, [
				{
					id: ulid(),
					response: {
						foodItems: {
							rice: [2, 'epal'],
							cannedTomatoes: [100, 'cans'],
						},
						hygieneItems: {
							washingDetergent: [10, 'bottle1l'],
						},
					},
					corrections: [],
				},
				{
					id: ulid(),
					response: {
						foodItems: {
							rice: [200, 'kg'],
							cannedTomatoes: [3, 'epal'],
						},
						hygieneItems: {
							washingDetergent: [10, 'bag5k'],
						},
					},
					corrections: [],
				},
			]),
		).toMatchObject({
			summary: {
				foodItems: {
					rice: { kg: 2 * 760 + 200 },
					cannedTomatoes: { cans: 100 + 3 * 384 },
				},
				hygieneItems: {
					washingDetergent: {
						washCycles: 10 * 38 + 10 * 90,
					},
				},
			},
			stats: {
				count: 2,
			},
		}))
})
