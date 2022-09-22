import { Form } from '../../form/form'
import { ulid } from '../../ulid'

const $schema = new URL(`https://example.com/form.schema.json`)
const $id = new URL(`https://example.com/form/${ulid()}`)
export const formWithUnitConversions: Form = {
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
