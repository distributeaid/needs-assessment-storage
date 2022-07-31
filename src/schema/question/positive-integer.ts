import { unit } from './unit.js'

export const positiveIntegerQuestionSchema = {
	type: 'object',
	description: 'A positive non-zero integer',
	examples: [1, 2, 3, 42],
	properties: {
		type: {
			const: 'positive-integer',
		},
		min: {
			description: 'Minimum value',
			type: 'integer',
			minimum: 1,
		},
		max: {
			description: 'Maximum value',
			type: 'integer',
			minimum: 1,
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
