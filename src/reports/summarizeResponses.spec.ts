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
								baseUnit: {
									id: 'kg',
									title: 'Kilogram',
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
								baseUnit: {
									id: 'cans',
									title: 'Cans (#10 kitchen size)',
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
		{
			id: 'hygieneItems',
			title: 'Hygiene items',
			questions: [
				{
					id: 'washingDetergent',
					title: 'Washing Detergent',
					format: {
						type: 'non-negative-integer',
						units: [
							// In this definition the two units are converted, however `wash cycles` is not selectable for the response
							{
								id: 'bottle1l',
								title: '1L bottle',
								baseUnit: {
									id: 'washCycles',
									title: 'wash cycles',
									conversionFactor: 38,
								},
							},
							{
								id: 'bag5k',
								title: '5k bag',
								baseUnit: {
									id: 'washCycles',
									title: 'wash cycles',
									conversionFactor: 90,
								},
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
