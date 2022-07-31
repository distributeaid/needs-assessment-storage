import { unit } from './unit'

export const nonNegativeIntegerQuestionSchema = {
	type: 'object',
	description: 'A non-negative integer (including 0)',
	examples: [0, 1, 2, 3, 42],
	properties: {
		type: {
			const: 'non-negative-integer',
		},
		min: {
			description: 'Minimum value',
			type: 'integer',
			minimum: 0,
		},
		max: {
			description: 'Maximum value',
			type: 'integer',
			minimum: 0,
		},
		units: {
			description: 'Unit of the value',
			type: 'array',
			minItems: 1,
			items: unit,
		},
	},
	additionalProperties: false,
	required: ['type', 'units'],
} as const
