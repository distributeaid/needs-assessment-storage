import { formSchema } from '../schema/form'
import { validateWithJSONSchema } from '../schema/validateWithJSONSchema'
import { ulid } from '../ulid'
import { summarizeResponses } from './summarizeResponses'
import { formWithUnitConversions } from './test-data/formWithUnitConversions'
import { formWithUnitConversionsAndRegionAndTimeOfYear } from './test-data/formWithUnitConversionsAndRegionAndTimeOfYear'

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

	test('summaries can be grouped', () =>
		expect(
			summarizeResponses(
				formWithUnitConversionsAndRegionAndTimeOfYear,
				[
					{
						id: ulid(),
						response: {
							basicInfo: {
								region: 'samos',
							},
							timeOfYear: {
								quarter: 'q1',
							},
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
							basicInfo: {
								region: 'lesvos',
							},
							timeOfYear: {
								quarter: 'q2',
							},
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
					{
						id: ulid(),
						response: {
							basicInfo: {
								region: 'calais',
							},
							timeOfYear: {
								quarter: 'q2',
							},
							foodItems: {
								rice: [123, 'kg'],
								cannedTomatoes: [4, 'epal'],
							},
							hygieneItems: {
								washingDetergent: [17, 'bag5k'],
							},
						},
						corrections: [],
					},
				],
				[
					['timeOfYear', 'quarter'],
					['basicInfo', 'region'],
				],
			),
		).toMatchObject({
			summary: {
				q1: {
					samos: {
						foodItems: {
							rice: { kg: 2 * 760 },
							cannedTomatoes: { cans: 100 },
						},
						hygieneItems: {
							washingDetergent: {
								washCycles: 10 * 38,
							},
						},
					},
				},
				q2: {
					lesvos: {
						foodItems: {
							rice: { kg: 200 },
							cannedTomatoes: { cans: 3 * 384 },
						},
						hygieneItems: {
							washingDetergent: {
								washCycles: 10 * 90,
							},
						},
					},
					calais: {
						foodItems: {
							rice: { kg: 123 },
							cannedTomatoes: { cans: 4 * 384 },
						},
						hygieneItems: {
							washingDetergent: {
								washCycles: 17 * 90,
							},
						},
					},
				},
			},
			stats: {
				count: 3,
			},
		}))
})
