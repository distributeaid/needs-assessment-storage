import { Form } from '../form/form'
import { formSchema } from '../schema/form'
import { validateWithJSONSchema } from '../schema/validateWithJSONSchema'
import { ulid } from '../ulid'
import { summarizeResponses } from './summarizeResponses'

const $schema = new URL(`https://example.com/form.schema.json`)
const $id = new URL(`https://example.com/form/${ulid()}`)
const schema = formSchema({
	$id,
})
const form: Form = {
	$schema: $schema.toString(),
	$id: $id.toString(),
	sections: [
		{
			id: 'foodItems',
			title: 'Food items',
			questions: [
				{
					id: 'rice',
					title: 'Rice',
					format: {
						type: 'positive-integer',
						units: [
							{
								id: 'epal',
								title: 'Euro pallets',
								toBaseUnit: {
									baseUnitId: 'kg',
									conversionFactor: 760,
								},
							},
							{
								id: 'kg',
								title: 'Kilogram',
							},
						],
					},
				},
				{
					id: 'cannedTomatoes',
					title: 'Canned Tomatoes',
					format: {
						type: 'positive-integer',
						units: [
							{
								id: 'epal',
								title: 'Euro pallets',
								toBaseUnit: {
									baseUnitId: 'cans',
									conversionFactor: 384,
								},
							},
							{
								id: 'cans',
								title: 'Cans (#10 kitchen size)',
							},
						],
					},
				},
			],
		},
	],
}

describe('reports', () => {
	test('a form with unit conversion can be defined', () => {
		const validForm = validateWithJSONSchema({
			schema,
		})(form)
		expect('errors' in validForm).toBe(false)
	})
	test('responses can be summarized', () =>
		expect(
			summarizeResponses(form, [
				{
					id: ulid(),
					response: {
						foodItems: {
							rice: [2, 'epal'],
							cannedTomatoes: [100, 'cans'],
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
					},
					corrections: [],
				},
			]),
		).toMatchObject({
			foodItems: {
				rice: { kg: 2 * 760 + 200 },
				cannedTomatoes: { cans: 100 + 3 * 384 },
			},
		}))
})
